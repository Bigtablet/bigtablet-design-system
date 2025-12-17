import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const srcDir = path.join(root, "src/styles/scss");
const outDir = path.join(root, "dist/styles/scss");

function copyDir(from, to) {
    fs.mkdirSync(to, { recursive: true });
    for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
        const fromPath = path.join(from, entry.name);
        const toPath = path.join(to, entry.name);

        if (entry.isDirectory()) {
            copyDir(fromPath, toPath);
            continue;
        }

        if (entry.isFile() && entry.name.endsWith(".scss")) {
            fs.copyFileSync(fromPath, toPath);
        }
    }
}

copyDir(srcDir, outDir);