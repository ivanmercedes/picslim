const fs = require("fs");
const sharp = require("sharp");
const yargs = require("yargs");

/**
 * Parses command line arguments using yargs library.
 *
 * @typedef {Object} Argv
 * @property {number} quality - Image quality (1 to 100)
 * @property {number} width - Maximum width allowed
 */

const argv = yargs.options({
  q: {
    alias: "quality",
    describe: "Image quality (1 to 100)",
    demandOption: false,
    type: "number",
    default: 80,
  },
  w: {
    alias: "width",
    describe: "Maximum width allowed",
    demandOption: false,
    type: "number",
    default: 1366,
  },

}).argv;

const inputDir = "./";
const outputDir = "./min";
const quality = argv.quality;
const maxWidth = argv.width;

/**
 * Verifies if the output directory exists; if not, creates it.
 *
 * @param {string} dir - The directory to verify.
 */
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

fs.readdir(inputDir, (err, files) => {
  if (err) {
    console.error("Error reading input directory: ", err);
    return;
  }

  files.forEach((file) => {
    const inputPath = `${inputDir}/${file}`;
    const outputPath = `${outputDir}/${file}`;

    if (file.match(/\.(jpg|jpeg)$/i)) {
      sharp(inputPath)
        .metadata()
        .then((metadata) => {
          const originalWidth = metadata.width;
          sharp(inputPath)
            .resize(originalWidth > maxWidth ? maxWidth : null)
            .jpeg({
              quality,
            })
            .toFile(outputPath, (err, info) => {
              if (err) {
                console.error(`Optimization error ${file}: `, err);
              } else {
                console.log(`Optimized PNG image: ${file}`);
              }
            });
        });
    } else if (file.match(/\.(png)$/i)) {
      const compressionLevel = (quality / 100) * 10;
      const limitedCompressionLevel = Math.min(
        Math.max(compressionLevel, 0),
        9,
      );
      sharp(inputPath)
        .metadata()
        .then((metadata) => {
          const originalWidth = metadata.width;

          sharp(inputPath)
            .resize(originalWidth > maxWidth ? maxWidth : null)
            .png({ compressionLevel: limitedCompressionLevel })
            .toFile(outputPath, (err, info) => {
              if (err) {
                console.error(`Optimization error ${file}: `, err);
              } else {
                console.log(`Optimized PNG image: ${file}`);
              }
            });
        });
    }
  });
});
