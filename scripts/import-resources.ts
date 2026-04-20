import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const CSV_FILE = path.resolve(process.cwd(), "OnPoint_Master_Data_Consolidated.csv");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ResourceRow {
  category: string;
  name: string;
  location: string;
  trigger_keywords: string;
  contact: string;
  action: string;
}

function parseCSV(content: string): ResourceRow[] {
  const lines = content.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase());

  return lines.slice(1).map((line) => {
    // Handle quoted fields containing commas
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row: Record<string, string> = {};
    headers.forEach((header, i) => {
      row[header] = values[i] ?? "";
    });

    return {
      category: row["category"] ?? "",
      name: row["name"] ?? "",
      location: row["location"] ?? "",
      trigger_keywords: row["trigger_keywords"] ?? "",
      contact: row["contact"] ?? "",
      action: row["action"] ?? "",
    };
  });
}

async function main() {
  if (!fs.existsSync(CSV_FILE)) {
    console.error(`CSV file not found: ${CSV_FILE}`);
    process.exit(1);
  }

  const content = fs.readFileSync(CSV_FILE, "utf-8");
  const rows = parseCSV(content);

  console.log(`Parsed ${rows.length} rows from CSV.`);

  const BATCH_SIZE = 50;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("resources").insert(batch);

    if (error) {
      console.error(`Batch ${i / BATCH_SIZE + 1} error:`, error.message);
      errors += batch.length;
    } else {
      inserted += batch.length;
      console.log(`Batch ${i / BATCH_SIZE + 1}: inserted ${batch.length} rows.`);
    }
  }

  console.log(`\nDone. Inserted: ${inserted}, Errors: ${errors}`);
}

main();
