import {
  ArrowRight,
  Bot,
  CreditCard,
  Headphones,
  MessageCircle,
  PackageSearch,
  RefreshCcw,
  ShieldQuestion,
  Truck,
  XCircle
} from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { createSupportTicket, getAssistantOrders } from "../../lib/api";
import type { Order } from "../../types";

const supportTopics = [
  {
    key: "order-tracking",
    title: "Order Tracking",
    text: "Get shipping updates, delivery timeline, and tracking help.",
    icon: PackageSearch
  },
  {
    key: "returns-exchange",
    title: "Returns & Exchange",
    text: "Request a replacement, exchange, or return assistance.",
    icon: RefreshCcw
  },
  {
    key: "cancellation",
    title: "Cancellation",
    text: "Need to cancel before dispatch? Send a quick ticket.",
    icon: XCircle
  },
  {
    key: "product-info",
    title: "Product Information",
    text: "Ask about size, material, care, or product selection.",
    icon: ShieldQuestion
  }
];

export function Support() {
  const [category, setCategory] = useState("order-tracking");
  const [ticketMessage, setTicketMessage] = useState("");
  const [linkedPhone, setLinkedPhone] = useState("");
  const [assistantOrders, setAssistantOrders] = useState<Order[]>([]);
  const [assistantMode, setAssistantMode] = useState<"orders" | "shipping" | "cancel" | "payment">("orders");
  const [assistantMessage, setAssistantMessage] = useState("Enter your linked mobile number and choose what you need help with.");
  const [assistantLoading, setAssistantLoading] = useState(false);

  async function askAssistant(mode: "orders" | "shipping" | "cancel" | "payment") {
    const phone = linkedPhone.trim();
    setAssistantMode(mode);

    if (!phone) {
      setAssistantMessage("Please enter the mobile number linked with your order.");
      return;
    }

    setAssistantLoading(true);
    try {
      const orders = await getAssistantOrders(phone);
      setAssistantOrders(orders);
      if (!orders.length) {
        setAssistantMessage("I could not find orders for this number. Check the number or create a support ticket below.");
      } else if (mode === "shipping") {
        setAssistantMessage("Here are the shipping and tracking details linked to this number.");
      } else if (mode === "cancel") {
        setAssistantMessage("Choose the order you want to cancel. I will send a cancellation request to admin.");
      } else if (mode === "payment") {
        setAssistantMessage("Here are the payment details for your linked orders.");
      } else {
        setAssistantMessage("Here are your linked orders.");
      }
    } catch {
      setAssistantMessage("I could not connect to order support right now. Please create a support ticket below.");
    } finally {
      setAssistantLoading(false);
    }
  }

  async function requestCancellation(order: Order) {
    try {
      await createSupportTicket({
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
        orderNumber: order.orderNumber,
        category: "cancellation",
        priority: "high",
        subject: `Cancel order request - ${order.orderNumber}`,
        message: [
          `Customer requested cancellation from AI Sevak.`,
          `Order Number: ${order.orderNumber}`,
          `Order Status: ${order.status}`,
          `Payment Status: ${order.paymentStatus}`,
          `Total: Rs.${order.total}`,
          `Linked Phone: ${order.customer.phone}`
        ].join("\n")
      });
      setAssistantMessage(`Cancellation request sent to admin for ${order.orderNumber}.`);
    } catch {
      setAssistantMessage("Could not send cancellation request. Please create a support ticket below.");
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      orderNumber: form.get("orderNumber"),
      category,
      subject: form.get("subject"),
      message: form.get("message")
    };

    try {
      await createSupportTicket(payload);
      setTicketMessage("Support ticket created. Our team will reply during business hours.");
      event.currentTarget.reset();
    } catch {
      setTicketMessage("Ticket saved in demo mode. Connect backend after Node and MongoDB are running.");
    }
  }

  return (
    <section>
      <div className="bg-sandal">
        <div className="container-pad grid gap-10 py-14 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-saffron">Customer Support</p>
            <h1 className="mt-3 text-4xl font-black md:text-5xl">Aaradhya Sevak will help with your questions.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/65">
              Create a ticket for order tracking, returns, cancellation, product information, or any other support query.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/track-order" className="btn-primary gap-2">
                Track My Order <ArrowRight size={18} />
              </Link>
              <a href="#support-form" className="btn-secondary gap-2">
                <MessageCircle size={18} /> Contact Support
              </a>
            </div>
          </div>
          <div className="rounded-lg border border-rudra/10 bg-white p-6 shadow-soft">
            <Headphones className="text-saffron" size={38} />
            <h2 className="mt-4 text-2xl font-black">Business hours</h2>
            <p className="mt-3 text-sm leading-7 text-ink/60">
              Monday to Saturday, 10 AM to 5 PM. Most replies are handled within 24 working hours.
            </p>
            <div className="mt-5 rounded-md bg-sandal p-4 text-sm font-semibold text-rudra">
              WhatsApp can be used for order updates and promotions. For specific help, create a ticket below.
            </div>
          </div>
        </div>
      </div>

      <div className="container-pad py-12">
        <div className="rounded-lg border border-rudra/10 bg-white p-5 shadow-soft md:p-6">
          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-rudra text-white">
                  <Bot size={22} />
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-saffron">AI Sevak</p>
                  <h2 className="text-2xl font-black">Help from linked number</h2>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-ink/60">
                Enter the mobile number used at checkout. The assistant can show your orders, shipping details, payment
                status, and send cancellation requests to admin.
              </p>
              <div className="mt-5 grid gap-3">
                <input
                  value={linkedPhone}
                  onChange={(event) => setLinkedPhone(event.target.value)}
                  className="input"
                  inputMode="tel"
                  placeholder="Linked mobile number"
                />
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => askAssistant("orders")} className="btn-secondary gap-2 px-3">
                    <PackageSearch size={16} /> My Orders
                  </button>
                  <button type="button" onClick={() => askAssistant("shipping")} className="btn-secondary gap-2 px-3">
                    <Truck size={16} /> Shipping
                  </button>
                  <button type="button" onClick={() => askAssistant("cancel")} className="btn-secondary gap-2 px-3">
                    <XCircle size={16} /> Cancel
                  </button>
                  <button type="button" onClick={() => askAssistant("payment")} className="btn-secondary gap-2 px-3">
                    <CreditCard size={16} /> Payment
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-sandal p-4 md:p-5">
              <p className="rounded-md bg-white px-4 py-3 text-sm font-semibold leading-6 text-rudra">
                {assistantLoading ? "Checking your linked orders..." : assistantMessage}
              </p>

              {assistantOrders.length > 0 && (
                <div className="mt-4 grid gap-3">
                  {assistantOrders.map((order) => (
                    <div key={order.orderNumber} className="rounded-md border border-rudra/10 bg-white p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-black text-rudra">{order.orderNumber}</p>
                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">
                            {order.items.length} item{order.items.length === 1 ? "" : "s"} | Rs.{order.total}
                          </p>
                        </div>
                        <span className="w-max rounded-full bg-sandal px-3 py-1 text-xs font-black capitalize text-rudra">
                          {order.status}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 text-sm leading-6 text-ink/65 md:grid-cols-2">
                        <p>
                          <b>Shipping:</b> {shippingSummary(order)}
                        </p>
                        <p>
                          <b>Payment:</b> {paymentSummary(order)}
                        </p>
                        <p>
                          <b>Courier:</b> {order.courierPartner || "Will be assigned after packing"}
                        </p>
                        <p>
                          <b>Tracking:</b> {order.trackingId || "Not available yet"}
                        </p>
                      </div>

                      <div className="mt-3 text-sm text-ink/60">
                        <b>Products:</b> {order.items.map((item) => `${item.title} x ${item.quantity}`).join(", ")}
                      </div>

                      {assistantMode === "cancel" && (
                        <button
                          type="button"
                          onClick={() => requestCancellation(order)}
                          disabled={["shipped", "delivered", "cancelled"].includes(order.status)}
                          className="mt-4 rounded-md bg-[#cb3d3f] px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {order.status === "cancelled" ? "Already Cancelled" : "Send Cancel Request"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {supportTopics.map((topic) => (
            <button
              key={topic.key}
              onClick={() => setCategory(topic.key)}
              className={`rounded-lg border p-5 text-left transition ${
                category === topic.key ? "border-rudra bg-white shadow-soft" : "border-rudra/10 bg-white hover:border-rudra/40"
              }`}
            >
              <topic.icon className="text-saffron" />
              <h3 className="mt-4 font-black">{topic.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink/55">{topic.text}</p>
            </button>
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_360px]">
          <form id="support-form" onSubmit={submit} className="rounded-lg border border-rudra/10 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Create support ticket</h2>
            <p className="mt-2 text-sm text-ink/55">Selected topic: <b>{supportTopics.find((topic) => topic.key === category)?.title}</b></p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <input name="name" className="input" placeholder="Full name" required />
              <input name="email" type="email" className="input" placeholder="Email" required />
              <input name="phone" className="input" placeholder="Phone number" />
              <input name="orderNumber" className="input" placeholder="Order number, if related" />
              <input name="subject" className="input md:col-span-2" placeholder="Subject" required />
              <textarea name="message" className="input min-h-36 md:col-span-2" placeholder="Tell us what you need help with" required />
            </div>

            <button className="btn-primary mt-6">Submit Ticket</button>
            {ticketMessage && <p className="mt-4 rounded-md bg-sandal p-3 text-sm font-semibold text-rudra">{ticketMessage}</p>}
          </form>

          <aside className="space-y-4">
            {[
              ["Track order quickly", "Use your order number to view placed, packed, shipped, and delivered status."],
              ["Returns and exchange", "Share your order number and issue details so support can review faster."],
              ["Product guidance", "Ask about sizing, material, care instructions, or the right product for your intent."]
            ].map(([title, text]) => (
              <div key={title} className="rounded-lg border border-rudra/10 bg-white p-5">
                <h3 className="font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink/55">{text}</p>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </section>
  );
}

function shippingSummary(order: Order) {
  if (order.status === "delivered") return "Delivered";
  if (order.status === "shipped") return "Shipped and on the way";
  if (order.status === "packed") return "Packed and waiting for courier pickup";
  if (order.status === "cancelled") return "Order cancelled";
  return "Order placed. Standard delivery usually takes 3-7 days after dispatch.";
}

function paymentSummary(order: Order) {
  const method = order.paymentMethod ? order.paymentMethod.toUpperCase() : "COD";
  if (order.paymentStatus === "paid") return `${method} paid`;
  if (order.paymentStatus === "failed") return `${method} failed`;
  return `${method} pending`;
}
