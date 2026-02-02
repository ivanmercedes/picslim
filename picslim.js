#!/usr/bin/env node
const yargs = require('yargs')
const path = require('path')
const chalk = require('chalk')
const cliProgress = require('cli-progress')
const { loadConfig } = require('./src/config')
const { walkDirectory, isImage } = require('./src/utils')
const { processImage } = require('./src/image-processor')
const os = require('os')

/**
 * Parses command line arguments using yargs library.
 */
function parseArguments () {
  return yargs.options({
    c: {
      alias: 'config',
      describe: 'Path to the configuration file',
      demandOption: false,
      type: 'string'
    },
    q: {
      alias: 'quality',
      describe: 'Image quality',
      type: 'number'
    },
    l: {
      alias: 'compressionLevel',
      describe: 'PNG compression level',
      type: 'number'
    },
    w: {
      alias: 'maxWidth',
      describe: 'Maximum width allowed',
      type: 'number'
    },
    h: {
      alias: 'maxHeight',
      describe: 'Maximum height allowed',
      type: 'number'
    },
    i: {
      alias: 'input',
      describe: 'Path to the input directory',
      type: 'string'
    },
    o: {
      alias: 'output',
      describe: 'Path to the output directory',
      type: 'string'
    },
    f: {
      alias: 'formats',
      describe: 'Output formats (comma separated). Default: source. Options: source, webp, avif',
      type: 'string'
    },
    r: {
      alias: 'recursive',
      describe: 'Process images recursively',
      type: 'boolean',
      default: false
    }
  }).argv
}

async function main () {
  console.log(chalk.blue('picslim - Image Optimization Tool'))

  const argv = parseArguments()

  // Load config (merges defaults, config file, and argv)
  const baseConfig = await loadConfig(argv.config)

  // Parse formats from CLI if present
  let formats = baseConfig.formats
  if (argv.formats) {
    formats = argv.formats.split(',').map(f => f.trim().toLowerCase())
  }

  // Overrides from argv
  const config = {
    ...baseConfig,
    inputDir: argv.input || baseConfig.inputDir,
    outputDir: argv.output || baseConfig.outputDir,
    quality: argv.quality || baseConfig.quality,
    compressionLevel: argv.compressionLevel || baseConfig.compressionLevel,
    maxWidth: argv.maxWidth || baseConfig.maxWidth,
    maxHeight: argv.maxHeight || baseConfig.maxHeight,
    formats,
    recursive: argv.recursive || baseConfig.recursive || false
  }

  const inputDir = path.resolve(config.inputDir)
  const outputDir = path.resolve(config.outputDir)

  console.log(chalk.gray(`Input: ${inputDir}`))
  console.log(chalk.gray(`Output: ${outputDir}`))
  console.log(chalk.gray(`Recursive: ${config.recursive}`))

  // Find files
  console.log('Scanning files...')
  let files = []
  try {
    files = await walkDirectory(inputDir, config.recursive)
  } catch (e) {
    console.error(chalk.red(`Error reading input directory: ${e.message}`))
    process.exit(1)
  }

  // Filter images
  const images = files.filter(isImage)

  if (images.length === 0) {
    console.log(chalk.yellow('No images found to process.'))
    return
  }

  console.log(chalk.green(`Found ${images.length} images. Starting optimization...`))

  // Prepare batch processing
  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
  progressBar.start(images.length, 0)

  const concurrencyLevel = os.cpus().length // Use number of CPU cores

  let completed = 0
  const errors = []

  // Chunking helper
  const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  )

  const batches = chunk(images, concurrencyLevel)

  for (const batch of batches) {
    const promises = batch.map(async (filePath) => {
      const relativePath = path.relative(inputDir, filePath)
      const result = await processImage(filePath, outputDir, relativePath, config)
      completed++
      progressBar.update(completed)
      if (!result.success) {
        errors.push(result)
      }
    })
    await Promise.all(promises)
  }

  progressBar.stop()

  console.log('\n' + chalk.blue('--------------------------------------------------'))
  console.log(chalk.green('Optimization complete!'))
  console.log(`Processed: ${completed}`)
  if (errors.length > 0) {
    console.log(chalk.red(`Errors: ${errors.length}`))
    errors.forEach(e => console.log(chalk.red(` - ${e.file}: ${e.error}`)))
  } else {
    console.log(chalk.green('No errors encountered.'))
  }
  console.log(chalk.blue('--------------------------------------------------'))
}

main()
