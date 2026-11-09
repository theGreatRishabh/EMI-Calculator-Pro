# Extension Build & Packaging Instructions

This document provides step-by-step instructions for building, versioning, testing, and packaging the **Smart EMI Planner Chrome & Edge Extension (Manifest V3)** for the Chrome Web Store and Microsoft Edge Add-ons.

---

## 1. Quick Build Command

Run the following command in the project root:

```bash
npm run build:extension
```

This single command automatically executes:
1. **Blog metadata indexing** (`scripts/generateBlogMeta.ts`).
2. **Vite compilation in extension mode** (`EXTENSION_BUILD=true`), outputting to `dist-extension/` with relative asset links (`./`).
3. **Manifest V3 CSP Sanitization**, stripping external analytics scripts from `dist-extension/index.html`.
4. **Copying Extension Assets**, ensuring `extension/manifest.json` and store icons are copied directly into `dist-extension/`.
5. **Creating the Root-Level ZIP Package**, bundling all files into `smart-emi-planner-extension.zip` without extra directory nesting.
6. **Central Directory Verification**, confirming `manifest.json` exists directly at the ZIP archive root.

---

## 2. Version Bumping (Crucial for Store Updates)

Every time you submit an update to the Chrome Web Store or Edge Add-ons, the store requires a strictly higher version number than the currently published release:

1. Open `extension/manifest.json`:
   ```json
   {
     "manifest_version": 3,
     "name": "Smart EMI Planner",
     "version": "1.0.2",
     ...
   }
   ```
2. Increment the `"version"` field (e.g., `1.0.1` -> `1.0.2`).
3. Re-run:
   ```bash
   npm run build:extension
   ```

---

## 3. Local Testing in Chrome or Edge

Before uploading to web stores, test the unpacked extension locally:

1. Open your browser and navigate to:
   - Google Chrome: `chrome://extensions/`
   - Microsoft Edge: `edge://extensions/`
2. Enable **Developer mode** via the toggle switch in the upper-right corner.
3. Click the **Load unpacked** button.
4. Select the build directory:
   ```
   c:\workspace_tgr\Personal\EMIcalculatorPRO\dist-extension
   ```
5. Click the extension icon in your toolbar to test the **popup**, open the **Side Panel**, or click **Full Tab** to verify responsiveness.

---

## 4. Uploading to Store Dashboards

Upload the generated archive:
- **File**: `smart-emi-planner-extension.zip`

### Chrome Web Store
1. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Select your extension item (or click **New Item**).
3. Click **Package** -> **Upload new package**.
4. Drag and drop `smart-emi-planner-extension.zip`.
5. Review Store Listing metadata, screenshots, and privacy policy, then click **Submit for review**.

### Microsoft Edge Add-ons
1. Go to the [Microsoft Edge Partner Center Dashboard](https://partner.microsoft.com/dashboard/microsoftedge).
2. Select your extension and click **Update**.
3. Upload `smart-emi-planner-extension.zip` under **Packages**.
4. Complete submission review.

---

## 5. Architecture & Validation Rules

- **Root Structure Requirement**: Web stores reject ZIP archives if files are nested inside a subfolder (e.g., `dist-extension/manifest.json`). The build script ensures `manifest.json` sits directly at `/manifest.json` within the archive.
- **CSP Compliance**: Chrome Manifest V3 forbids inline script execution and remote code loading. The build script automatically strips external `<script src="https://www.googletagmanager.com/...">` tags from `index.html` during the extension build step.
