[English](./README.md) · **简体中文**

# imgUU - 一个基于Cloudflare D1和R2构建的免费图片上传应用

## 项目概述

这是一个开源的图片上传工具，旨在帮助用户轻松地将图片上传到Cloudflare R2存储桶，并满足他们的图片托管需求。它提供了一种简单高效的方式与Cloudflare R2集成，允许用户免费托管图片，同时完全掌控自己的数据。

![](https://imgs.imguu.net/2025/2/9/60a6d0fdb1f8f1ebf828dafefd1cf4fc.webp)

## 功能特点

- **免费开源**：此工具完全免费且开源，用户可以根据自己的需求进行修改和扩展。
- **Cloudflare R2集成**：无缝集成Cloudflare R2，利用其可靠且可扩展的存储基础设施。
- **可自定义配置**：用户可以轻松配置工具以满足特定需求，包括存储桶设置和域名关联。
- **用户友好界面**：工具提供直观且用户友好的界面，方便上传图片和管理上传记录。
- **支持多种格式**：支持多种图片格式，可根据需要扩展支持更多格式。

## 开源 & imguu.net

|    功能        | 开源版   | imguu.net |
|----------------|---------|--------|
| Github登陆管理  | ✅     | ✅     |
| 上传站点配置    | ✅     | ✅     |
| 存储桶配置      | ✅     | ✅     |
| 上传记录查看    | ✅     | ✅     |
| 图片转webp     | ❌     |  ✅   |

如果用imguu.net, 请我喝杯咖啡，可以给你的账号开通转webp功能。

之所以这个功能没有开源只是因为Cloudflare不是Node,它无法调用一些常用的图片处理功能，很多都要花钱。
我自己写了个 [convert to webp api](https://github.com/yestool/convert-to-webp)进行处理，部署到我的vps上,维护vps也要花钱的。

如果你也希望能用上webp(可以压缩画质，互联网访问快，对seo优化有利)，也可以自己让AI帮你集成到这个项目中，调用自己的api。


## 开始使用

### 前提条件

- Cloudflare账号。
- 一个已配置到Cloudflare的域名。

### 设置步骤

手把手设置教程请查看 [配图文档](https://imguu.net/zh/doc/)


1. **创建Cloudflare R2存储桶**：
   - 登录Cloudflare账号。
   - 导航到**R2对象存储**部分。
   - 创建一个名为`imguu`（或任何你喜欢的名称）的存储桶。
   - 根据目标受众的地区设置存储桶位置，并选择标准存储类别。

2. **创建API令牌**：
   - 创建一个具有指定存储桶访问权限的API令牌。
   - 将TTL设置为永久（或根据需要设置）。
   - 创建完成后，你将获得以下配置参数：
     - `accessKeyId`
     - `secretAccessKey`
     - `accountId`

3. **将存储桶与域名关联**：
   - 导航到`imguu`存储桶的设置。
   - 输入托管在Cloudflare上的域名（主域名或子域名均可）。
   - 按提示将域名与存储桶关联。

4. **配置工具**：
   - 使用GitHub账号登录工具。
   - 输入从Cloudflare获得的存储桶配置详情。
   - 根据需要设置上传站点和路径模板。

5. **上传测试**：
   - 选择上传站点。
   - 将图片拖拽或复制粘贴到上传窗口。
   - 点击“上传”开始上传过程。

6. **查看上传记录**：
   - 你可以在工具的后台查看上传记录。

## 自行部署

1. 在github后台获取登陆参数

  github.com -> Settings -> Developer Settings -> OAuth Apps -> New OAuth App

2. 设置环境变量 `.env`

  ```
  cp .env.example .env
  ```

3. 初始化数据库

  ```
  npm run initSql
  ```

4. 部署到cloudflare worker

  ```
  npm run deploy
  ```

## 贡献指南

我们欢迎社区的贡献！如果你希望贡献，请按照以下步骤操作：

1. 叉取（fork）仓库。
2. 创建一个新的分支用于你的功能或修复。
3. 进行更改并提交。
4. 将更改推送到你的fork。
5. 向主仓库提交拉取请求（pull request）。

## 支持

如果你遇到任何问题或有疑问，请随时在GitHub仓库中提交问题。我们随时为你提供帮助！

## 许可证

本项目采用MIT许可证。详情请参阅[LICENSE](LICENSE)文件。

## 致谢

本项目源于对简单高效图片托管解决方案的需求。特别感谢[Cloudflare](https://www.cloudflare.com)团队提供如此强大且可靠的存储服务。

[![](https://webviso.yestool.org/buymeacoffee.png)](https://buymeacoffee.com/3dqjgnimhl)