const fs = require("fs");
const path = require("path");

const distDir = path.join(process.cwd(), ".next");
const markerPath = path.join(distDir, "export-marker.json");
const detailPath = path.join(distDir, "export-detail.json");
const exportDir = path.join(distDir, "export");

if (!fs.existsSync(distDir) || !fs.existsSync(markerPath)) {
  process.exit(0);
}

if (!fs.existsSync(detailPath)) {
  const hasStaticExportOutput = fs.existsSync(exportDir);
  const payload = {
    version: 1,
    outDirectory: hasStaticExportOutput ? exportDir : distDir,
    success: hasStaticExportOutput,
  };

  fs.writeFileSync(detailPath, `${JSON.stringify(payload)}\n`, "utf8");
  console.log(
    `[build-fix] created .next/export-detail.json (success=${String(payload.success)})`
  );
}
