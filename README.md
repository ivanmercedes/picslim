# PicSlim

**Picslim** is a Node.js package that allows you to efficiently optimize images within a specified directory. It supports **JPEG** and **PNG** images, image formats, offering fine-grained control over image quality and resizing options during the optimization process. With **Picslim**, you can effortlessly reduce file sizes and enhance the loading performance of your images.

## Installation

You can install picslim globally using npm:

```bash
npm install -g picslim
```

or

```bash
npx picslim
```

# Usage

Once installed, you can use the optimizimage command in your terminal. Here's how you can use it:

```
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

### Configuration File

You can create a `config.json` file in your project directory to specify default settings. Here's an example configuration:

```json
{
  "inputDir": "./in",
  "outputDir": "./min",
  "quality": 80,
  "maxWidth": null,
  "maxHeight": null,
  "compressionLevel": 9
}
```

### Example:

Optimize images using default settings from the configuration file:

```bash
picslim
```

Optimize images with custom settings:

```bash
picslim -q 90 -w 800 -h 600 -l 4 -i input_images -o output_images
```

This will optimize all JPEG and PNG images in the current directory, and the optimized images will be saved in a 'min' directory.

### Example

Suppose you have a directory with the following images:

- image1.jpg
- image2.jpg
- image3.png
- image4.png

You can optimize all these images with the following command:

```bash
picslim -q 90 -w 1920
```

After running the command, you will have the following directory structure:

```markdown
- min
  - image1.jpg
  - image2.jpg
  - image3.png
  - image4.png
```

### License

This project is licensed under the MIT License. See the LICENSE file for details.

### Author

Ivan Mercedes

### Contributors

- [Elminson De Oleo Baez](https://github.com/elminson)