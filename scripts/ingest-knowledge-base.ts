import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// pdf-parse and mammoth are CJS modules
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mammoth = require("mammoth");

const DOCS_DIR = path.resolve(process.cwd(), "data/docs");
const CHUNK_TARGET = 500; // words
const BATCH_SIZE = 25;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── Category detection ───────────────────────────────────────────────────────

function detectCategory(filename: string): string {
  const n = filename.toLowerCase();
  if (n.includes("emotional") || n.includes("mental")) return "Mental Health";
  if (n.includes("prevention")) return "Prevention & Wellbeing";
  if (n.includes("bereavement")) return "Bereavement";
  if (n.includes("dudley") || n.includes("early help") || n.includes("early-help")) return "Early Help";
  if (n.includes("supported") || n.includes("send") || n.includes("waiting")) return "SEND & Disability";
  if (n.includes("youth")) return "Youth Services";
  return "General";
}

// ─── Location detection ───────────────────────────────────────────────────────

const LOCATION_MAP: [string, string][] = [
  ["sandwell",      "Sandwell"],
  ["dudley",        "Dudley"],
  ["wolverhampton", "Wolverhampton"],
  ["birmingham",    "Birmingham"],
  ["west midlands", "West Midlands"],
];

function detectLocationFromFilename(filename: string): string | null {
  const n = filename.toLowerCase();
  for (const [key, label] of LOCATION_MAP) {
    if (n.includes(key)) return label;
  }
  return null;
}

function detectLocationFromContent(text: string, fallback: string | null): string | null {
  const lower = text.toLowerCase();
  for (const [key, label] of LOCATION_MAP) {
    if (lower.includes(key)) return label;
  }
  return fallback;
}

// ─── Keyword extraction ───────────────────────────────────────────────────────

const STOPWORDS = new Set([
  "the","a","an","and","or","but","in","on","at","to","for","of","with",
  "by","from","is","are","was","were","be","been","being","have","has","had",
  "do","does","did","will","would","could","should","may","might","shall","can",
  "this","that","these","those","it","its","we","our","you","your","they",
  "their","he","she","his","her","as","if","so","not","no","all","any","each",
  "more","also","other","than","then","when","where","who","which","what","how",
  "about","into","over","after","before","between","through","during","including",
]);

function extractKeywords(text: string): string {
  const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) ?? [];
  const freq = new Map<string, number>();
  for (const word of words) {
    if (!STOPWORDS.has(word)) freq.set(word, (freq.get(word) ?? 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word)
    .join(", ");
}

// ─── Chunking ─────────────────────────────────────────────────────────────────

function chunkText(text: string): string[] {
  const paragraphs = text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 20);

  const chunks: string[] = [];
  let buffer: string[] = [];
  let wordCount = 0;

  function flush() {
    const chunk = buffer.join("\n\n").trim();
    if (chunk.split(/\s+/).length >= 20) chunks.push(chunk);
    buffer = [];
    wordCount = 0;
  }

  for (const para of paragraphs) {
    const paraWords = para.split(/\s+/);

    // Paragraph too large — split at sentence boundaries
    if (paraWords.length > 600) {
      const sentences = para.match(/[^.!?]+[.!?]+/g) ?? [para];
      for (const sentence of sentences) {
        const sWords = sentence.trim().split(/\s+/);
        if (wordCount + sWords.length > CHUNK_TARGET && buffer.length > 0) flush();
        buffer.push(sentence.trim());
        wordCount += sWords.length;
      }
      continue;
    }

    if (wordCount + paraWords.length > CHUNK_TARGET && buffer.length > 0) flush();
    buffer.push(para);
    wordCount += paraWords.length;
  }

  if (buffer.length > 0) flush();
  return chunks;
}

// ─── File extraction ──────────────────────────────────────────────────────────

async function extractText(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".pdf") {
    // pdf-parse v2: takes a file path via the `url` option
    const parser = new pdfParse.PDFParse({ url: filePath });
    const result = await parser.getText();
    return result.text as string;
  }

  if (ext === ".docx") {
    const buffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value as string;
  }

  throw new Error(`Unsupported file type: ${ext}`);
}

// ─── Batch insert ─────────────────────────────────────────────────────────────

async function batchInsert(rows: object[]): Promise<{ inserted: number; errors: number }> {
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("knowledge_base").insert(batch);
    if (error) {
      console.error(`  ✗ Batch ${Math.floor(i / BATCH_SIZE) + 1} error: ${error.message}`);
      errors += batch.length;
    } else {
      inserted += batch.length;
    }
  }

  return { inserted, errors };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(DOCS_DIR)) {
    console.error(`Docs directory not found: ${DOCS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(DOCS_DIR).filter((f) =>
    [".pdf", ".docx"].includes(path.extname(f).toLowerCase())
  );

  if (files.length === 0) {
    console.error("No PDF or DOCX files found in data/docs");
    process.exit(1);
  }

  console.log(`Found ${files.length} file(s) to ingest.\n`);

  let totalInserted = 0;
  let totalErrors = 0;

  for (const file of files) {
    const filePath = path.join(DOCS_DIR, file);
    const category = detectCategory(file);
    const locationHint = detectLocationFromFilename(file);

    console.log(`Processing: ${file}`);
    console.log(`  Category : ${category}`);

    try {
      const text = await extractText(filePath);
      const chunks = chunkText(text);
      console.log(`  Chunks   : ${chunks.length}`);

      const rows = chunks.map((chunk) => ({
        source_file:   file,
        content_chunk: chunk,
        category,
        location:  detectLocationFromContent(chunk, locationHint),
        keywords:  extractKeywords(chunk),
      }));

      const { inserted, errors } = await batchInsert(rows);
      console.log(`  Inserted : ${inserted}  Errors: ${errors}\n`);
      totalInserted += inserted;
      totalErrors += errors;
    } catch (err) {
      console.error(`  ✗ Failed to process ${file}: ${(err as Error).message}\n`);
      totalErrors++;
    }
  }

  console.log("─".repeat(40));
  console.log(`Total inserted : ${totalInserted}`);
  console.log(`Total errors   : ${totalErrors}`);
}

main();
