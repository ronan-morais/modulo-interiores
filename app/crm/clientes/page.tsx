import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CrmShell } from "@/components/CrmShell";
import { Icon } from "@/components/Icon";
import { isAuthenticated, whatsappHref } from "@/lib/crm";
import { listClientes, type Cliente } from "@/lib/clientes";
import { deleteCliente, saveCliente } from "../actions";

export const metadata: Metadata = {
  title: "Clientes",
  robots: { index: false, follow: false, nocache: true },
};

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ salvo?: string; erro?: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/crm");

  const { salvo, erro } = await searchParams;
  const clientes = await listClientes();

  return (
    <CrmShell
      title="Clientes"
      subtitle="Quem já pediu ou fechou serviço, com contato à mão."
    >
      <div className="crm-detail-grid">
        <section aria-labelledby="clientes-title">
          <div className="crm-list-head">
            <h2 id="clientes-title">Carteira</h2>
            <span className="crm-list-count">
              {clientes.length} {clientes.length === 1 ? "cliente" : "clientes"}
            </span>
          </div>

          {clientes.length === 0 ? (
            <div className="crm-empty">
              <h2>Nenhum cliente cadastrado</h2>
              <p>
                Cadastre quem já pediu ou fechou serviço para ter o contato à
                mão na hora de ligar.
              </p>
            </div>
          ) : (
            <ul className="crm-clients">
              {clientes.map((cliente) => (
                <ClienteRow key={cliente.id} cliente={cliente} />
              ))}
            </ul>
          )}
        </section>

        <aside className="crm-panel" aria-labelledby="novo-cliente-title">
          <h2 id="novo-cliente-title">Novo cliente</h2>

          {erro ? (
            <p className="crm-alert" role="alert">
              Informe o nome do cliente.
            </p>
          ) : null}

          <form action={saveCliente} className="crm-form">
            <ClienteFields idPrefix="novo" />
            <div className="crm-form-actions">
              <button className="btn btn-dark btn-md" type="submit">
                Salvar cliente
              </button>
              {salvo ? <span className="crm-saved">Cliente salvo.</span> : null}
            </div>
          </form>
        </aside>
      </div>
    </CrmShell>
  );
}

function ClienteRow({ cliente }: { cliente: Cliente }) {
  const digits = cliente.whatsapp.replace(/\D/g, "");
  const telHref = digits ? `tel:+${digits}` : null;
  const waHref = whatsappHref(cliente.whatsapp);
  const local = [cliente.cidade, cliente.bairro].filter(Boolean).join(" · ");

  return (
    <li className="crm-client">
      <div className="crm-client-head">
        <h3>{cliente.nome}</h3>
        {local ? <span className="crm-muted">{local}</span> : null}
      </div>

      {digits || cliente.email ? (
        <div className="crm-contact-links">
          {telHref ? (
            <a href={telHref}>
              <Icon name="phone" size={15} />
              {cliente.whatsapp}
            </a>
          ) : null}
          {waHref ? (
            <a href={waHref} target="_blank" rel="noopener noreferrer">
              <Icon name="message-circle" size={15} />
              WhatsApp
            </a>
          ) : null}
          {cliente.email ? (
            <a href={`mailto:${cliente.email}`}>
              <Icon name="mail" size={15} />
              {cliente.email}
            </a>
          ) : null}
        </div>
      ) : null}

      {cliente.observacoes ? (
        <p className="crm-muted crm-client-note">{cliente.observacoes}</p>
      ) : null}

      <details className="crm-client-edit">
        <summary>Editar cadastro</summary>
        <form action={saveCliente} className="crm-form">
          <input type="hidden" name="id" value={cliente.id} />
          <ClienteFields cliente={cliente} idPrefix={`edit-${cliente.id}`} />
          <div className="crm-form-actions">
            <button className="btn btn-dark btn-sm" type="submit">
              Salvar
            </button>
          </div>
        </form>

        <details className="crm-danger">
          <summary>Remover cliente</summary>
          <p>O cadastro sai da lista e não pode ser recuperado.</p>
          <form action={deleteCliente}>
            <input type="hidden" name="id" value={cliente.id} />
            <button className="btn btn-outline btn-sm" type="submit">
              Confirmar remoção
            </button>
          </form>
        </details>
      </details>
    </li>
  );
}

function ClienteFields({
  cliente,
  idPrefix,
}: {
  cliente?: Cliente;
  idPrefix: string;
}) {
  return (
    <>
      <div className="field-group">
        <label className="field-label" htmlFor={`${idPrefix}-nome`}>
          Nome
        </label>
        <input
          className="input"
          id={`${idPrefix}-nome`}
          name="nome"
          required
          maxLength={120}
          defaultValue={cliente?.nome}
        />
      </div>

      <div className="field-row">
        <div className="field-group">
          <label className="field-label" htmlFor={`${idPrefix}-whatsapp`}>
            WhatsApp
          </label>
          <input
            className="input"
            id={`${idPrefix}-whatsapp`}
            name="whatsapp"
            type="tel"
            maxLength={40}
            placeholder="(31) 99999-0000"
            defaultValue={cliente?.whatsapp}
          />
        </div>
        <div className="field-group">
          <label className="field-label" htmlFor={`${idPrefix}-email`}>
            E-mail
          </label>
          <input
            className="input"
            id={`${idPrefix}-email`}
            name="email"
            type="email"
            maxLength={160}
            defaultValue={cliente?.email}
          />
        </div>
      </div>

      <div className="field-row">
        <div className="field-group">
          <label className="field-label" htmlFor={`${idPrefix}-cidade`}>
            Cidade
          </label>
          <input
            className="input"
            id={`${idPrefix}-cidade`}
            name="cidade"
            maxLength={80}
            defaultValue={cliente?.cidade}
          />
        </div>
        <div className="field-group">
          <label className="field-label" htmlFor={`${idPrefix}-bairro`}>
            Bairro
          </label>
          <input
            className="input"
            id={`${idPrefix}-bairro`}
            name="bairro"
            maxLength={80}
            defaultValue={cliente?.bairro}
          />
        </div>
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor={`${idPrefix}-observacoes`}>
          Observações
        </label>
        <textarea
          className="textarea"
          id={`${idPrefix}-observacoes`}
          name="observacoes"
          maxLength={2000}
          rows={3}
          defaultValue={cliente?.observacoes}
        />
      </div>
    </>
  );
}
