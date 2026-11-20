"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { quoteOptions, site } from "@/lib/site";

const DRAFT_KEY = "modulo-orcamento-draft";
const cityOptions = [
  "Belo Horizonte",
  "Contagem",
  "Betim",
  "Nova Lima",
  "Sabará",
  "Ibirité",
  "Outra cidade",
];
const timelines = [
  "O quanto antes",
  "Em até 30 dias",
  "Em 60 dias ou mais",
  "Ainda pesquisando",
];

type FormState = {
  selected: string[];
  property: "Residencial" | "Comercial";
  area: string;
  rooms: string;
  city: string;
  district: string;
  timeline: string;
  details: string;
  fileName: string;
  name: string;
  phone: string;
  email: string;
  consent: boolean;
};

const initialState: FormState = {
  selected: ["divisorias-drywall", "forro-modular"],
  property: "Residencial",
  area: "",
  rooms: "",
  city: "Belo Horizonte",
  district: "Savassi",
  timeline: "Em até 30 dias",
  details: "",
  fileName: "",
  name: "",
  phone: "",
  email: "",
  consent: false,
};

export function QuoteForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState("");
  const [draftSaved, setDraftSaved] = useState(false);
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<FormState>;
      setForm((current) => ({
        ...current,
        ...parsed,
        selected: Array.isArray(parsed.selected)
          ? parsed.selected.filter((id) => quoteOptions.some((s) => s.id === id))
          : current.selected,
        consent: false,
      }));
    } catch {
      // Ignore malformed drafts.
    }
  }, []);

  useEffect(() => {
    if (!draftSaved) return;
    const timer = window.setTimeout(() => setDraftSaved(false), 4000);
    return () => window.clearTimeout(timer);
  }, [draftSaved]);

  const selectedTitles = useMemo(
    () =>
      quoteOptions
        .filter((service) => form.selected.includes(service.id))
        .map((service) => service.title),
    [form.selected],
  );

  const message = useMemo(() => {
    const lines = [
      "Olá! Quero um orçamento com a Módulo Interiores.",
      "",
      `Serviços: ${selectedTitles.join(", ") || "a definir"}`,
      `Tipo de imóvel: ${form.property}`,
      form.area ? `Área total aproximada: ${form.area} m²` : "",
      form.rooms ? `Nº de ambientes: ${form.rooms}` : "",
      `Cidade: ${form.city}${form.district ? ` · ${form.district}` : ""}`,
      `Quando pretende executar: ${form.timeline}`,
      form.details ? `Detalhes: ${form.details}` : "",
      form.fileName
        ? `Fotos/planta: ${form.fileName} (envio em seguida)`
        : "",
      "",
      `Nome: ${form.name}`,
      form.phone ? `WhatsApp: ${form.phone}` : "",
      form.email ? `E-mail: ${form.email}` : "",
    ];
    return lines.filter(Boolean).join("\n");
  }, [form, selectedTitles]);

  const whatsappUrl = `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(message)}`;
  const mailtoUrl = `mailto:${site.email}?subject=${encodeURIComponent(
    "Orçamento online — Módulo Interiores",
  )}&body=${encodeURIComponent(message)}`;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function toggleService(id: string) {
    setForm((current) => ({
      ...current,
      selected: current.selected.includes(id)
        ? current.selected.filter((item) => item !== id)
        : [...current.selected, id],
    }));
    setError("");
  }

  function saveDraft() {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
      setDraftSaved(true);
    } catch {
      setError("Não foi possível salvar o rascunho neste navegador.");
    }
  }

  function goToContact(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.selected.length === 0) {
      setError("Selecione pelo menos um serviço para continuar.");
      return;
    }
    setError("");
    setStep(2);
  }

  async function saveLead() {
    setSaveState("saving");
    try {
      const response = await fetch("/api/orcamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          services: form.selected,
          property: form.property,
          area: form.area,
          rooms: form.rooms,
          city: form.city,
          district: form.district,
          timeline: form.timeline,
          details: form.details,
          fileName: form.fileName,
          name: form.name,
          phone: form.phone,
          email: form.email,
          consent: form.consent,
        }),
      });
      setSaveState(response.ok ? "saved" : "error");
    } catch {
      setSaveState("error");
    }
  }

  function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Informe seu nome para que a equipe possa responder.");
      return;
    }
    if (!form.phone.trim() && !form.email.trim()) {
      setError("Informe um WhatsApp ou e-mail para retorno da proposta.");
      return;
    }
    if (!form.consent) {
      setError("Confirme o uso dos dados para envio do orçamento.");
      return;
    }
    setError("");
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setStep(3);
    void saveLead();
  }

  function resetForm() {
    setForm(initialState);
    setStep(1);
    setError("");
    setSaveState("idle");
  }

  const progress = step === 1 ? "50%" : "100%";

  const successTitle =
    saveState === "error"
      ? "Pedido pronto para envio"
      : saveState === "saved"
        ? "Pedido enviado"
        : "Registrando pedido";

  return (
    <div className="container quote-layout">
      <aside className="steps-nav" aria-label="Etapas do orçamento">
        <div
          className={
            step === 1
              ? "side-step is-active"
              : step === 2
                ? "side-step is-complete"
                : "side-step is-complete"
          }
          aria-current={step === 1 ? "step" : undefined}
        >
          <div className="step-head">
            <span className="step-num">01</span>
            <h2>Serviços e ambiente</h2>
          </div>
          <p>Escolha o que precisa e onde vamos executar.</p>
        </div>

        <div
          className={
            step === 2
              ? "side-step is-active"
              : step === 3
                ? "side-step is-complete"
                : "side-step"
          }
          aria-current={step === 2 ? "step" : undefined}
        >
          <div className="step-head">
            <span className="step-num">02</span>
            <h2>Contato e envio</h2>
          </div>
          <p>Seus dados e a confirmação do pedido.</p>
        </div>

        <div className="help-card">
          <p className="eyebrow">Prefere falar agora?</p>
          <p>Atendemos por WhatsApp de segunda a sábado, das 8h às 18h.</p>
          <a
            className="btn btn-dark"
            href={site.whatsapp.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="message-circle" size={15} />
            Chamar no WhatsApp
          </a>
        </div>
      </aside>

      <div className="quote-card">
        <div className="quote-card-head">
          <div>
            <p className="eyebrow">
              {step === 1
                ? "Passo 1 de 2 · Serviços"
                : step === 2
                  ? "Passo 2 de 2 · Contato"
                  : "Resumo do pedido"}
            </p>
            <h2>
              {step === 1
                ? "O que você precisa?"
                : step === 2
                  ? "Como podemos falar com você?"
                  : successTitle}
            </h2>
          </div>
          <p className="time-estimate">
            {step === 1 ? "≈ 3 min" : step === 2 ? "≈ 1 min" : "✓"}
          </p>
        </div>

        <div className="progress" aria-hidden="true">
          <span style={{ width: progress }} />
        </div>

        {step === 3 ? (
          <div className="success-panel">
            <span className="success-icon">
              <Icon name="check" size={28} />
            </span>
            <p aria-live="polite">
              {saveState === "error"
                ? "Não foi possível registrar o pedido no sistema agora, mas o WhatsApp foi aberto com todos os dados."
                : saveState === "saved"
                  ? "Pedido registrado. O WhatsApp foi aberto com o resumo."
                  : "Registrando o pedido…"}{" "}
              Se a janela do WhatsApp não abriu, use um dos botões abaixo e
              anexe as fotos na conversa.
            </p>
            <div className="success-actions">
              <a
                className="btn btn-accent btn-md"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="message-circle" size={16} />
                Abrir WhatsApp
              </a>
              <a className="btn btn-outline btn-md" href={mailtoUrl}>
                <Icon name="mail" size={16} />
                Enviar por e-mail
              </a>
              <button className="btn btn-outline btn-md" type="button" onClick={resetForm}>
                Novo orçamento
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={step === 1 ? goToContact : submitRequest} noValidate>
            {step === 1 ? (
              <>
                <div className="service-tiles" role="group" aria-label="Serviços">
                  {quoteOptions.map((service) => {
                    const selected = form.selected.includes(service.id);
                    return (
                      <button
                        key={service.id}
                        type="button"
                        className="tile"
                        aria-pressed={selected}
                        onClick={() => toggleService(service.id)}
                      >
                        <span className="tile-num">{service.index}</span>
                        {selected ? (
                          <span className="tile-check">
                            <Icon name="check" size={15} />
                          </span>
                        ) : null}
                        <span className="tile-label">{service.title}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="field-group">
                  <span className="field-label" id="property-label">
                    Tipo de imóvel
                  </span>
                  <div
                    className="segment"
                    role="group"
                    aria-labelledby="property-label"
                  >
                    {(["Residencial", "Comercial"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        aria-pressed={form.property === type}
                        onClick={() => update("property", type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field-row">
                  <div className="field-group">
                    <label className="field-label" htmlFor="area">
                      Área total aproximada (m²)
                    </label>
                    <input
                      className="input"
                      id="area"
                      name="area"
                      type="number"
                      min="1"
                      inputMode="numeric"
                      placeholder="Ex.: 45"
                      aria-describedby="area-hint"
                      value={form.area}
                      onChange={(event) => update("area", event.target.value)}
                    />
                    <span className="field-hint" id="area-hint">
                      Some todos os ambientes. Se não souber, deixe em branco.
                    </span>
                  </div>
                  <div className="field-group">
                    <label className="field-label" htmlFor="rooms">
                      Nº de ambientes
                    </label>
                    <input
                      className="input"
                      id="rooms"
                      name="rooms"
                      type="number"
                      min="1"
                      inputMode="numeric"
                      placeholder="Ex.: 3"
                      value={form.rooms}
                      onChange={(event) => update("rooms", event.target.value)}
                    />
                  </div>
                </div>

                <div className="field-row">
                  <div className="field-group">
                    <label className="field-label" htmlFor="city">
                      Cidade
                    </label>
                    <select
                      className="select"
                      id="city"
                      name="city"
                      value={form.city}
                      onChange={(event) => update("city", event.target.value)}
                    >
                      {cityOptions.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field-group">
                    <label className="field-label" htmlFor="district">
                      Bairro
                    </label>
                    <input
                      className="input"
                      id="district"
                      name="district"
                      type="text"
                      autoComplete="address-level3"
                      placeholder="Ex.: Savassi"
                      value={form.district}
                      onChange={(event) => update("district", event.target.value)}
                    />
                  </div>
                </div>

                <div className="field-group">
                  <span className="field-label" id="timeline-label">
                    Quando pretende executar
                  </span>
                  <div
                    className="chips"
                    role="group"
                    aria-labelledby="timeline-label"
                  >
                    {timelines.map((timeline) => (
                      <button
                        key={timeline}
                        type="button"
                        className="chip"
                        aria-pressed={form.timeline === timeline}
                        onClick={() => update("timeline", timeline)}
                      >
                        {timeline}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="details">
                    Detalhes do ambiente
                  </label>
                  <textarea
                    className="textarea"
                    id="details"
                    name="details"
                    placeholder="Conte o que precisa: ambientes, se já existe forro ou piso, se há móveis no local, acesso ao prédio…"
                    value={form.details}
                    onChange={(event) => update("details", event.target.value)}
                  />
                </div>

                <div className="field-group">
                  <span className="field-label">Fotos ou planta</span>
                  <input
                    className="visually-hidden"
                    id="file-upload"
                    name="file"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(event) =>
                      update("fileName", event.target.files?.[0]?.name ?? "")
                    }
                  />
                  <label className="upload" htmlFor="file-upload">
                    <Icon name="upload" size={18} />
                    <span>
                      <strong>
                        {form.fileName || "Anexar fotos ou planta do ambiente"}
                      </strong>
                      <span>JPG, PNG ou PDF · até 20 MB</span>
                    </span>
                  </label>
                </div>
              </>
            ) : (
              <>
                <dl className="review-list">
                  <div>
                    <dt>Serviços</dt>
                    <dd>{selectedTitles.join(", ") || "A definir"}</dd>
                  </div>
                  <div>
                    <dt>Imóvel</dt>
                    <dd>
                      {form.property}
                      {form.area ? ` · ${form.area} m² no total` : ""}
                      {form.rooms ? ` · ${form.rooms} ambientes` : ""}
                    </dd>
                  </div>
                  <div>
                    <dt>Local</dt>
                    <dd>
                      {form.city}
                      {form.district ? ` · ${form.district}` : ""}
                    </dd>
                  </div>
                  <div>
                    <dt>Prazo</dt>
                    <dd>{form.timeline}</dd>
                  </div>
                  {form.details ? (
                    <div>
                      <dt>Detalhes</dt>
                      <dd>{form.details}</dd>
                    </div>
                  ) : null}
                </dl>

                <div className="field-row">
                  <div className="field-group">
                    <label className="field-label" htmlFor="name">
                      Seu nome
                    </label>
                    <input
                      className="input"
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={form.name}
                      onChange={(event) => update("name", event.target.value)}
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label" htmlFor="phone">
                      WhatsApp
                    </label>
                    <input
                      className="input"
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="(31) 90000-0000"
                      value={form.phone}
                      onChange={(event) => update("phone", event.target.value)}
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="email">
                    E-mail
                  </label>
                  <input
                    className="input"
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="voce@email.com"
                    value={form.email}
                    onChange={(event) => update("email", event.target.value)}
                  />
                </div>

                <label className="checkbox-row" htmlFor="consent">
                  <input
                    id="consent"
                    name="consent"
                    type="checkbox"
                    checked={form.consent}
                    onChange={(event) => update("consent", event.target.checked)}
                  />
                  <span>
                    Autorizo o uso destes dados para retorno do orçamento, conforme
                    a <Link href="/privacidade">política de privacidade</Link>.
                  </span>
                </label>
              </>
            )}

            {error ? (
              <p className="form-error" role="alert">
                {error}
              </p>
            ) : null}

            <div className="card-footer">
              <p>
                {step === 1
                  ? "Seus dados são usados apenas para este orçamento."
                  : "Nada é enviado sem a sua confirmação."}
                {draftSaved ? (
                  <span className="draft-status" role="status">
                    {" "}
                    Rascunho salvo.
                  </span>
                ) : null}
              </p>
              <div className="card-actions">
                {step === 1 ? (
                  <>
                    <button
                      className="link-button"
                      type="button"
                      onClick={saveDraft}
                    >
                      Salvar rascunho
                    </button>
                    <button className="btn btn-accent" type="submit">
                      Continuar
                      <Icon name="arrow-right" size={16} className="icon-arrow" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="link-button"
                      type="button"
                      onClick={() => {
                        setError("");
                        setStep(1);
                      }}
                    >
                      Voltar
                    </button>
                    <button className="btn btn-accent" type="submit">
                      Receber orçamento
                      <Icon name="arrow-right" size={16} className="icon-arrow" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
