const fs = require('fs').promises
const path = require('path')

/**
 * Recursively walks through a directory and returns an array of file paths.
 * @param {string} dir - The directory to walk.
 * @returns {Promise<string[]>} - Array of file paths.
 */
async function walkDirectory (dir) {
  let results = []
  try {
    const list = await fs.readdir(dir)
    for (const file of list) {
      const filePath = path.join(dir, file)
      const stat = await fs.stat(filePath)
      if (stat && stat.isDirectory()) {
        const subResults = await walkDirectory(filePath)
        results = results.concat(subResults)
      } else {
        results.push(filePath)
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`Error walking directory ${dir}:`, error.message)
    }
  }
  return results
}

/**
 * Check if a file is a supported image.
 * @param {string} file - The file path.
 * @returns {boolean}
 */
function isImage (file) {
  return /\.(jpg|jpeg|png)$/i.test(file) // We will eventually support more, but input is usually these.
}

module.exports = {
  walkDirectory,
  isImage
}
