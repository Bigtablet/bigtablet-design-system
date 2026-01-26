import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const srcDir = path.join(root, "src/vanilla");
const outDir = path.join(root, "dist/vanilla");

// Create output directory
fs.mkdirSync(outDir, { recursive: true });

// Compile SCSS to CSS using sass-embedded (--no-source-map to exclude source maps)
try {
  execSync(
    `npx sass --no-source-map --load-path=. --load-path=src ${srcDir}/bigtablet.scss ${outDir}/bigtablet.css`,
    { stdio: "inherit" }
  );

  // Also create minified version
  execSync(
    `npx sass --no-source-map --load-path=. --load-path=src --style=compressed ${srcDir}/bigtablet.scss ${outDir}/bigtablet.min.css`,
    { stdio: "inherit" }
  );

  console.log("✓ Vanilla CSS compiled successfully");
} catch (error) {
  console.error("Failed to compile vanilla CSS:", error.message);
  process.exit(1);
}

// Copy JS file (non-minified version)
const jsSource = path.join(srcDir, "bigtablet.js");
const jsDest = path.join(outDir, "bigtablet.js");

if (fs.existsSync(jsSource)) {
  fs.copyFileSync(jsSource, jsDest);
  console.log("✓ Vanilla JS copied successfully");
}

// Copy examples
const examplesSource = path.join(srcDir, "examples");
const examplesDest = path.join(outDir, "examples");

if (fs.existsSync(examplesSource)) {
  fs.mkdirSync(examplesDest, { recursive: true });

  for (const entry of fs.readdirSync(examplesSource, { withFileTypes: true })) {
    if (entry.isFile()) {
      fs.copyFileSync(
        path.join(examplesSource, entry.name),
        path.join(examplesDest, entry.name)
      );
    }
  }
  console.log("✓ Examples copied successfully");
}

console.log("\n📦 Vanilla build complete!");
console.log("  dist/vanilla/bigtablet.css");
console.log("  dist/vanilla/bigtablet.min.css");
console.log("  dist/vanilla/bigtablet.js");
console.log("  dist/vanilla/bigtablet.min.js");
