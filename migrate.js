import fs from "fs";
import path from "path";

const DB = process.env.DB; // wrangler binding o API

async function getApplied() {
  return await DB.prepare("SELECT name FROM d1_migrations").all();
}

async function markApplied(name) {
  return await DB.prepare(
    "INSERT OR IGNORE INTO d1_migrations (name) VALUES (?)"
  ).bind(name).run();
}

function loadMigrations() {
  return fs
    .readdirSync("./migrations")
    .filter(f => f.endsWith(".sql"))
    .sort();
}

async function run() {
  const applied = await getApplied();
  const appliedSet = new Set(applied.results.map(x => x.name));

  const files = loadMigrations();

  for (const file of files) {
    if (appliedSet.has(file)) {
      console.log("SKIP:", file);
      continue;
    }

    console.log("RUN:", file);

    const sql = fs.readFileSync(
      path.join("./migrations", file),
      "utf8"
    );

    try {
      await DB.exec(sql);
      await markApplied(file);
      console.log("DONE:", file);
    } catch (err) {
      console.error("FAILED:", file, err);
      process.exit(1);
    }
  }
}

run();