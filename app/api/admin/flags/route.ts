import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  try {
    const supabase = serviceClient();

    const { data, error } = await supabase
      .from("crisis_logs")
      .select(
        "id, session_id, trigger_layer, crisis_tier, crisis_category, created_at, reviewed_by_dsl, dsl_assessment"
      )
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return NextResponse.json(data ?? []);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
