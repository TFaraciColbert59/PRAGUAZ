// Emails transactionnels FR — journalisés uniquement sans RESEND_API_KEY.
// sendEmail() ne fait jamais croire à un envoi : sans clé il retourne
// { sent: false, reason } après avoir loggué le contenu.

export interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

export interface EmailResult {
  sent: boolean;
  reason: string;
  id?: string;
}

export interface OrderEmailInput {
  orderNumber: string;
  firstName: string;
  total: string;
}

function layoutHtml(title: string, body: string): string {
  return (
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${title}</title></head>` +
    `<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111">` +
    `<h1 style="font-size:20px">${title}</h1>${body}` +
    `<p style="font-size:12px;color:#666">Maquette de démonstration — email transactionnel.</p>` +
    `</body></html>`
  );
}

export function buildOrderConfirmationEmail(order: OrderEmailInput): EmailTemplate {
  const subject = `Confirmation de commande ${order.orderNumber}`;
  const text =
    `Bonjour ${order.firstName},\n\n` +
    `Merci pour votre commande ${order.orderNumber} d'un montant de ${order.total}.\n` +
    `Vous recevrez un email dès l'expédition de votre colis.\n\n` +
    `À bientôt,\nL'équipe`;
  const html = layoutHtml(
    subject,
    `<p>Bonjour ${order.firstName},</p>` +
      `<p>Merci pour votre commande <strong>${order.orderNumber}</strong> d'un montant de <strong>${order.total}</strong>.</p>` +
      `<p>Vous recevrez un email dès l'expédition de votre colis.</p><p>À bientôt,<br>L'équipe</p>`,
  );
  return { subject, text, html };
}

export function buildShipmentEmail(order: OrderEmailInput & { tracking: string; carrier: string }): EmailTemplate {
  const subject = `Votre commande ${order.orderNumber} est expédiée`;
  const text =
    `Bonjour ${order.firstName},\n\n` +
    `Votre commande ${order.orderNumber} a été expédiée via ${order.carrier}.\n` +
    `Numéro de suivi : ${order.tracking}\n\n` +
    `À bientôt,\nL'équipe`;
  const html = layoutHtml(
    subject,
    `<p>Bonjour ${order.firstName},</p>` +
      `<p>Votre commande <strong>${order.orderNumber}</strong> a été expédiée via ${order.carrier}.</p>` +
      `<p>Numéro de suivi : <strong>${order.tracking}</strong></p><p>À bientôt,<br>L'équipe</p>`,
  );
  return { subject, text, html };
}

export function buildRefundEmail(order: OrderEmailInput & { amount: string }): EmailTemplate {
  const subject = `Remboursement de votre commande ${order.orderNumber}`;
  const text =
    `Bonjour ${order.firstName},\n\n` +
    `Un remboursement de ${order.amount} a été initié pour votre commande ${order.orderNumber}.\n` +
    `Le montant sera visible sous quelques jours ouvrés.\n\n` +
    `À bientôt,\nL'équipe`;
  const html = layoutHtml(
    subject,
    `<p>Bonjour ${order.firstName},</p>` +
      `<p>Un remboursement de <strong>${order.amount}</strong> a été initié pour votre commande <strong>${order.orderNumber}</strong>.</p>` +
      `<p>Le montant sera visible sous quelques jours ouvrés.</p><p>À bientôt,<br>L'équipe</p>`,
  );
  return { subject, text, html };
}

export async function sendEmail(to: string, template: EmailTemplate): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[emails] ENVOI DÉSACTIVÉ (RESEND_API_KEY absente) — to=${to} subject=${template.subject}\n${template.text}`);
    return { sent: false, reason: "RESEND_API_KEY non configurée : email journalisé uniquement, rien envoyé." };
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Maquette <no-reply@example.com>", to, subject: template.subject, html: template.html, text: template.text }),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(`[emails] Échec Resend (${response.status}) to=${to} : ${detail.slice(0, 300)}`);
      return { sent: false, reason: `Resend a refusé l'envoi (${response.status}).` };
    }
    const payload = (await response.json()) as { id?: string };
    console.log(`[emails] Envoyé to=${to} subject=${template.subject} id=${payload.id ?? "inconnu"}`);
    return { sent: true, reason: "Email envoyé via Resend.", id: payload.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "erreur inconnue";
    console.error(`[emails] Exception to=${to} : ${message}`);
    return { sent: false, reason: `Envoi impossible : ${message}` };
  }
}
