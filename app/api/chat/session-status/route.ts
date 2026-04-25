import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ is_flagged: false, is_resolved: false });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data } = await supabase
      .from("chat_sessions")
      .select("is_flagged, is_resolved")
      .eq("id", sessionId)
      .maybeSingle();

    return NextResponse.json({
      is_flagged: data?.is_flagged ?? false,
      is_resolved: data?.is_resolved ?? false,
    });
  } catch {
    return NextResponse.json({ is_flagged: false, is_resolved: false });
  }
}
