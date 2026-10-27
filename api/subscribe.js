// Season-alerts subscription endpoint.
// Captures a visitor email and notifies the Viamar inbox via Resend,
// building an owned lead list independent of FareHarbor.
//
// Required env:  RESEND_API_KEY
// Optional env:  SUBSCRIBE_TO (default info@viamar-berlenga.com)
//                SUBSCRIBE_FROM (default "Viamar Site <alertas@viamar-berlenga.com>")
//                ALLOWED_ORIGIN (default https://viamar-berlenga.com)
module.exports = async function handler(req, res) {
  const origin  = req.headers.origin || '';
  const allowed = process.env.ALLOWED_ORIGIN || 'https://viamar-berlenga.com';

  if (origin === allowed || /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const email = ((body && body.email) || '').trim();
  const lang  = ((body && body.lang)  || 'pt').slice(0, 2);

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const KEY = process.env.RESEND_API_KEY;
  if (!KEY) {
    console.error('[subscribe] RESEND_API_KEY not set — lead not delivered:', email);
    return res.status(500).json({ error: 'Not configured' });
  }

  const to   = process.env.SUBSCRIBE_TO   || 'info@viamar-berlenga.com';
  const from = process.env.SUBSCRIBE_FROM || 'Viamar Site <alertas@viamar-berlenga.com>';

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to,
        reply_to: email,
        subject: `Novo alerta de datas — ${email}`,
        text: `Nova subscrição de alertas Viamar.\n\nEmail: ${email}\nIdioma: ${lang}\nData: ${new Date().toISOString()}`
      })
    });
    if (!r.ok) {
      const t = await r.text();
      console.error('[subscribe] Resend error', r.status, t);
      return res.status(502).json({ error: 'Delivery failed' });
    }
  } catch (e) {
    console.error('[subscribe] fetch error', e);
    return res.status(502).json({ error: 'Delivery failed' });
  }

  return res.status(200).json({ ok: true });
};
