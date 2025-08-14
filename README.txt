Turtle Island Financing — Automated (Netlify + Airtable + SendGrid + Twilio)

What you get:
- Netlify Forms + honeypot spam protection
- Netlify Function `submission-created` (auto-triggers on form submit):
  * Saves lead to Airtable
  * Emails admin + forwards to mapped dealers (SendGrid API)
  * SMS alert to you (Twilio)
  * (Optional) confirmation email to client
- UTM tracking captured in hidden fields

Setup (one time):
1) Deploy to Netlify (drag the whole folder).
2) Add environment variables (Netlify → Site settings → Environment):
   AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME=Leads
   SENDGRID_API_KEY, FROM_EMAIL, ADMIN_EMAIL, SEND_CLIENT_CONFIRM=true
   TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM, ADMIN_PHONE
3) In Airtable, create a table "Leads" with fields:
   Name (single line), Phone, Email, Province, Credit, Seeking, Notes, Consent,
   SubmittedAt (date), IP (single line), UTM Source, UTM Medium, UTM Campaign, UTM Term, UTM Content.
4) Edit `netlify/functions/data/dealers.json` to put real dealer emails per province.
5) Submit the form on your live site once to test. Check:
   - Netlify → Forms (capture works)
   - Airtable (record saved)
   - Your email inbox (admin email)
   - Dealer inbox (forwarded lead)
   - Your phone (Twilio SMS)

Privacy & compliance (Canada):
- Keep consent evidence (already logged to Airtable).
- Follow CASL rules for email/SMS; only send communications about the application unless you have express consent.

