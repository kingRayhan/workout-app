#!/usr/bin/env bun
/**
 * Copies the images referenced by the data (e.g. `Machine.image` = "/machines/x.jpg")
 * into the calling app's `public/` folder. Run from an app directory, usually as a
 * `predev` / `prebuild` script. The copied folder is gitignored in each app.
 */
import { cpSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const ASSET_DIRS = ["machines", "icons", "shortcuts"];

const source = resolve(import.meta.dir, "../assets");
const target = resolve(process.cwd(), "public");

for (const dir of ASSET_DIRS) {
  const dest = join(target, dir);
  rmSync(dest, { recursive: true, force: true });
  cpSync(join(source, dir), dest, { recursive: true });
}

console.log(`@workoutland/data: copied ${ASSET_DIRS.join(", ")} → ${target}`);
