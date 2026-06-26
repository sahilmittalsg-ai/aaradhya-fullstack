import { FormEvent, useEffect, useState } from "react";
import { getMyOrders, getMySupportTickets, getProfile, requestOtp, updateProfile, verifyOtp } from "../../lib/api";
import type { Address, ClientUser, Order, SupportTicket } from "../../types";

const emptyAddress: Address = {
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  phone: ""
};

export function Account() {
  const [message, setMessage] = useState("Login with email OTP. In development, OTP is visible on screen.");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [user, setUser] = useState<ClientUser | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? (JSON.parse(saved) as ClientUser) : null;
  });
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [email, setEmail] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [devOtp, setDevOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      loadAccountData();
    }
  }, []);

  async function loadAccountData() {
    setLoadingAccount(true);
    try {
      const saved = localStorage.getItem("user");
      const savedUser = saved ? (JSON.parse(saved) as ClientUser) : null;

      try {
        const profile = await getProfile();
        setUser(profile);
        localStorage.setItem("user", JSON.stringify(profile));
      } catch {
        if (savedUser) setUser(savedUser);
      }

      await Promise.all([
        getMyOrders().then((orderRows) => {
          setOrders(orderRows);
        }),
        getMySupportTickets()
          .catch(() => [])
          .then((ticketRows) => {
            setTickets(ticketRows);
          })
      ]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not refresh account details.");
    } finally {
      setLoadingAccount(false);
    }
  }

  async function submitPhone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setMessage("Please enter a valid email address, example: name@example.com");
      return;
    }

    setSendingOtp(true);
    setMessage("Generating OTP...");
    try {
      const result = await requestOtp(normalizedEmail);
      console.log("Visible development OTP:", result.devOtp || "123456");
      setEmail(normalizedEmail);
      setOtpRequested(true);
      setDevOtp(result.devOtp || "123456");
      setMessage(`Use visible development OTP: ${result.devOtp || "123456"}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not send OTP");
    } finally {
      setSendingOtp(false);
    }
  }

  async function submitOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const normalizedEmail = email.trim().toLowerCase();
    const code = String(form.get("code") || "").trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setMessage("Please click Change Email and enter a valid email address again.");
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setMessage("Please enter the 6 digit OTP shown on screen. Development OTP is 123456.");
      return;
    }

    setVerifyingOtp(true);
    setMessage("Logging in...");
    try {
      const result: any = await verifyOtp({
        email: normalizedEmail,
        code,
        name: String(form.get("name") || "")
      });
      console.log("Email OTP login successful:", result.user);
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      setUser(result.user);
      setOtpRequested(false);
      setDevOtp("");
      setEmail(result.user.email || normalizedEmail);
      await loadAccountData();
      setMessage(`Logged in with OTP as ${result.user.name} (${result.user.role})`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "OTP verification failed");
    } finally {
      setVerifyingOtp(false);
    }
  }

  async function saveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      setMessage("Please login with mobile OTP before saving an address.");
      return;
    }

    const nextAddress = {
      ...address,
      line1: address.line1.trim(),
      line2: address.line2?.trim() || "",
      city: address.city.trim(),
      state: address.state.trim(),
      pincode: address.pincode.trim(),
      phone: address.phone?.trim() || user.phone || ""
    };
    const addresses = [...(user.addresses || []), nextAddress];

    try {
      const updated = await updateProfile({ addresses });
      setUser(updated);
      setAddress(emptyAddress);
      setMessage("Address saved to your client id. You can reuse it at checkout.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Address could not be saved.");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setTickets([]);
    setOrders([]);
    setOtpRequested(false);
    setDevOtp("");
    setEmail("");
    setMessage("Logged out. Enter email to login again.");
  }

  function updateAddress(field: keyof Address, value: string) {
    setAddress((current) => ({ ...current, [field]: value }));
  }

  async function resendOtp() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setMessage("Please click Change Email and enter a valid email address again.");
      return;
    }

    setSendingOtp(true);
    setMessage("Regenerating OTP...");
    try {
      const result = await requestOtp(normalizedEmail);
      console.log("Visible development OTP:", result.devOtp || "123456");
      setDevOtp(result.devOtp || "123456");
      setMessage(`Use visible development OTP: ${result.devOtp || "123456"}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not resend OTP");
    } finally {
      setSendingOtp(false);
    }
  }

  return (
    <section className="container-pad py-10">
      <div className="grid gap-8 lg:grid-cols-[440px_1fr]">
        <div className="rounded-lg border border-rudra/10 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-saffron">Client Panel</p>
          <h1 className="mt-2 text-3xl font-black">{user ? "My Account" : "Login"}</h1>

          {user ? (
            <div className="mt-6 rounded-md bg-sandal p-4">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-rudra/60">Logged in</p>
              <p className="mt-2 text-xl font-black text-rudra">{user.name}</p>
              <p className="mt-1 text-sm font-semibold text-ink/65">{user.email}</p>
              <button type="button" onClick={logout} className="btn-secondary mt-5 w-full">
                Logout / Change Email
              </button>
            </div>
          ) : (
            <>
              <div className="mt-6 rounded-md bg-sandal px-4 py-3 text-center text-sm font-black text-rudra">
                Email OTP
              </div>

              <div className="mt-6">
                {!otpRequested ? (
                  <form onSubmit={submitPhone} noValidate className="space-y-4">
                    <input
                      className="input"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="Email address"
                      type="email"
                      required
                    />
                    <button type="submit" disabled={sendingOtp} className="btn-primary w-full disabled:opacity-60">
                      {sendingOtp ? "Generating OTP..." : "Send OTP"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={submitOtp} noValidate className="space-y-4">
                    <input className="input" name="name" placeholder="Name, optional for new account" />
                    <input className="input" name="code" placeholder="Enter 6 digit OTP" inputMode="numeric" maxLength={6} required />
                    <button type="submit" disabled={verifyingOtp} className="btn-primary w-full disabled:opacity-60">
                      {verifyingOtp ? "Logging in..." : "Verify OTP & Login"}
                    </button>
                    <button type="button" onClick={resendOtp} disabled={sendingOtp} className="btn-secondary w-full disabled:opacity-60">
                      {sendingOtp ? "Regenerating OTP..." : "Resend OTP"}
                    </button>
                    <button type="button" onClick={() => setOtpRequested(false)} className="btn-secondary w-full">
                      Change Email
                    </button>
                  </form>
                )}
                <p className="mt-3 rounded-md bg-sandal p-3 text-sm font-bold text-rudra">
                  OTP on screen: {devOtp || "Request OTP to show code"}
                </p>
              </div>
            </>
          )}

          <p className="mt-4 text-sm text-ink/60">{message}</p>
        </div>

        <div className="rounded-lg border border-rudra/10 bg-white p-6">
          <h2 className="text-2xl font-black">Dashboard</h2>
          {user && (
            <p className="mt-2 text-sm text-ink/60">
              Logged in ID: <b>{user.id || user._id}</b>
            </p>
          )}
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-sandal p-5">
              <p className="font-black">Total Orders</p>
              <p className="mt-2 text-2xl font-black text-rudra">{orders.length}</p>
            </div>
            <div className="rounded-lg bg-sandal p-5">
              <p className="font-black">Active Orders</p>
              <p className="mt-2 text-2xl font-black text-rudra">
                {orders.filter((order) => !["delivered", "cancelled"].includes(order.status)).length}
              </p>
            </div>
            <div className="rounded-lg bg-sandal p-5">
              <p className="font-black">Support Tickets</p>
              <p className="mt-2 text-2xl font-black text-rudra">{tickets.length}</p>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-rudra/10 p-5">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h3 className="font-black">My orders</h3>
                <p className="mt-1 text-sm text-ink/55">Order status, delivery address, payment method, and product details.</p>
              </div>
              {loadingAccount && <span className="rounded-full bg-sandal px-3 py-1 text-xs font-black text-rudra">Refreshing...</span>}
            </div>
            <div className="mt-4 space-y-4">
              {orders.map((order) => (
                <div key={order._id || order.orderNumber} className="rounded-lg border border-rudra/10 bg-sandal p-4">
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-rudra/60">Order</p>
                      <b className="text-lg">{order.orderNumber}</b>
                      <p className="mt-1 text-sm text-ink/55">
                        {formatDate(order.createdAt)} | {order.items.length} item{order.items.length === 1 ? "" : "s"} | Rs.{order.total}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge value={formatOrderStatus(order.status)} />
                      <StatusBadge value={formatPaymentMethod(order.paymentMethod)} />
                      <StatusBadge value={formatPaymentStatus(order.paymentStatus, order.paymentMethod)} />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-md bg-white p-4 text-sm leading-6">
                      <p className="font-black text-ink">Delivery Address</p>
                      <p className="mt-2 text-ink/65">{formatAddress(order.shippingAddress)}</p>
                    </div>
                    <div className="rounded-md bg-white p-4 text-sm leading-6">
                      <p className="font-black text-ink">Payment & Dispatch</p>
                      <p className="mt-2 text-ink/65">
                        Method: <b>{formatPaymentMethod(order.paymentMethod)}</b>
                        <br />
                        Payment: <b>{formatPaymentStatus(order.paymentStatus, order.paymentMethod)}</b>
                        <br />
                        Condition: <b>{formatOrderStatus(order.status)}</b>
                        {order.courierPartner ? <><br />Courier: <b>{order.courierPartner}</b></> : null}
                        {order.trackingId ? <><br />Tracking: <b>{order.trackingId}</b></> : null}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {order.items.map((item, index) => (
                      <div key={`${order.orderNumber}-${item.slug || item.title}-${index}`} className="flex gap-3 rounded-md bg-white p-3">
                        <img src={orderItemImage(item)} alt={item.title} className="h-16 w-16 rounded-md object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="font-black leading-5">{item.title}</p>
                          <p className="mt-1 text-xs text-ink/55">
                            Qty {item.quantity}
                            {item.selectedSizeLabel ? ` | Size: ${item.selectedSizeLabel}` : ""}
                            {" | "}Rs.{item.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.adminNotes && (
                    <p className="mt-3 rounded-md bg-white px-4 py-3 text-sm font-semibold text-ink/65">
                      Admin note: {order.adminNotes}
                    </p>
                  )}
                </div>
              ))}
              {!orders.length && (
                <p className="rounded-md bg-sandal p-4 text-sm text-ink/55">
                  No account orders found yet. Make sure you are logged in with the same email used at checkout.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-rudra/10 p-5">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h3 className="font-black">Saved addresses</h3>
                <p className="mt-1 text-sm text-ink/55">Use these addresses again during checkout.</p>
              </div>
              <span className="rounded-full bg-sandal px-3 py-1 text-xs font-black text-rudra">
                {(user?.addresses || []).length} saved
              </span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {(user?.addresses || []).map((item, index) => (
                <div key={`${item.line1}-${index}`} className="rounded-md bg-sandal p-4 text-sm leading-6 text-ink/65">
                  <b className="text-ink">Address {index + 1}</b>
                  <p className="mt-2">
                    {item.phone ? <>{item.phone}<br /></> : null}
                    {item.line1}
                    {item.line2 ? `, ${item.line2}` : ""}
                    <br />
                    {item.city}, {item.state} - {item.pincode}
                  </p>
                </div>
              ))}
              {!user?.addresses?.length && (
                <p className="rounded-md bg-sandal p-4 text-sm text-ink/55">No saved address yet. Add one below.</p>
              )}
            </div>

            <form onSubmit={saveAddress} className="mt-5 grid gap-3 md:grid-cols-2">
              <input className="input md:col-span-2" value={address.phone || ""} onChange={(e) => updateAddress("phone", e.target.value)} placeholder="Phone number for this address" required />
              <input className="input md:col-span-2" value={address.line1} onChange={(e) => updateAddress("line1", e.target.value)} placeholder="House no, street, area" required />
              <input className="input md:col-span-2" value={address.line2 || ""} onChange={(e) => updateAddress("line2", e.target.value)} placeholder="Landmark or apartment, optional" />
              <input className="input" value={address.city} onChange={(e) => updateAddress("city", e.target.value)} placeholder="City" required />
              <input className="input" value={address.state} onChange={(e) => updateAddress("state", e.target.value)} placeholder="State" required />
              <input className="input" value={address.pincode} onChange={(e) => updateAddress("pincode", e.target.value)} placeholder="Pincode" required />
              <button className="btn-primary md:col-span-2">Add New Address</button>
            </form>
          </div>
          <div className="mt-6 rounded-lg border border-rudra/10 p-5">
            <h3 className="font-black">Recent support tickets</h3>
            <div className="mt-4 space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket._id || ticket.subject} className="rounded-md bg-sandal p-4">
                  <div className="flex items-center justify-between gap-3">
                    <b>{ticket.subject}</b>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black capitalize text-rudra">
                      {ticket.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink/55">
                    {ticket.category.replace("-", " ")} {ticket.orderNumber ? `| ${ticket.orderNumber}` : ""}
                  </p>
                  {!!ticket.replies?.length && (
                    <div className="mt-3 rounded-md bg-white p-3 text-sm leading-6 text-ink/65">
                      <b className="text-rudra">Admin replies</b>
                      <div className="mt-2 space-y-2">
                        {ticket.replies.map((reply, index) => (
                          <p key={`${ticket._id}-reply-${index}`}>
                            {reply.message}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {!tickets.length && (
                <p className="rounded-md bg-sandal p-4 text-sm text-ink/55">No support tickets yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusBadge({ value }: { value: string }) {
  return (
    <span className="w-max rounded-full bg-white px-3 py-1 text-xs font-black capitalize text-rudra">
      {value}
    </span>
  );
}

function formatOrderStatus(status: Order["status"]) {
  const labels: Record<string, string> = {
    placed: "Confirmed",
    packed: "Packed",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled"
  };

  return labels[status] || status || "Confirmed";
}

function formatPaymentMethod(method?: Order["paymentMethod"]) {
  const labels: Record<string, string> = {
    cod: "COD",
    upi: "UPI",
    card: "Card",
    netbanking: "Net Banking",
    wallet: "Wallet"
  };

  return labels[String(method || "cod")] || "COD";
}

function formatPaymentStatus(status: Order["paymentStatus"], method?: Order["paymentMethod"]) {
  if (method === "cod" && status === "pending") return "Pay on Delivery";
  const labels: Record<string, string> = {
    pending: "Pending",
    paid: "Paid",
    failed: "Failed"
  };

  return labels[status] || status || "Pending";
}

function formatAddress(address?: Order["shippingAddress"]) {
  if (!address) return "Delivery address not available.";

  return [
    address.line1,
    address.line2,
    [address.city, address.state].filter(Boolean).join(", "),
    address.pincode
  ]
    .filter(Boolean)
    .join(", ");
}

function formatDate(value?: string) {
  if (!value) return "Date not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function orderItemImage(item: Order["items"][number]) {
  return item.images?.[0] || (item as unknown as { image?: string }).image || "/assets/products/rudraksha-bracelet.png";
}
