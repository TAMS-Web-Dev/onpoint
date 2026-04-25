interface SendCrisisAlertParams {
  tier: "tier1" | "tier2" | "tier3";
  category: "life-risk" | "safeguarding" | "jailbreak" | "distress";
  sessionId: string;
  timestamp: string;
}

function buildSmsBody(params: SendCrisisAlertParams): string {
  return [
    "ONPOINT SAFEGUARDING ALERT",
    `Tier: ${params.tier} | Category: ${params.category}`,
    `Session: ${params.sessionId}`,
    `Time: ${params.timestamp}`,
    "Login to admin dashboard immediately.",
  ].join("\n");
}

function buildEmailBody(params: SendCrisisAlertParams): string {
  return [
    `A ${params.tier} crisis has been detected on the OnPoint platform.`,
    "",
    `Category: ${params.category}`,
    `Session ID: ${params.sessionId}`,
    `Time: ${params.timestamp}`,
    "",
    "Please login to the admin dashboard immediately to review",
    "the flagged session and take appropriate action per the",
    "Safeguarding Protocol.",
    "",
    "This is an automated alert from the OnPoint safeguarding system.",
  ].join("\n");
}

async function sendSms(
  to: string,
  body: string,
  accountSid: string,
  authToken: string,
  from: string
): Promise<void> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const credentials = btoa(`${accountSid}:${authToken}`);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Twilio SMS error (${res.status}): ${text}`);
  }
}

async function sendEmail(params: SendCrisisAlertParams): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const to = process.env.DSL_CONTACT_EMAIL!;

  if (!apiKey) {
    console.warn("[twilio] SENDGRID_API_KEY not set — skipping email alert");
    return;
  }

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: to },
      subject: `ONPOINT SAFEGUARDING ALERT — ${params.tier} detected`,
      content: [{ type: "text/plain", value: buildEmailBody(params) }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SendGrid error (${res.status}): ${text}`);
  }
}

export async function sendCrisisAlert(
  params: SendCrisisAlertParams
): Promise<void> {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
    const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
    const fromNumber = process.env.TWILIO_FROM_NUMBER?.trim();
    const dslPhone = process.env.DSL_CONTACT_PHONE?.trim();
    const dslEmail = process.env.DSL_CONTACT_EMAIL?.trim();
    const backupPhone = process.env.DSL_CONTACT_BACKUP_PHONE?.trim();

    const twilioReady = Boolean(accountSid && authToken && fromNumber);
    const dslReady = Boolean(dslPhone && dslEmail);

    if (!twilioReady || !dslReady) {
      const missing: string[] = [];
      if (!twilioReady) missing.push("Twilio credentials (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER)");
      if (!dslReady) missing.push("DSL contacts (DSL_CONTACT_PHONE / DSL_CONTACT_EMAIL)");

      console.log(
        [
          "[TWILIO MOCK] Crisis alert would have been sent:",
          `Tier: ${params.tier} | Category: ${params.category}`,
          `Session: ${params.sessionId} | Time: ${params.timestamp}`,
          `SMS → ${dslPhone || "DSL_CONTACT_PHONE"} | Backup → ${backupPhone || "DSL_CONTACT_BACKUP_PHONE"}`,
          `Email → ${dslEmail || "DSL_CONTACT_EMAIL"}`,
          `Reason skipped: ${missing.join("; ")}`,
        ].join("\n")
      );
      return;
    }

    const smsBody = buildSmsBody(params);

    const smsTasks: Promise<void>[] = [
      sendSms(dslPhone!, smsBody, accountSid!, authToken!, fromNumber!),
    ];
    if (backupPhone) {
      smsTasks.push(sendSms(backupPhone, smsBody, accountSid!, authToken!, fromNumber!));
    }

    const smsResults = await Promise.allSettled(smsTasks);
    smsResults.forEach((result, i) => {
      if (result.status === "rejected") {
        console.error(
          `[twilio] SMS to ${i === 0 ? "primary" : "backup"} DSL failed:`,
          result.reason
        );
      }
    });

    await sendEmail(params);
  } catch (err) {
    console.error(
      `[twilio] [${params.timestamp}] Crisis alert error | session: ${params.sessionId} |`,
      (err as Error).message
    );
  }
}
