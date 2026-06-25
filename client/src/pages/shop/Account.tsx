import { FormEvent, useEffect, useState } from "react";
import { getMySupportTickets, getProfile, requestOtp, updateProfile, verifyOtp } from "../../lib/api";
import type { Address, ClientUser, SupportTicket } from "../../types";

const emptyAddress: Address = {
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: ""
};

export function Account() {
  const [message, setMessage] = useState("Login with mobile OTP. In development, OTP is 123456.");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [user, setUser] = useState<ClientUser | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? (JSON.parse(saved) as ClientUser) : null;
  });
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [phone, setPhone] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [devOtp, setDevOtp] = useState("");

  useEffect(() => {
    getMySupportTickets().then(setTickets);
    if (localStorage.getItem("token")) {
      getProfile()
        .then((profile) => {
          setUser(profile);
          localStorage.setItem("user", JSON.stringify(profile));
        })
        .catch(() => undefined);
    }
  }, []);

  async function submitPhone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const result = await requestOtp(phone);
      setOtpRequested(true);
      setDevOtp(result.devOtp || "");
      setMessage(result.devOtp ? `OTP sent. Development OTP: ${result.devOtp}` : "OTP sent to your mobile number.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not send OTP");
    }
  }

  async function submitOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const result: any = await verifyOtp({
        phone,
        code: String(form.get("code")),
        name: String(form.get("name") || "")
      });
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      setUser(result.user);
      setMessage(`Logged in with OTP as ${result.user.name} (${result.user.role})`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "OTP verification failed");
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
      pincode: address.pincode.trim()
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

  function updateAddress(field: keyof Address, value: string) {
    setAddress((current) => ({ ...current, [field]: value }));
  }

  async function resendOtp() {
    try {
      const result = await requestOtp(phone);
      setDevOtp(result.devOtp || "");
      setMessage(result.devOtp ? `OTP resent. Development OTP: ${result.devOtp}` : "OTP resent to your mobile number.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not resend OTP");
    }
  }

  return (
    <section className="container-pad py-10">
      <div className="grid gap-8 lg:grid-cols-[440px_1fr]">
        <div className="rounded-lg border border-rudra/10 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-saffron">Client Panel</p>
          <h1 className="mt-2 text-3xl font-black">Login</h1>

          <div className="mt-6 rounded-md bg-sandal px-4 py-3 text-center text-sm font-black text-rudra">
            Mobile OTP
          </div>

          <div className="mt-6">
            {!otpRequested ? (
              <form onSubmit={submitPhone} className="space-y-4">
                <input
                  className="input"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Mobile number"
                  inputMode="numeric"
                  required
                />
                <button className="btn-primary w-full">Send OTP</button>
              </form>
            ) : (
              <form onSubmit={submitOtp} className="space-y-4">
                <input className="input" name="name" placeholder="Name, optional for new account" />
                <input className="input" name="code" placeholder="Enter 6 digit OTP" inputMode="numeric" maxLength={6} required />
                <button className="btn-primary w-full">Verify OTP & Login</button>
                <button type="button" onClick={resendOtp} className="btn-secondary w-full">
                  Resend OTP
                </button>
                <button type="button" onClick={() => setOtpRequested(false)} className="btn-secondary w-full">
                  Change Number
                </button>
              </form>
            )}
            {devOtp && <p className="mt-3 rounded-md bg-sandal p-3 text-sm font-bold text-rudra">Development OTP: {devOtp}</p>}
          </div>

          <p className="mt-4 text-sm text-ink/60">{message}</p>
        </div>

        <div className="rounded-lg border border-rudra/10 bg-white p-6">
          <h2 className="text-2xl font-black">Client dashboard preview</h2>
          {user && (
            <p className="mt-2 text-sm text-ink/60">
              Logged in ID: <b>{user.id || user._id}</b>
            </p>
          )}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {["Orders", "Wishlist", "Support Tickets"].map((item) => (
              <div key={item} className="rounded-lg bg-sandal p-5">
                <p className="font-black">{item}</p>
                <p className="mt-2 text-sm text-ink/55">Ready for account-specific data from backend APIs.</p>
              </div>
            ))}
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
