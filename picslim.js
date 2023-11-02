#!/usr/bin/env node
const fs = require('fs').promises
const sharp = require('sharp')
const yargs = require('yargs')

/**
 * Parses command line arguments using yargs library.
 */
function parseArguments () {
  return yargs.options({
    c: {
      alias: 'config',
      describe: 'Path to the configuration file',
      demandOption: false,
      type: 'string',
      default: 'config.json'
    },
    q: {
      alias: 'quality',
      describe: 'Image quality',
      demandOption: false,
      type: 'number',
      default: null
    },
    l: {
      alias: 'compressionLevel',
      describe: 'PNG compression level',
      demandOption: false,
      type: 'number',
      default: null
    },
    w: {
      alias: 'maxWidth',
      describe: 'Maximum width allowed',
      demandOption: false,
      type: 'number',
      default: null
    },
    h: {
      alias: 'maxHeight',
      describe: 'Maximum height allowed',
      demandOption: false,
      type: 'number',
      default: null
    },
    i: {
      alias: 'input',
      describe: 'Path to the input directory',
      demandOption: false,
      type: 'string',
      default: null
    },
    o: {
      alias: 'output',
      describe: 'Path to the output directory',
      demandOption: false,
      type: 'string',
      default: null
    }
  }).argv
}

/**
 * Creates an output directory if it doesn't exist.
 * @param {string} dir - The directory path to create.
 * @returns {Promise<void>}
 */
async function createOutputDirectory (dir) {
  try {
    await fs.access(dir)
  } catch (error) {
    await fs.mkdir(dir)
  }
}

/**
 * Process and optimize an image file.
 *
 * @param {string} inputPath - Path to the input image file.
 * @param {string} outputPath - Path to the output image file.
 * @param {string} file - The file name.
 * @param {number} maxWidth - Maximum width allowed.
 * @param {number} maxHeight - Maximum height allowed.
 * @param {number} quality - Image quality.
 * @param {number} compressionLevel - PNG compression level.
 */
async function processImage (inputPath, outputPath, file, maxWidth, maxHeight, quality, compressionLevel) {
  try {
    const image = sharp(inputPath)
    const metadata = await image.metadata()
    const originalWidth = metadata.width
    const originalHeight = metadata.height
    const imageProcessor = image.resize(
      originalWidth > maxWidth ? maxWidth : null,
      originalHeight > maxHeight ? maxHeight : null
    )

    if (file.match(/\.(jpg|jpeg)$/i)) {
      await imageProcessor.jpeg({ quality }).toFile(outputPath)
      console.log(`Optimized JPEG image: ${file}`)
    } else if (file.match(/\.(png)$/i)) {
      await imageProcessor.png({ quality, compressionLevel }).toFile(outputPath)
      console.log(`Optimized PNG image: ${file}`)
    }
  } catch (error) {
    // console.error(`Optimization error ${file}: `, error)
  }
}

/**
 * Load settings from a configuration file. If the specified configuration file doesn't exist,
 * it will use the default 'config.json' from the package.
 *
 * @param {string} configFile - Path to the configuration file.
 */
async function loadConfig (configFile) {
  let config
  try {
    const configData = await fs.readFile(configFile, 'utf8')
    config = JSON.parse(configData)
  } catch (error) {
    console.error('Using the default configuration from the package. ✅')
    config = require('./config.json') // Load default configuration from the package
  }

  if (!validateConfigObject(config)) {
    console.error('Invalid configuration object.')
    process.exit(1)
  }

  if (!config.inputDir || !config.outputDir) {
    console.error("Configuration error: 'inputDir' and 'outputDir' are required fields.")
    process.exit(1)
  }

  return config
}

/**
 * Validate the configuration object.
 *
 * @param {object} config - The loaded configuration object.
 */
function validateConfigObject (config) {
  return (
    typeof config === 'object' &&
    !Array.isArray(config) &&
    config.inputDir &&
    config.outputDir
  )
}

/**
 * Returns the input directory path based on the provided arguments and configuration.
 * If the provided arguments or configuration are '.', returns the current working directory.
 * @param {string} argvInput - The input directory path provided as an argument.
 * @param {string} configInputDir - The input directory path provided in the configuration.
 * @returns {string} - The input directory path.
 */
function getInputDirectory (argvInput, configInputDir) {
  if (argvInput === '.' || configInputDir === '.') {
    return process.cwd()
  }

  return argvInput || configInputDir
}

/**
 * The main function that processes all image files in the input directory.
 */
async function main () {
  const argv = parseArguments()
  const config = await loadConfig(argv.config)
  const inputDir = getInputDirectory(argv.input, config.inputDir)
  const outputDir = getInputDirectory(argv.output, config.outputDir)
  const quality = argv.quality ? argv.quality : config.quality
  const maxWidth = argv.maxWidth ? argv.maxWidth : config.maxWidth
  const maxHeight = argv.maxHeight ? argv.maxHeight : config.maxHeight
  const compressionLevel = argv.compressionLevel ? argv.compressionLevel : config.compressionLevel

  await createOutputDirectory(outputDir)

  try {
    const files = await fs.readdir(inputDir)
    for (const file of files) {
      const inputPath = `${inputDir}/${file}`
      const outputPath = `${outputDir}/${file}`
      await processImage(inputPath, outputPath, file, maxWidth, maxHeight, quality, compressionLevel)
    }
  } catch (error) {
    console.error('Error reading input directory: ', error)
  }
}

main()
