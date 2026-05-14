const fs = require("fs");
const path = require("path");

const distDir = path.join(process.cwd(), ".next");
const detailPath = path.join(distDir, "export-detail.json");

// Vercel requires .next/export-detail.json to exist after `next build`.
// For server-rendered Next.js apps (no `output: 'export'`), Next.js may
// not create this file automatically.  If `next build` completed with
// exit code 0 and we reach this script, the build succeeded — always
// write success=true so Vercel accepts the deployment.

if (!fs.existsSync(distDir)) {
  console.log("[build-fix] .next directory not found, skipping");
  process.exit(0);
}

if (!fs.existsSync(detailPath)) {
  const payload = {
    version: 1,
    outDirectory: distDir,
    success: true,
  };

  fs.writeFileSync(detailPath, `${JSON.stringify(payload)}\n`, "utf8");
  console.log(
    `[build-fix] created .next/export-detail.json (success=true)`
  );
} else {
  console.log("[build-fix] .next/export-detail.json already exists, skipping");
}
