import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = serviceClient();

    const { data: logRow, error: fetchError } = await supabase
      .from("crisis_logs")
      .select("session_id")
      .eq("id", id)
      .single();

    if (fetchError || !logRow) throw new Error(fetchError?.message ?? "Flag not found");

    const [flagResult, sessionResult] = await Promise.all([
      supabase
        .from("crisis_logs")
        .update({ reviewed_by_dsl: true })
        .eq("id", id),
      supabase
        .from("chat_sessions")
        .update({ is_flagged: false, is_resolved: true })
        .eq("id", logRow.session_id),
    ]);

    if (flagResult.error) throw new Error(flagResult.error.message);
    if (sessionResult.error) throw new Error(sessionResult.error.message);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
