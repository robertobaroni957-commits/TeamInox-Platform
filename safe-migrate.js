import fs from "fs";
import { execSync } from "child_process";

const DB = "team_inox_prod_v2";
const file = "./migration_safe_sync.sql";

// 1. prendi schema remoto
const schema = execSync(
  `wrangler d1 execute ${DB} --remote --command "SELECT sql FROM sqlite_master WHERE type='table';"`
).toString();

const existing = schema.toLowerCase();

const sql = fs.readFileSync(file, "utf-8");

// 2. split comandi
const commands = sql
  .split(";")
  .map(s => s.trim())
  .filter(Boolean);

// 3. filtra solo quelli NON già presenti
const filtered = commands.filter(cmd => {
  if (cmd.toLowerCase().includes("add column")) {
    const col = cmd.split("ADD COLUMN")[1]?.trim()?.split(" ")[0];
    if (!col) return true;
    return !existing.includes(col.toLowerCase());
  }
  return true;
});

// 4. esegui safe
for (const cmd of filtered) {
  console.log("EXEC:", cmd);
  execSync(
    `wrangler d1 execute ${DB} --remote --command "${cmd}"`
  );
}

console.log("DONE SAFE MIGRATION");