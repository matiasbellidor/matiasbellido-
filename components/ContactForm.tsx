"use client";

import { useRef, useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

/* ═════════════════════════════════════════════════════════════
   CONTACT FORM — arma el email y lo abre en Gmail u Outlook
   Mismo patrón que el modal de Symbiosis (Projects.tsx): no hay
   backend, solo se construye la URL de "redactar" del proveedor
   elegido con destinatario, asunto y cuerpo ya cargados. La
   persona solo tiene que tocar "Enviar" en su cuenta.
   ═════════════════════════════════════════════════════════════ */

const PROVIDERS = {
  gmail: {
    label: "Gmail",
    composeUrl: (to: string, subject: string, body: string) =>
      `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`,
  },
  outlook: {
    label: "Outlook",
    composeUrl: (to: string, subject: string, body: string) =>
      `https://outlook.office.com/mail/deeplink/compose?to=${to}&subject=${subject}&body=${body}`,
  },
};

type Provider = keyof typeof PROVIDERS;

/* Mismos inputs que el modal de Symbiosis. El radio va aparte:
   rounded-full en los de una línea, rounded-2xl en el textarea. */
const fieldClass =
  "w-full px-4 py-3 bg-white/5 border border-cyan/20 text-base text-fg placeholder:text-fg-faint focus:outline-none focus:border-cyan/60 transition-colors";
const labelClass = "block text-xs uppercase tracking-wider text-fg-muted mb-2 pl-4";

export default function ContactForm({ to }: { to: string }) {
  const { t } = useLanguage();
  const f = t.footer.form;
  const [provider, setProvider] = useState<Provider>("gmail");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [opened, setOpened] = useState(false);
  const openedTimer = useRef<ReturnType<typeof setTimeout>>();

  const providerLabel = PROVIDERS[provider].label;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const subject = encodeURIComponent(f.subject);
    const lines = [f.greeting, "", message.trim(), "", `${f.emailLine} ${email.trim()}`];
    if (name.trim()) lines.push("", `- ${name.trim()}`);
    const body = encodeURIComponent(lines.join("\n"));
    const url = PROVIDERS[provider].composeUrl(encodeURIComponent(to), subject, body);

    const win = window.open(url, "_blank");
    if (win) win.opener = null; // la pestaña nueva no puede tocar esta página
    else window.location.href = url; // ventanas emergentes bloqueadas: se abre acá mismo

    setOpened(true);
    clearTimeout(openedTimer.current);
    openedTimer.current = setTimeout(() => setOpened(false), 5000);
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-5 sm:p-8 text-left space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-4">
        <div>
          <label htmlFor="contact-name" className={labelClass}>{f.nameLabel}</label>
          <input
            id="contact-name"
            type="text"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={f.namePlaceholder}
            className={`${fieldClass} rounded-full`}
          />
        </div>
        <div>
          <label htmlFor="contact-email" className={labelClass}>{f.emailLabel}</label>
          <input
            id="contact-email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={f.emailPlaceholder}
            className={`${fieldClass} rounded-full`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClass}>{f.messageLabel}</label>
        {/* maxLength: el texto viaja en la URL de redacción, que tiene un tope */}
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={f.messagePlaceholder}
          className={`${fieldClass} rounded-2xl resize-none block`}
        />
      </div>

      {/* Selector de proveedor (radios nativos con forma de pill: flechas
          del teclado incluidas) + botón. Mobile apilados; sm+ en una fila,
          ambos de 50px de alto. El activo usa el chip cyan del sitio (no
          azul sólido) para que el único botón lleno sea el de enviar. */}
      <div>
        <p id="contact-provider" className={labelClass}>{f.providerLabel}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div role="radiogroup" aria-labelledby="contact-provider" className="grid grid-cols-2 gap-1 p-1 rounded-full bg-white/5 border border-cyan/20">
            {(Object.keys(PROVIDERS) as Provider[]).map((key) => (
              <label key={key} className="cursor-pointer">
                <input
                  type="radio"
                  name="provider"
                  value={key}
                  checked={provider === key}
                  onChange={() => setProvider(key)}
                  className="peer sr-only"
                />
                <span className="block text-center px-4 py-2.5 rounded-full text-sm font-semibold text-fg-soft hover:text-cyan transition-all peer-checked:bg-cyan/15 peer-checked:text-cyan peer-checked:ring-1 peer-checked:ring-cyan/50 peer-focus-visible:ring-2 peer-focus-visible:ring-cyan/70">
                  {PROVIDERS[key].label}
                </span>
              </label>
            ))}
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 rounded-full border border-transparent bg-electric text-white font-medium hover:shadow-glow transition-all flex items-center justify-center gap-2 touch-manipulation"
          >
            <Mail className="w-4 h-4 shrink-0" />
            {f.submit.replace("{provider}", providerLabel)}
          </button>
        </div>
      </div>

      <p aria-live="polite" className={`text-center text-xs leading-relaxed ${opened ? "text-cyan" : "text-fg-muted"}`}>
        {(opened ? f.opened : f.hint).replace("{provider}", providerLabel)}
      </p>
    </form>
  );
}
