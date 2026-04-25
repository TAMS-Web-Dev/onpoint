import { createClient } from "@supabase/supabase-js";
import { createClient as createSSRClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  try {
    const ssrClient = await createSSRClient();
    const { data: { user } } = await ssrClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = serviceClient();
    const { data } = await supabase
      .from("profiles")
      .select("chat_consent_given")
      .eq("id", user.id)
      .maybeSingle();

    return NextResponse.json({ chat_consent_given: data?.chat_consent_given ?? false });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const ssrClient = await createSSRClient();
    const { data: { user } } = await ssrClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = serviceClient();
    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          chat_consent_given: true,
          chat_consent_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
