# 网页字体大小调整器

简体中文 | [English](README.en.md)

一个 Chrome 和 Microsoft Edge Manifest V3 扩展，用来按网站调整网页文字大小，并在下次打开同一主域名时自动恢复之前的设置。

## 功能

- 当前页面即时调整字号
- 支持 80% 到 200%
- 按主域名记住设置，例如 `wx.zsxq.com` 和 `articles.zsxq.com` 共用 `zsxq.com`
- 根据浏览器界面语言自动显示英文或简体中文
- 打开已保存网站时自动应用
- 支持重置当前网站
- 不采集、不上传页面内容

## 开发安装

1. 打开 `chrome://extensions` 或 `edge://extensions`。
2. 打开“开发者模式”。
3. 点击“加载已解压的扩展程序”。
4. 选择本目录。

如果要在本地保存的 HTML 文件上测试，需要在扩展详情页打开“允许访问文件网址”。

## 发布包

商店发布包和提交资料在：

```text
release-assets/
```

上传到 Chrome Web Store 或 Microsoft Edge Add-ons 的 zip 文件是：

```text
release-assets/package/font-size-adjuster-1.0.0.zip
```

## 隐私政策

- [English](release-assets/listing/PRIVACY_POLICY.en.md)
- [简体中文](release-assets/listing/PRIVACY_POLICY.zh-CN.md)

## 实现说明

扩展只修改常见文本元素的 `font-size`，不主动修改颜色、背景、图片、边框、间距或其他视觉样式。由于网页布局本身依赖字体大小，放大文字后个别页面可能出现换行或布局变化。

扩展使用 Chrome/Edge 官方 `_locales` 机制做国际化，当前包含：

- `en`
- `zh_CN`
