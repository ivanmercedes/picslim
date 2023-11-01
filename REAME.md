# PicSlim

**Picslim** is a Node.js package that allows you to optimize images in a specified directory. It supports JPEG and PNG images, and you can control the quality and resizing of the images during optimization.

## Installation

You can install picslim globally using npm:

```bash
npm install -g picslim
```

# Usage

Once installed, you can use the optimizimage command in your terminal. Here's how you can use it:

```
picslim [options]
```

Options:

**-q, --quality [value]:** Set the image quality (1 to 100, default: 80).
**-w, --width [value]:** Set the maximum width allowed (default: 1366).

Example:

```bash
picslim -q 90 -w 1920
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

###  License
This project is licensed under the MIT License. See the LICENSE file for details.


### Author

Ivan Mercedes

