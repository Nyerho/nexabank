export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'support@nexabank.co';
  const senderName = process.env.BREVO_SENDER_NAME || 'NexaBank';

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing BREVO_API_KEY' });
  }

  const { to, subject, text, html } = req.body || {};
  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({ error: 'Missing required email fields' });
  }

  try {
    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [{ email: to }],
        subject,
        textContent: text || undefined,
        htmlContent: html || undefined
      })
    });

    const data = await brevoRes.json().catch(() => ({}));
    if (!brevoRes.ok) {
      return res.status(brevoRes.status).json({
        error: data?.message || data?.code || 'Brevo send failed',
        details: data
      });
    }

    return res.status(200).json({ ok: true, id: data?.messageId || null });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Unexpected email error' });
  }
}
