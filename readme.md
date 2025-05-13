# QRQ

A Chrome browser extension for quick QR code generation and recognition.

[中文文档](README.zh.md)

## Introduction

QRQ is named after the first two letters of "QR code" (Quick Response code), styled like an emoticon similar to "qwq".

⁽(◍˃̵͈̑ᴗ˂̵͈̑)⁽

₍ᐢ •͈ ༝ •͈ ᐢ₎♡

ฅ՞•ﻌ•՞ฅ

QRQ

## Features

### QR Code Generation

- [x] Convert selected **text** on web pages to QR codes via right-click menu
- [x] Convert **image links** on web pages to QR codes via right-click menu
  - Note: Initially planned to encode images using base64, but due to size limitations of QR codes, only image URLs are converted
- [ ] *(Deprecated)* Quick conversion of current webpage URL to QR code
   - This feature is no longer necessary as Chrome now includes built-in functionality for generating QR codes for the current webpage URL.

### QR Code Recognition

- [x] Recognize QR codes in web page images
- [ ] *(Planned)* Recognize QR codes outside the browser
   - Due to security concerns, it is currently quite difficult to directly read local files using JavaScript in Chrome. Therefore, implementing this functionality requires additional permissions or must be achieved indirectly through other means, such as background services.

More features coming...

## Installation

1. Download the extension from Chrome Web Store (coming soon)
2. Or install manually:
   - Clone this repository
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the extension directory

## Usage

1. **Generate QR Code from Text**
   - Select any text on a webpage
   - Right-click and choose "Generate Text QR Code"

2. **Generate QR Code from Image**
   - Right-click on any image
   - Choose "Generate Image Link QR Code"

3. **Recognize QR Code**
   - Right-click on an image containing a QR code
   - Choose "Recognize QR Code in Image"

## Credits

- AI Programming Assistant: [Cursor](https://www.cursor.com/)
- Icon Generator: [AppIcon Forge](https://zhangyu1818.github.io/appicon-forge/)

## License

MIT License
