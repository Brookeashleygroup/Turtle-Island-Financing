export async function handler(event, context) {
  try {
    const payload = JSON.parse(event.body).payload;
    const data = payload.data || {};
    const formName = payload.form_name || "";
    const submittedAt = payload.created_at || new Date().toISOString();
    const ip = payload.remote_ip || "";

    if (data["bot-field"]) return { statusCode: 200, body: "ok" };
    if (formName !== "preapproval") return { statusCode: 200, body: "ignored" };

    const lead = {
      name: data.name || "", phone: data.phone || "", email: data.email || "",
      province: data.province || "", credit: data.credit || "", seeking: data.seeking || "",
      notes: data.notes || "", utm_source: data.utm_source || "", utm_medium: data.utm_medium || "",
      utm_campaign: data.utm_campaign || "", utm_term: data.utm_term || "", utm_content: data.utm_content || "",
      consent: data.consent ? "Yes" : "No", submittedAt, ip
    };

    const fs = await import("fs"); const path = await import("path");
    const dealersPath = path.resolve(path.dirname(new URL(import.meta.url).pathname), "data", "dealers.json");
    const dealersMap = JSON.parse(fs.readFileSync(dealersPath, "utf8"));
    const selected = dealersMap[lead.province] || dealersMap["ALL"] || [];

    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
    const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || "Leads";

    if (AIRTABLE_API_KEY && AIRTABLE_BASE_ID) {
      const body = { fields: {
        Name: lead.name, Phone: lead.phone, Email: lead.email, Province: lead.province,
        Credit: lead.credit, Seeking: lead.seeking, Notes: lead.notes, Consent: lead.consent,
        SubmittedAt: lead.submittedAt, IP: lead.ip,
        "UTM Source": lead.utm_source, "UTM Medium": lead.utm_medium, "UTM Campaign": lead.utm_campaign,
        "UTM Term": lead.utm_term, "UTM Content": lead.utm_content
      }};
      await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`, {
        method: "POST", headers: { "Authorization": `Bearer ${AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
    }

    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
    const FROM_EMAIL = process.env.FROM_EMAIL || ADMIN_EMAIL;
    const emailHtml = `<h2>New Lead — Turtle Island Financing</h2>
      <p><strong>Name:</strong> ${lead.name}<br/><strong>Phone:</strong> ${lead.phone}<br/><strong>Email:</strong> ${lead.email}<br/>
      <strong>Province:</strong> ${lead.province}<br/><strong>Credit:</strong> ${lead.credit}<br/><strong>Seeking:</strong> ${lead.seeking}<br/>
      <strong>Notes:</strong> ${lead.notes || "(none)"}<br/><strong>Consent:</strong> ${lead.consent}<br/>
      <strong>Submitted:</strong> ${lead.submittedAt}<br/><strong>IP:</strong> ${lead.ip}</p>
      <p><strong>UTM</strong>: ${lead.utm_source} / ${lead.utm_medium} / ${lead.utm_campaign} / ${lead.utm_term} / ${lead.utm_content}</p>`;

    if (SENDGRID_API_KEY && FROM_EMAIL) {
      const send = async (to, subject, html) => {
        await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: { "Authorization": `Bearer ${SENDGRID_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: to }] }],
            from: { email: FROM_EMAIL, name: "Turtle Island Financing" },
            subject, content: [{ type: "text/html", value: html }]
          })
        });
      };
      if (ADMIN_EMAIL) await send(ADMIN_EMAIL, "New Lead Received", emailHtml);
      for (const d of selected) if (d.email) await send(d.email, "New Indigenous Lead (via Turtle Island Financing)", emailHtml);
      if (process.env.SEND_CLIENT_CONFIRM === "true" && lead.email) {
        await send(lead.email, "We received your request", `<p>Hi ${lead.name || ""},</p><p>Thanks for your request. We’ll connect you with a trained partner dealership and they will contact you shortly.</p><p>— Turtle Island Financing</p>`);
      }
    }

    const TWILIO_SID = process.env.TWILIO_SID;
    const TWILIO_TOKEN = process.env.TWILIO_TOKEN;
    const TWILIO_FROM = process.env.TWILIO_FROM;
    const ADMIN_PHONE = process.env.ADMIN_PHONE;
    if (TWILIO_SID && TWILIO_TOKEN && TWILIO_FROM && ADMIN_PHONE) {
      const params = new URLSearchParams({ To: ADMIN_PHONE, From: TWILIO_FROM, Body: `New Lead: ${lead.name}, ${lead.phone}, ${lead.province} (${lead.seeking})` });
      const auth = Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString("base64");
      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
        method: "POST",
        headers: { "Authorization": `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: params
      });
    }

    return { statusCode: 200, body: "ok" };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: "error" };
  }
}