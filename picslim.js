#!/usr/bin/env node
const fs = require("fs");
const sharp = require("sharp");
const yargs = require("yargs");

/**
 * Parses command line arguments using yargs library.
 *
 * @typedef {Object} Argv
 * @property {number} quality - Image quality (1 to 100)
 * @property {number} width - Maximum width allowed
 * @property {number} compressionLevel - PNG compression level (0 to 9)
 */

const argv = yargs.options({
  q: {
    alias: "quality",
    describe: "Image quality (1 to 100)",
    demandOption: false,
    type: "number",
    default: 80,
  },
  mw: {
    alias: "maxWidth",
    describe: "Maximum width allowed",
    demandOption: false,
    type: "number",
    default: null,
  },
  mh: {
    alias: "maxHeight",
    describe: "Maximum height allowed",
    demandOption: false,
    type: "number",
    default: null,
  },
  c: {
    alias: "compressionLevel",
    describe: "PNG compression level (0 to 9)",
    demandOption: false,
    type: "number",
    default: 9,
  },
}).argv;

const inputDir = "./";
const outputDir = "./min";
const quality = argv.quality;
const maxWidth = argv.maxWidth;
const maxHeight = argv.maxHeight;
const compressionLevel = argv.compressionLevel;

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
          const originalHeight = metadata.height;
          sharp(inputPath)
            .resize(
              originalWidth > maxWidth ? maxWidth : null,
              originalHeight > maxHeight ? maxHeight : null,
            )
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
      sharp(inputPath)
        .metadata()
        .then((metadata) => {
          const originalWidth = metadata.width;
          const originalHeight = metadata.height;
          sharp(inputPath)
            .resize(
              originalWidth > maxWidth ? maxWidth : null,
              originalHeight > maxHeight ? maxHeight : null,
            )
            .png({
              quality,
              compressionLevel,
            })
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
