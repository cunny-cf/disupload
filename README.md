# DisUpload

DisUpload is a simple web application designed to upload files to Discord channels using webhooks. Files under 10MB are sent directly to Discord, while files larger than 10MB but under 5GB (FileDitch's limit) are first uploaded to FileDitch and then linked in Discord. For large video files, links are generated through Autocompressor.

> **Note**: This project is intended for personal use. If you wish to use it, please avoid spamming or misuse, as violating the service terms could result in bans from FileDitch or Discord.

**Sample Site**: [DisUpload Demo](https://upload.nekoslime.site)

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Dependencies](#dependencies)
- [Configuration](#configuration)
- [License](#license)

## Features
- **Direct Uploads to Discord**: Files under 10MB are uploaded directly to Discord through a specified webhook.
- **FileDitch Integration**: Files larger than 10MB but less than 5GB are uploaded to FileDitch, then linked in Discord.
- **Auto Compression for Large Videos**: Large video files are linked using Autocompressor for an optimized viewing experience.

## Installation
1. Clone or download this repository to your local machine.
2. Ensure that the files are accessible via a web server or open `index.html` directly in a browser.

## Usage
1. Open the `index.html` file in a web browser.
2. Enter the Discord webhook URL.
3. Select files or folders to upload.
4. Click on the "Upload" button to start uploading.

## Dependencies
- **FileDitch API**: For hosting larger files before sending to Discord (limited to files under 5GB).
- **Autocompressor**: Used to generate viewable links for large video files.
- **Discord Webhooks**: For posting files and links to a Discord channel.

## Configuration
- **Webhook URL**: Users must provide a valid Discord webhook URL for uploads to succeed.

## License
This project is licensed under the MIT License.
