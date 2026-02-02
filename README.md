# PicSlim

**Picslim** is a robust Node.js package that efficiently optimizes images within a specified directory (recursively). It supports **JPEG**, **PNG**, **WebP**, and **AVIF** formats, offering fine-grained control over image quality, resizing, and format conversion.

Features:
- **Fast**: Uses parallel processing to utilize all CPU cores.
- **Recursive**: Optional support for finding images in subdirectories (`-r`).
- **Modern Formats**: Optional support for generating **WebP** and **AVIF**.
- **Smart Resizing**: Maintains aspect ratio and avoids enlarging images.

## Installation

You can install picslim globally using npm:

```bash
npm install -g picslim
```

or run it directly with npx:

```bash
npx picslim
```

# Usage

Once installed, you can use the `picslim` command in your terminal:

```bash
picslim [options]
```

### Options

- `-c, --config <path>`: Path to the configuration file. (default: 'config.json')
- `-q, --quality <number>`: Image quality (0-100).
- `-l, --compressionLevel <number>`: PNG compression level (0-9).
- `-w, --maxWidth <number>`: Maximum width allowed for images.
- `-h, --maxHeight <number>`: Maximum height allowed for images.
- `-i, --input <path>`: Path to the input directory.
- `-o, --output <path>`: Path to the output directory.
- `-f, --formats <list>`: Comma-separated list of output formats (default: Source only). Options: `source`, `webp`, `avif`.
- `-r, --recursive`: Recursively process subdirectories (default: false).

### Configuration File

You can create a `config.json` file in your project directory to specify default settings.

```json
{
  "inputDir": "./in",
  "outputDir": "./min",
  "quality": 80,
  "maxWidth": null,
  "maxHeight": null,
  "compressionLevel": 9,
  "formats": ["source"]
}
```

### Examples

**1. Basic Optimization (Default)**
Optimizes images in the current directory and saves them to `./min`. Keeps original format.
```bash
picslim
```

**2. Custom Input/Output and Resizing**
```bash
picslim -i ./assets -o ./build/assets -w 800
```

**3. Generate WebP Only**
Converts all images to WebP format.
```bash
picslim -f webp
```

**4. Generate Optimized Source + AVIF**
Keeps the original format (optimized) AND generates an AVIF version.
```bash
picslim -f source,avif
```

**5. Recursive Processing**
Process images in the input directory and all its subdirectories.
```bash
picslim -i ./assets -r
```

### License

This project is licensed under the MIT License. See the LICENSE file for details.

### Author

Ivan Mercedes

### Contributors

- [Elminson De Oleo Baez](https://github.com/elminson)