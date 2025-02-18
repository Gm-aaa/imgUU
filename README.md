[简体中文](./README.zh-CN.md) · **English**

# imgUU - ImageHosting Github login + Cloudflare R2 + D1 + Astro SSR

## Project Overview

This project is an open-source image upload tool designed to help users easily upload images to a Cloudflare R2 bucket and manage their image hosting needs. It provides a simple and efficient way to integrate with Cloudflare R2, allowing users to host images for free while maintaining full control over their data.

![](https://imgs.imguu.net/2025/2/9/60a6d0fdb1f8f1ebf828dafefd1cf4fc.webp)


## Features

- **Free and Open-Source**: This tool is completely free and open-source, allowing users to modify and extend it according to their needs.
- **Cloudflare R2 Integration**: Seamlessly integrates with Cloudflare R2, leveraging its reliable and scalable storage infrastructure.
- **Customizable Configuration**: Users can easily configure the tool to match their specific requirements, including bucket settings and domain associations.
- **User-Friendly Interface**: The tool provides an intuitive and user-friendly interface for uploading images and managing uploads.
- **Support for Multiple Formats**: Supports various image formats and can be extended to support additional formats as needed.


## Open Source & imguu.net

|    feature     | Open Source   | imguu.net |
|----------------|---------|--------|
| Github login  | ✅     | ✅     |
| Upload website config     | ✅     | ✅     |
| Storage config      | ✅     | ✅     |
| Upload records    | ✅     | ✅     |
| Convert to WebP    | ❌     | ✅     |


## Getting Started

### Prerequisites

- A Cloudflare account.
- A domain that is already configured with Cloudflare.

### Setup

[Deatil Doc](https://imguu.net/doc/)


1. **Create a Cloudflare R2 Bucket**:
   - Log in to your Cloudflare account.
   - Navigate to the **R2 Object Storage** section.
   - Create a bucket named `imguu` (or any name you prefer).
   - Set the location based on your target audience's region and choose the standard storage class.

2. **Create an API Token**:
   - Create an API token with access to the specified bucket.
   - Set the TTL to permanent (or as needed).
   - After creation, you will receive the following configuration parameters:
     - `accessKeyId`
     - `secretAccessKey`
     - `accountId`

3. **Associate the Bucket with a Domain**:
   - Navigate to the `imguu` bucket settings.
   - Enter a domain (either the main domain or a subdomain) hosted on Cloudflare.
   - Follow the prompts to connect the domain with the bucket.

4. **Configure the Tool**:
   - Log in to the tool using your GitHub account.
   - Enter the bucket configuration details obtained from Cloudflare.
   - Set up the upload site and path templates as needed.

5. **Upload and Test**:
   - Select the upload site.
   - Drag and drop or copy and paste images into the upload window.
   - Click "Upload" to start the process.

6. **View Upload Records**:
   - You can view the upload records in the tool's backend.


## Deploy Self

1. Get github login config

  github.com -> Settings -> Developer Settings -> OAuth Apps -> New OAuth App

2. Config `.env`

  ```
  cp .env.example .env
  ```

3. Init D1 database

  ```
  npm run initSql
  ```

4. Deploy

  ```
  npm run deploy
  ```


## Contributing

We welcome contributions from the community! If you would like to contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or fix.
3. Make your changes and commit them.
4. Push your changes to your fork.
5. Submit a pull request to the main repository.

## Support

If you encounter any issues or have questions, please feel free to open an issue on the GitHub repository. We are here to help!

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

This project is inspired by the need for a simple and efficient image hosting solution. Special thanks to the [Cloudflare](https://www.cloudflare.com) team for providing such a powerful and reliable storage service.


[![](https://webviso.yestool.org/buymeacoffee.png)](https://buymeacoffee.com/3dqjgnimhl)
