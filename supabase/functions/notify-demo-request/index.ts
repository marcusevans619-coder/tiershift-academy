import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { record } = await req.json();

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "TierShift Academy <notifications@tiershiftacademy.com>",
      to: ["tiershiftacademy@gmail.com"],
      subject: `New Demo Request — ${record.company}`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#060a12;color:#e8edf5;border-radius:12px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px">
            <div style="width:36px;height:36px;background:linear-gradient(135deg,#00e5ff,#a78bfa);border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px;color:#060a12">TS</div>
            <div style="font-size:18px;font-weight:800;color:#e8edf5">Tier<span style="color:#00e5ff">Shift</span> Academy</div>
          </div>
          <h2 style="color:#00e5ff;margin:0 0 20px;font-size:20px">New Demo Request</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:10px 0;border-bottom:1px solid #1e2d40;color:#94a3b8;width:120px">Name</td><td style="padding:10px 0;border-bottom:1px solid #1e2d40;color:#e8edf5;font-weight:600">${record.name}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #1e2d40;color:#94a3b8">Email</td><td style="padding:10px 0;border-bottom:1px solid #1e2d40;color:#00e5ff">${record.email}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #1e2d40;color:#94a3b8">Company</td><td style="padding:10px 0;border-bottom:1px solid #1e2d40;color:#e8edf5;font-weight:600">${record.company}</td></tr>
            <tr><td style="padding:10px 0;color:#94a3b8">Department</td><td style="padding:10px 0;color:#e8edf5">${record.department || "Not provided"}</td></tr>
          </table>
          <div style="margin-top:24px;padding:14px;background:#111827;border-radius:8px;border-left:3px solid #00e5ff">
            <div style="font-size:11px;color:#64748b;font-family:monospace;text-transform:uppercase;margin-bottom:4px">Submitted</div>
            <div style="color:#e8edf5;font-size:13px">${new Date(record.created_at).toLocaleString()}</div>
          </div>
          <p style="margin-top:20px;font-size:12px;color:#64748b;text-align:center">TierShift Academy · tiershiftacademy.com</p>
        </div>
      `,
    }),
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
});