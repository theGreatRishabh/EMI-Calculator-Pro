import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("==========================================");
console.log("Building Smart EMI Planner Extension (MV3)");
console.log("==========================================");

// 1. Generate Blog Metadata
console.log("1/3 Generating blog meta...");
execSync("npx tsx scripts/generateBlogMeta.ts", {
  cwd: rootDir,
  stdio: "inherit",
});

// 2. Build with Vite (EXTENSION_BUILD=true)
console.log("2/3 Compiling with Vite (outDir: dist-extension)...");
execSync("npx vite build", {
  cwd: rootDir,
  stdio: "inherit",
  env: { ...process.env, EXTENSION_BUILD: "true" },
});

// 3. Clean up external scripts from dist-extension/index.html for MV3 CSP compliance
const extHtmlPath = path.resolve(rootDir, "dist-extension/index.html");
if (fs.existsSync(extHtmlPath)) {
  let html = fs.readFileSync(extHtmlPath, "utf-8");
  html = html.replace(
    /<!-- Google tag \(gtag\.js\) -->[\s\S]*?<\/script>\s*<script>[\s\S]*?<\/script>/gi,
    "",
  );
  fs.writeFileSync(extHtmlPath, html, "utf-8");
  console.log("✓ Stripped external GA scripts from dist-extension/index.html (MV3 CSP compliance)");
}

// 4. Copy extension manifest & icons...
console.log("4/4 Copying extension manifest & icons...");
const manifestSrc = path.resolve(rootDir, "extension/manifest.json");
const manifestDest = path.resolve(rootDir, "dist-extension/manifest.json");

if (fs.existsSync(manifestSrc)) {
  fs.copyFileSync(manifestSrc, manifestDest);
  console.log("✓ Copied extension/manifest.json -> dist-extension/manifest.json");
}

const faviconSrc = path.resolve(rootDir, "public/favicon.png");
const faviconDest = path.resolve(rootDir, "dist-extension/favicon.png");
if (fs.existsSync(faviconSrc) && !fs.existsSync(faviconDest)) {
  fs.copyFileSync(faviconSrc, faviconDest);
  console.log("✓ Copied public/favicon.png -> dist-extension/favicon.png");
}

const extFavicon = path.resolve(rootDir, "extension/favicon.png");
if (fs.existsSync(faviconSrc) && !fs.existsSync(extFavicon)) {
  fs.copyFileSync(faviconSrc, extFavicon);
}

// 4. Create upload-ready ZIP file for Chrome Web Store & Edge Add-ons
console.log("4/4 Creating store upload package...");
const zipFile = path.resolve(rootDir, "smart-emi-planner-extension.zip");
const distDir = path.resolve(rootDir, "dist-extension");

try {
  if (fs.existsSync(zipFile)) {
    fs.unlinkSync(zipFile);
  }
} catch (e) {}

let zipCreated = false;

// Get all files/folders inside dist-extension
const distItems = fs.readdirSync(distDir);
const itemsArgs = distItems.map((item) => `"${item}"`).join(" ");

// Method 1: Use native tar with explicit items (NO '.' argument, which prevents './' prefix)
try {
  execSync(`tar -a -cf "${zipFile}" -C "${distDir}" ${itemsArgs}`, {
    cwd: distDir,
    stdio: "inherit",
  });
  if (fs.existsSync(zipFile) && fs.statSync(zipFile).size > 1000) {
    zipCreated = true;
  }
} catch (e) {
  // tar fallback
}

// Method 2: Fallback with PowerShell
if (!zipCreated) {
  const stagingDir = path.resolve(rootDir, ".extension-staging");
  try {
    if (fs.existsSync(stagingDir)) {
      fs.rmSync(stagingDir, { recursive: true, force: true });
    }
    fs.cpSync(distDir, stagingDir, { recursive: true });

    if (process.platform === "win32") {
      execSync(
        `powershell -Command "Set-Location .extension-staging; Compress-Archive -Path ${distItems.join(",")} -DestinationPath ../smart-emi-planner-extension.zip -Force"`,
        { cwd: rootDir, stdio: "inherit" },
      );
    } else {
      execSync(
        `cd .extension-staging && zip -r ../smart-emi-planner-extension.zip ./*`,
        { cwd: rootDir, stdio: "inherit" },
      );
    }
    fs.rmSync(stagingDir, { recursive: true, force: true });
    zipCreated = true;
  } catch (err) {
    console.log(
      "Note: You can manually zip the contents of dist-extension/ to upload.",
    );
  }
}

// Verification: Inspect Central Directory of the ZIP file
function verifyZip(archivePath: string) {
  if (!fs.existsSync(archivePath)) return;
  const buf = fs.readFileSync(archivePath);
  const entries: string[] = [];
  let i = 0;
  while (i < buf.length - 46) {
    if (
      buf[i] === 0x50 &&
      buf[i + 1] === 0x4b &&
      buf[i + 2] === 0x01 &&
      buf[i + 3] === 0x02
    ) {
      const fileNameLen = buf.readUInt16LE(i + 28);
      const extraLen = buf.readUInt16LE(i + 30);
      const commentLen = buf.readUInt16LE(i + 32);
      const name = buf.toString("utf8", i + 46, i + 46 + fileNameLen);
      entries.push(name);
      i += 46 + fileNameLen + extraLen + commentLen;
    } else {
      i++;
    }
  }

  const hasManifestAtRoot = entries.includes("manifest.json");
  if (hasManifestAtRoot) {
    console.log("✅ Verified: manifest.json is at the ROOT of the ZIP package.");
    console.log(`   ZIP root entries: ${entries.slice(0, 5).join(", ")}`);
  } else {
    console.warn("⚠️ Warning: manifest.json not found directly at root!");
    console.warn(`   Entries found: ${entries.slice(0, 10).join(", ")}`);
  }
}

verifyZip(zipFile);

console.log("\n==========================================");
console.log("✓ Extension build ready in folder: dist-extension/");
console.log("✓ Store package ready: smart-emi-planner-extension.zip");
console.log("==========================================");
console.log("For Local Testing:");
console.log("1. Open chrome://extensions or edge://extensions");
console.log("2. Enable 'Developer mode' (top right toggle)");
console.log("3. Click 'Load unpacked' and select 'dist-extension/'");
console.log("\nFor Publishing to Web Stores:");
console.log("Upload 'smart-emi-planner-extension.zip' directly to:");
console.log("- Chrome Web Store: https://chrome.google.com/webstore/devconsole");
console.log("- Microsoft Edge:   https://partner.microsoft.com/dashboard/microsoftedge");
console.log("==========================================\n");
