// Regenerates src/mock/data.json (committed). Run with: npm run mock:generate
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { generateSeed } from "@/mock/seed";
import { SeedData } from "@/mock/types";

const tables = generateSeed();
const version = createHash("sha1").update(JSON.stringify(tables)).digest("hex").slice(0, 12);
const data: SeedData = { version, tables };

const output = resolve(process.cwd(), "src/mock/data.json");
writeFileSync(output, JSON.stringify(data, null, 2) + "\n");

console.log(`Mock data written to ${output} (version ${version}).`);
