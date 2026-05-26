# 打包说明

发布包路径：

```text
D:\Documents\Playground\chrome-font-size-adjuster\dist\font-size-adjuster-1.0.0.zip
```

该 zip 包应只包含扩展运行所需文件：

- `manifest.json`
- `popup.html`
- `popup.css`
- `popup.js`
- `content.js`
- `storage.js`
- `_locales/**/messages.json`
- `icons/*.png`

不要把测试网页、商店文档或开发说明放进发布 zip。

PowerShell 打包命令：

```powershell
cd D:\Documents\Playground\chrome-font-size-adjuster
$stage = ".package-stage"
New-Item -ItemType Directory -Force "$stage\icons" | Out-Null
Copy-Item manifest.json,popup.html,popup.css,popup.js,content.js,storage.js $stage
Copy-Item icons\icon16.png,icons\icon48.png,icons\icon128.png "$stage\icons"
Copy-Item -Recurse _locales "$stage\_locales"
Compress-Archive -Force -Path "$stage\*" -DestinationPath dist\font-size-adjuster-1.0.0.zip
Remove-Item -Recurse -Force $stage
```
