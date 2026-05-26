# 网页字体大小调整器发布资料包

本目录收集 Edge Add-ons 和 Chrome Web Store 发布时需要使用的文件。

## 目录内容

```text
release-assets/
  package/
    font-size-adjuster-1.0.0.zip
  store-assets/
    icon128.png
    store-logo-300.png
    promo-small-440x280.png
    promo-small-en-440x280.png
    promo-small-zh-CN-440x280.png
    screenshot-en-1280x800.png
    screenshot-zh-CN-1280x800.png
  listing/
    STORE_LISTING.en.md
    STORE_LISTING.zh-CN.md
    PRIVACY_POLICY.en.md
    PRIVACY_POLICY.zh-CN.md
    SUBMISSION_CHECKLIST.md
```

## 上传文件

扩展包：

```text
package/font-size-adjuster-1.0.0.zip
```

商店图标：

```text
store-assets/store-logo-300.png
```

小推广图：

```text
store-assets/promo-small-en-440x280.png
store-assets/promo-small-zh-CN-440x280.png
```

截图：

```text
store-assets/screenshot-en-1280x800.png
store-assets/screenshot-zh-CN-1280x800.png
```

## 发布前必须确认

- 隐私政策已经放到公开 URL，并能匿名访问。
- 中英文隐私政策已经放到公开 URL，并能匿名访问。
- 中英文商店介绍里的支持联系方式已经改成真实联系方式。
- 上传的是 `package/font-size-adjuster-1.0.0.zip`，不是整个项目目录。
- Chrome / Edge 后台填写的版本号与 `manifest.json` 中的 `1.0.0` 一致。
- 如果要支持本地 HTML 文件，发布说明中保留“允许访问文件网址”的说明。

## 官方入口

- Edge Partner Center: https://partner.microsoft.com/dashboard
- Chrome Web Store Developer Dashboard: https://chrome.google.com/webstore/devconsole
