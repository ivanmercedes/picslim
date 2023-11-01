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
    }
  }).argv
}

/**
 * Verifies if the output directory exists; if not, creates it.
 *
 * @param {string} dir - The directory to verify.
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
    console.error(`Optimization error ${file}: `, error)
  }
}

/**
 * Load settings from a configuration file.
 *
 * @param {string} configFile - Path to the configuration file.
 */
async function loadConfig (configFile) {
  try {
    const configData = await fs.readFile(configFile, 'utf8')

    if (configData.trim() === '') {
      console.error('Configuration file is empty.')
      process.exit(1)
    }

    if (!validateJson(configData)) {
      console.error('Configuration file is not a valid JSON object.')
      process.exit(1)
    }

    const config = JSON.parse(configData)

    validateConfig(config)

    if (typeof config !== 'object' || Array.isArray(config)) {
      console.error('Configuration file is not a valid JSON object.')
      process.exit(1)
    }

    if (!config.inputDir || !config.outputDir) {
      console.error("Configuration error: 'inputDir' and 'outputDir' are required fields.")
      process.exit(1)
    }

    return config
  } catch (error) {
    console.error('Error loading or parsing the configuration file: ', error)
    process.exit(1)
  }
}

function validateJson (json) {
  const isJson = (str) => {
    try {
      JSON.parse(str)
    } catch (e) {
      // Error
      // JSON is not okay
      return false
    }

    return true
  }

  return isJson(json)
}

/**
 * Validate the configuration object.
 *
 * @param {object} config - The loaded configuration object.
 */
function validateConfig (config) {
  if (!config.inputDir || !config.outputDir) {
    console.error("Configuration error: 'inputDir' and 'outputDir' are required fields.")
    process.exit(1)
  }
}

/**
 * The main function that processes all image files in the input directory.
 */
async function main () {
  const argv = parseArguments()
  const config = await loadConfig(argv.config)

  const inputDir = config.inputDir
  const outputDir = config.outputDir
  const quality = config.quality
  const maxWidth = config.maxWidth
  const maxHeight = config.maxHeight
  const compressionLevel = config.compressionLevel

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
