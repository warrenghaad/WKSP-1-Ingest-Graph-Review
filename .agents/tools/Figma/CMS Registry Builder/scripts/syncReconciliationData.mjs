import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const repoRoot = path.resolve(projectRoot, "..", "..", "..");
const generatedRoot = path.resolve(
  repoRoot,
  "PILOT FINALIZATION",
  "EUCLID_ FINALIZE MESAPOTAMIA ",
  "reconciliation-system",
  "generated",
);
const destinationRoot = path.resolve(projectRoot, "public", "reconciliation");

const files = [
  "subject_categories.json",
  "subject_category_queue.json",
  "source_artifacts.json",
  "artifact_subject_categories.json",
  "fragments.json",
  "fragment_artifact_links.json",
  "review_queue.json",
  "engines.json",
  "blue_hub_source_index.json",
];

const extraFiles = [
  {
    from: path.resolve(repoRoot, "WORKSPACE", "CODEX_WORKSPACE", "outputs", "system_map.html"),
    to: path.resolve(destinationRoot, "system_map.html"),
  },
];

await mkdir(destinationRoot, { recursive: true });

for (const file of files) {
  await copyFile(path.join(generatedRoot, file), path.join(destinationRoot, file));
}

let syncedCount = files.length;

for (const file of extraFiles) {
  try {
    await copyFile(file.from, file.to);
    syncedCount += 1;
  } catch (error) {
    console.warn(
      `Skipped optional sync for ${file.from}: ${error instanceof Error ? error.message : "unknown error"}`,
    );
  }
}

console.log(`Synced ${syncedCount} reconciliation snapshot files to ${destinationRoot}`);
