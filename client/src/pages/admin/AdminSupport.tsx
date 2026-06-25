import { MessageSquareReply } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { AdminShell } from "../../components/AdminShell";
import { getSupportTickets, updateSupportTicket } from "../../lib/api";
import type { SupportTicket } from "../../types";

const statusLabels = {
  open: "Open",
  "in-progress": "In Progress",
  resolved: "Resolved"
};

export function AdminSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selected, setSelected] = useState<SupportTicket>();
  const [status, setStatus] = useState("open");

  useEffect(() => {
    getSupportTickets().then((items) => {
      setTickets(items);
      setSelected(items[0]);
      setStatus(items[0]?.status || "open");
    });
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected?._id) return;

    const form = new FormData(event.currentTarget);
    const reply = String(form.get("reply") || "");
    const updated = await updateSupportTicket(selected._id, { status, reply });
    setSelected(updated);
    setTickets((current) => current.map((ticket) => (ticket._id === updated._id ? updated : ticket)));
    event.currentTarget.reset();
  }

  return (
    <AdminShell title="Support Tickets">
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <button
              key={ticket._id || ticket.subject}
              onClick={() => {
                setSelected(ticket);
                setStatus(ticket.status);
              }}
              className={`w-full rounded-lg border p-4 text-left ${
                selected?._id === ticket._id ? "border-rudra bg-sandal" : "border-rudra/10 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <b>{ticket.subject}</b>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black capitalize text-rudra">
                  {statusLabels[ticket.status as keyof typeof statusLabels]}
                </span>
              </div>
              <p className="mt-2 text-sm text-ink/55">{ticket.name} | {ticket.category.replace("-", " ")}</p>
              {ticket.orderNumber && <p className="mt-1 text-xs font-bold text-saffron">{ticket.orderNumber}</p>}
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-rudra/10 bg-white p-6">
          {selected ? (
            <>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-saffron">Ticket Detail</p>
              <h2 className="mt-2 text-2xl font-black">{selected.subject}</h2>
              <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                <Info label="Customer" value={selected.name} />
                <Info label="Email" value={selected.email} />
                <Info label="Phone" value={selected.phone || "-"} />
                <Info label="Order" value={selected.orderNumber || "-"} />
                <Info label="Category" value={selected.category.replace("-", " ")} />
                <Info label="Priority" value={selected.priority || "normal"} />
              </div>
              <div className="mt-5 rounded-lg bg-sandal p-4 text-sm leading-7 text-ink/70">
                {selected.message}
              </div>

              <div className="mt-5 space-y-3">
                {(selected.replies || []).map((reply, index) => (
                  <div key={`${reply.createdAt}-${index}`} className="rounded-lg border border-rudra/10 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{reply.authorRole}</p>
                    <p className="mt-2 text-sm text-ink/65">{reply.message}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={submit} className="mt-6">
                <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                  <select value={status} onChange={(event) => setStatus(event.target.value)} className="input">
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <textarea name="reply" className="input min-h-28" placeholder="Write admin reply" />
                </div>
                <button className="btn-primary mt-4 gap-2">
                  <MessageSquareReply size={18} /> Update Ticket
                </button>
              </form>
            </>
          ) : (
            <p>No support tickets yet.</p>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-sandal p-3">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-rudra/60">{label}</p>
      <p className="mt-1 font-bold capitalize">{value}</p>
    </div>
  );
}
