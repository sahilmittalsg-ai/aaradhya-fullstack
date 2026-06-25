import { FormEvent, useState } from "react";
import { trackOrder } from "../../lib/api";
import type { Order } from "../../types";

const steps = ["placed", "packed", "shipped", "delivered"];

export function TrackOrder() {
  const [order, setOrder] = useState<Order>();
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const orderNumber = String(new FormData(event.currentTarget).get("orderNumber") || "");
    const result = await trackOrder(orderNumber);
    setOrder(result);
    setError(result ? "" : "Order not found");
  }

  return (
    <section className="container-pad py-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-saffron">Order Tracking</p>
        <h1 className="mt-2 text-4xl font-black">Track your shipment</h1>
        <form onSubmit={submit} className="mt-8 flex gap-3 rounded-lg border border-rudra/10 bg-white p-3">
          <input name="orderNumber" className="input border-0" placeholder="Enter order number, e.g. ORD-24062001" />
          <button className="btn-primary">Track</button>
        </form>
        {error && <p className="mt-4 text-sm font-bold text-red-600">{error}</p>}
        {order && (
          <div className="mt-8 rounded-lg border border-rudra/10 bg-white p-6">
            <div className="flex justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">{order.orderNumber}</h2>
                <p className="mt-1 text-sm text-ink/55">{order.customer.name} | Rs.{order.total}</p>
              </div>
              <span className="h-max rounded-full bg-sandal px-4 py-2 text-sm font-black capitalize text-rudra">
                {order.status}
              </span>
            </div>
            {(order.trackingId || order.courierPartner || order.adminNotes) && (
              <div className="mt-5 grid gap-3 rounded-lg bg-sandal p-4 text-sm md:grid-cols-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-rudra/60">Courier</p>
                  <p className="mt-1 font-black">{order.courierPartner || "Not assigned"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-rudra/60">Tracking ID</p>
                  <p className="mt-1 font-black">{order.trackingId || "Pending"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-rudra/60">Admin Note</p>
                  <p className="mt-1 font-black">{order.adminNotes || "No note"}</p>
                </div>
              </div>
            )}
            <div className="mt-8 grid gap-3 sm:grid-cols-4">
              {steps.map((step, index) => {
                const active = steps.indexOf(order.status) >= index;
                return (
                  <div key={step} className={`rounded-lg p-4 ${active ? "bg-ink text-white" : "bg-sandal text-ink/50"}`}>
                    <p className="text-sm font-black capitalize">{step}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
