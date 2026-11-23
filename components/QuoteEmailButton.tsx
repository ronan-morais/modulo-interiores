"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";

export function QuoteEmailButton({
  defaultEmail,
  subject,
  body,
}: {
  defaultEmail: string;
  subject: string;
  body: string;
}) {
  const [email, setEmail] = useState(defaultEmail);
  const href = `mailto:${email.trim()}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;

  return (
    <div className="crm-quote-email">
      <label className="visually-hidden" htmlFor="quote-email">
        E-mail do destinatário
      </label>
      <input
        className="input"
        id="quote-email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="cliente@email.com"
        autoComplete="email"
      />
      <a className="btn btn-dark btn-sm" href={href}>
        <Icon name="mail" size={15} />
        Enviar por e-mail
      </a>
    </div>
  );
}
