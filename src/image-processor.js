const sharp = require('sharp')
const path = require('path')
const fs = require('fs').promises

/**
 * Process and optimize an image file.
 *
 * @param {string} inputPath - Path to the input image file.
 * @param {string} outputDir - Base output directory.
 * @param {string} relativePath - Relative path of the file from the input root.
 * @param {object} options - Optimization options (quality, width, height, etc).
 */
async function processImage (inputPath, outputDir, relativePath, options) {
  const { maxWidth, maxHeight, quality, compressionLevel } = options
  const outputPath = path.join(outputDir, relativePath)

  // Ensure output directory exists (recursive)
  const dir = path.dirname(outputPath)
  await fs.mkdir(dir, { recursive: true })

  try {
    const image = sharp(inputPath)

    let transform = image
    if (maxWidth || maxHeight) {
      transform = transform.resize({
        width: maxWidth || null,
        height: maxHeight || null,
        fit: 'inside', // Maintain aspect ratio
        withoutEnlargement: true
      })
    }

    const ext = path.extname(inputPath).toLowerCase()
    const filename = path.basename(inputPath, ext)

    const tasks = []

    // Helper to check if a format is requested
    const shouldProcess = (fmt) => options.formats.includes(fmt)
    const processSource = shouldProcess('source')

    // Original format optimization
    if (processSource) {
      if (ext === '.jpg' || ext === '.jpeg') {
        tasks.push(transform.clone().jpeg({ quality }).toFile(outputPath))
      } else if (ext === '.png') {
        tasks.push(transform.clone().png({ quality, compressionLevel }).toFile(outputPath))
      }
    }

    if (shouldProcess('webp')) {
      const webpPath = path.join(dir, filename + '.webp')
      tasks.push(transform.clone().webp({ quality }).toFile(webpPath))
    }

    if (shouldProcess('avif')) {
      const avifPath = path.join(dir, filename + '.avif')
      tasks.push(transform.clone().avif({ quality, effort: 4 }).toFile(avifPath))
    }

    await Promise.all(tasks)
    return { success: true, file: relativePath }
  } catch (error) {
    return { success: false, file: relativePath, error: error.message }
  }
}

module.exports = {
  processImage
}
