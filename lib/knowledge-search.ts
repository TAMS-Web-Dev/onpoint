import { createClient } from "@/lib/supabase/server";

export interface KnowledgeChunk {
  id: string;
  source_file: string;
  content_chunk: string;
  category: string | null;
  location: string | null;
  keywords: string | null;
}

/**
 * Full-text search across the knowledge_base table using PostgreSQL tsvector.
 * Uses plainto_tsquery so multi-word phrases and special chars are handled safely.
 *
 * @param query    - The user's search string
 * @param location - Optional location filter (e.g. "Sandwell", "Dudley")
 * @param limit    - Max results to return (default 8)
 */
export async function searchKnowledge(
  query: string,
  location?: string,
  limit = 8
): Promise<KnowledgeChunk[]> {
  if (!query.trim()) return [];

  const supabase = await createClient();

  let builder = supabase
    .from("knowledge_base")
    .select("id, source_file, content_chunk, category, location, keywords")
    .textSearch("search_vector", query, { type: "plain", config: "english" })
    .limit(limit);

  if (location) {
    builder = builder.ilike("location", `%${location}%`);
  }

  const { data, error } = await builder;

  if (error) throw new Error(`Knowledge search failed: ${error.message}`);
  return (data ?? []) as KnowledgeChunk[];
}
