# Web Font Size Adjuster

[简体中文](README.zh-CN.md) | English

A Chrome and Microsoft Edge Manifest V3 extension that adjusts webpage text size by website and restores saved preferences when you revisit the same main domain.

## Features

- Adjust text size on the current page instantly
- Supports 80% to 200% scale
- Remembers settings by main domain, so `wx.zsxq.com` and `articles.zsxq.com` share `zsxq.com`
- Automatically follows the browser UI language, currently English and Simplified Chinese
- Automatically applies saved settings when a site opens
- Resets settings for the current site
- Does not collect or upload webpage content

## Install for Development

1. Open `chrome://extensions` or `edge://extensions`.
2. Turn on Developer mode.
3. Click "Load unpacked".
4. Select this directory.

To test on local saved HTML files, enable "Allow access to file URLs" on the extension details page.

## Release Package

The store-ready package and listing materials are in:

```text
release-assets/
```

Upload this zip file to Chrome Web Store or Microsoft Edge Add-ons:

```text
release-assets/package/font-size-adjuster-1.0.0.zip
```

## Privacy Policy

- [English](release-assets/listing/PRIVACY_POLICY.en.md)
- [Simplified Chinese](release-assets/listing/PRIVACY_POLICY.zh-CN.md)

## Implementation Notes

The extension changes only the `font-size` style of common text elements. It does not intentionally modify colors, backgrounds, images, borders, spacing, or other visual styling. Because webpage layouts depend on text size, some pages may reflow or wrap differently after enlargement.

The extension uses Chrome/Edge `_locales` for i18n and includes:

- `en`
- `zh_CN`
