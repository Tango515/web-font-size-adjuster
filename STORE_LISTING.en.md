# Store Listing Materials

## Basic Information

Extension name: Web Font Size Adjuster

Short description: Adjust and remember webpage text size per website while keeping the original page style as much as possible.

Recommended category: Accessibility

Mature content: No

Remote code: No

## Detailed Description

Web Font Size Adjuster helps you set a more comfortable text size for different websites. You can increase or decrease text size on the current page instantly, or enable "Remember this site" so the extension automatically restores your preferred text size the next time you visit the same main domain.

Settings are saved by main domain. For example, `wx.zsxq.com` and `articles.zsxq.com` share the same `zsxq.com` font size setting. This keeps reading preferences consistent across subdomains of the same service.

Main features:

- Adjust webpage text size with a slider
- Supports 80% to 200% scale
- A- / A+ quick adjustment buttons
- Common preset scales
- Remember settings by main domain
- Reset settings for the current site
- Supports local HTML files after the user allows file URL access

Privacy:

The extension does not upload webpage content, read account data, cookies, or form data, and does not use advertising, analytics, or remote logging services. It only stores a website identifier and font size scale so your preference can be restored on your next visit.

Technical note:

The extension uses Manifest V3 and does not load remote code. Font size changes are applied locally in your browser. The extension only changes the `font-size` style of text elements and does not intentionally modify colors, backgrounds, images, borders, or other visual styles. Because webpage layouts depend on font size, some pages may reflow or wrap differently when text is enlarged.

## Permission Explanations

`storage`: Saves the user's font size preference for websites.

`activeTab`: Reads the current tab after the user clicks the extension and sends adjustment commands.

`scripting`: Injects the content script when the current page has not loaded it yet, so text size can be adjusted immediately.

`http://*/*`, `https://*/*`: Automatically applies saved font size settings when webpages open.

`file:///*`: Supports local HTML files after the user enables file URL access for the extension.

## Privacy Form Suggestions

Single purpose:

Adjust webpage text size by website and restore the user's saved font size preference when they revisit the same site.

Remote code:

No. The extension does not load or execute remotely hosted code.

Data collection:

The extension does not collect personal data. It only stores local preferences, including the website identifier, font size scale, and update time, to restore user settings.

## Certification Test Notes

Test account: Not required.

Test steps:

1. Install the extension.
2. Open any webpage.
3. Click the extension icon.
4. Use the slider or A- / A+ buttons to adjust text size.
5. Enable "Remember this site".
6. Refresh the page and confirm that the font size setting is restored automatically.
7. Click "Reset" and confirm that the current site returns to the default font size.

This extension does not require login, does not access a remote service, and does not load remote code.
