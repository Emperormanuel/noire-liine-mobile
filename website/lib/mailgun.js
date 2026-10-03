import { money } from './format';

export async function sendOrderEmail({ to, name, orderId, items, totalCents }) {
  const { MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_FROM } = process.env;
  const base = process.env.MAILGUN_API_URL || 'https://api.mailgun.net';
  if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
    console.warn('Mailgun is not configured; skipping email.');
    return false;
  }

  const short = orderId.slice(0, 8);
  const lines = items.map((i) => `${i.quantity} x ${i.name} - ${money(i.price_cents * i.quantity)}`);
  const text = `Hi ${name},\n\nThanks for your order!\n\nOrder #${short}\n${lines.join('\n')}\n\nTotal: ${money(totalCents)}\n\nWe will be in touch soon.`;
  const html = `<h2>Thanks for your order, ${name}!</h2>
<p>Order <b>#${short}</b></p>
<ul>${items.map((i) => `<li>${i.quantity} &times; ${i.name} &mdash; ${money(i.price_cents * i.quantity)}</li>`).join('')}</ul>
<p><b>Total: ${money(totalCents)}</b></p>`;

  const body = new URLSearchParams({
    from: MAILGUN_FROM || `Noire Liine <postmaster@${MAILGUN_DOMAIN}>`,
    to,
    subject: `Order confirmation #${short}`,
    text,
    html,
  });

  const res = await fetch(`${base}/v3/${MAILGUN_DOMAIN}/messages`, {
    method: 'POST',
    headers: { Authorization: 'Basic ' + Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64') },
    body,
  });
  if (!res.ok) {
    console.error('Mailgun error', res.status, await res.text());
    return false;
  }
  return true;
}
