const fs = require('fs').promises

/**
 * Load settings from a configuration file.
 * @param {string} [configFile] - Path to the configuration file.
 */
async function loadConfig (configFile) {
  let config = {}
  const defaultConfigFile = 'config.json'

  // Try to load user provided config or default config
  const fileToLoad = configFile || defaultConfigFile

  try {
    const configData = await fs.readFile(fileToLoad, 'utf8')
    config = JSON.parse(configData)
  } catch (error) {
    if (configFile) {
      // If user explicitly provided a path and it failed, we should probably warn
      // But for now we fall back to defaults effectively by returning empty/default obj
    }
    // Try to load default from package if local config not found
    try {
      config = require('../config.json')
    } catch (e) {
      config = {}
    }
  }

  // Set defaults
  if (!config.inputDir) config.inputDir = './'
  if (!config.outputDir) config.outputDir = './min'
  if (!config.quality) config.quality = 80
  if (config.maxWidth === undefined) config.maxWidth = null
  if (config.maxHeight === undefined) config.maxHeight = null
  if (!config.compressionLevel) config.compressionLevel = 9
  if (!config.formats) config.formats = ['source']

  return config
}

module.exports = {
  loadConfig
}
