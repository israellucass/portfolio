import fs from "fs";
import path from "path";
import type { Project, ProjectBlock } from "../src/types/project";
import { canMigrateHtml, parseHtmlToRichText } from "../src/lib/richtext/parse-html";

const PROJECTS_DIR = path.join(process.cwd(), "src/content/projects");

function migrateBlock(block: ProjectBlock): {
  block: ProjectBlock;
  migrated: boolean;
  keptHtml: boolean;
} {
  if (block.type === "richtext") {
    return { block, migrated: false, keptHtml: false };
  }

  if (block.type === "html") {
    const paragraphs = parseHtmlToRichText(block.content);

    if (canMigrateHtml(block.content, paragraphs)) {
      return {
        block: { type: "richtext", paragraphs },
        migrated: true,
        keptHtml: false,
      };
    }

    return { block, migrated: false, keptHtml: true };
  }

  if (block.type === "tree") {
    let migrated = false;
    let keptHtml = false;

    const columns = block.columns.map((column) => ({
      ...column,
      blocks: column.blocks.map((child) => {
        const result = migrateBlock(child);
        migrated = migrated || result.migrated;
        keptHtml = keptHtml || result.keptHtml;
        return result.block;
      }),
    }));

    return {
      block: { ...block, columns },
      migrated,
      keptHtml,
    };
  }

  return { block, migrated: false, keptHtml: false };
}

function migrateProject(filePath: string) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const project = JSON.parse(raw) as Project;

  let migrated = 0;
  let keptHtml = 0;

  const blocks = project.blocks.map((block) => {
    const result = migrateBlock(block);
    if (result.migrated) migrated += 1;
    if (result.keptHtml) keptHtml += 1;
    return result.block;
  });

  fs.writeFileSync(filePath, `${JSON.stringify({ ...project, blocks }, null, 2)}\n`);

  return { slug: project.slug, migrated, keptHtml };
}

function main() {
  const index = JSON.parse(
    fs.readFileSync(path.join(PROJECTS_DIR, "index.json"), "utf-8"),
  ) as { slugs: string[] };

  const results = index.slugs.map((slug) =>
    migrateProject(path.join(PROJECTS_DIR, `${slug}.json`)),
  );

  const migrated = results.reduce((sum, result) => sum + result.migrated, 0);
  const keptHtml = results.reduce((sum, result) => sum + result.keptHtml, 0);
  const failed = results.filter((result) => result.keptHtml > 0);

  console.log(`Migrated ${migrated} html blocks to richtext.`);
  console.log(`Kept ${keptHtml} html blocks (parser parity check failed).`);

  if (failed.length > 0) {
    console.log("Projects with remaining html blocks:");
    for (const result of failed) {
      console.log(`  - ${result.slug}: ${result.keptHtml}`);
    }
  }
}

main();
