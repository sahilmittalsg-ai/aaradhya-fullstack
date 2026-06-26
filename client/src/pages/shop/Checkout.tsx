import { CheckCircle2, CreditCard, Landmark, PackageCheck, Tag, Truck, Wallet } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { createMockPayment, getPaymentMethods, getProfile, placeOrder, updateProfile, validateCoupon } from "../../lib/api";
import { calculatePriceSummary } from "../../lib/pricing";
import type { Address, ClientUser, PaymentApp, PaymentMethod } from "../../types";

type Step = "address" | "payment" | "review";

type CheckoutForm = {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  couponCode: string;
  shippingMethod: "standard" | "express";
  paymentMethod: string;
  paymentApp: string;
  billingSameAsShipping: boolean;
};

const initialForm: CheckoutForm = {
  name: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  couponCode: "",
  shippingMethod: "standard",
  paymentMethod: "cod",
  paymentApp: "",
  billingSameAsShipping: true
};

const methodIcons = {
  cod: PackageCheck,
  upi: Wallet,
  card: CreditCard,
  netbanking: Landmark,
  wallet: Wallet
};

export function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const [step, setStep] = useState<Step>("address");
  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [placing, setPlacing] = useState(false);
  const [user, setUser] = useState<ClientUser | null>(null);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | "new">("new");
  const [saveAddress, setSaveAddress] = useState(true);

  useEffect(() => {
    getPaymentMethods().then((methods) => {
      setPaymentMethods(methods);
      if (methods[0]) setForm((current) => ({ ...current, paymentMethod: methods[0].code }));
    });
    if (localStorage.getItem("token")) {
      getProfile()
        .then((profile) => {
          setUser(profile);
          setForm((current) => ({
            ...current,
            name: profile.name || current.name,
            email: profile.email || current.email,
            phone: profile.phone || current.phone
          }));
          if (profile.addresses?.[0]) applySavedAddress(profile.addresses[0], 0);
        })
        .catch(() => undefined);
    }
  }, []);

  const selectedPayment = useMemo(
    () => paymentMethods.find((method) => method.code === form.paymentMethod),
    [form.paymentMethod, paymentMethods]
  );
  const selectedApp = useMemo(
    () => selectedPayment?.apps?.find((app) => app.code === form.paymentApp),
    [form.paymentApp, selectedPayment]
  );

  const shipping = form.shippingMethod === "express" ? 149 : subtotal >= 1499 || subtotal === 0 ? 0 : 99;
  const paymentFee = selectedPayment?.fee || 0;
  const summary = calculatePriceSummary(items, shipping, paymentFee, couponDiscount);
  const total = summary.total;

  function updateField(name: keyof CheckoutForm, value: string | boolean) {
    setForm((current) => ({ ...current, [name]: value }));
    if (name === "couponCode") {
      setCouponDiscount(0);
      setCouponMessage("");
    }
  }

  function applySavedAddress(address: Address, index: number) {
    setSelectedAddressIndex(index);
    setForm((current) => ({
      ...current,
      phone: address.phone || current.phone,
      line1: address.line1,
      line2: address.line2 || "",
      city: address.city,
      state: address.state,
      pincode: address.pincode
    }));
  }

  async function saveCurrentAddressToProfile() {
    if (!user || !saveAddress) return;
    const address = currentAddress(form);
    const addresses = [...(user.addresses || [])];

    if (selectedAddressIndex !== "new") {
      addresses[selectedAddressIndex] = { ...addresses[selectedAddressIndex], ...address };
    } else {
      const existingIndex = addresses.findIndex((item) => sameAddressLocation(item, address));
      if (existingIndex >= 0) {
        addresses[existingIndex] = { ...addresses[existingIndex], ...address };
      } else {
        addresses.push(address);
      }
    }

    const updated = await updateProfile({ addresses });
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
  }

  async function applyCoupon() {
    setError("");
    setCouponMessage("");
    const code = form.couponCode.trim();

    if (!code) {
      setCouponDiscount(0);
      setCouponMessage("");
      return;
    }

    try {
      const result = await validateCoupon(code, subtotal);
      setCouponDiscount(result.discount);
      setCouponMessage(`${code.toUpperCase()} applied. You saved Rs.${result.discount}.`);
    } catch (couponError) {
      setCouponDiscount(0);
      setError(couponError instanceof Error ? couponError.message : "Coupon is not valid for this cart.");
    }
  }

  async function submitAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await saveCurrentAddressToProfile();
    } catch {
      setError("Address could not be saved to account, but you can continue checkout.");
    }
    setStep("payment");
  }

  async function submitPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (selectedPayment?.apps?.length && !form.paymentApp) {
      setError(`Please select a ${selectedPayment.code === "wallet" ? "wallet" : "UPI app"}.`);
      return;
    }

    if (selectedPayment?.type === "online") {
      try {
        await createMockPayment({ methodCode: selectedPayment.code, amount: total, appCode: form.paymentApp });
      } catch {
        setError("Online payment gateway is in mock mode. You can still continue to review for local testing.");
      }
    }

    setStep("review");
  }

  async function confirmOrder() {
    setPlacing(true);
    setError("");

    const paymentReference = selectedPayment?.type === "online" ? `PAY-${Date.now().toString().slice(-8)}` : "";
    const payload = {
      customer: {
        name: form.name,
        email: form.email,
        phone: form.phone
      },
      shippingAddress: {
        line1: form.line1,
        line2: form.line2,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        phone: form.phone
      },
      billingAddress: {
        line1: form.line1,
        line2: form.line2,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        phone: form.phone
      },
      shippingMethod: form.shippingMethod,
      paymentMethod: form.paymentMethod,
      paymentApp: form.paymentApp,
      paymentReference,
      couponCode: couponDiscount > 0 ? form.couponCode : "",
      items: items.map((item) => ({
        product: item._id,
        title: item.title,
        image: item.images[0],
        price: item.price,
        compareAtPrice: item.compareAtPrice,
        selectedSize: item.selectedSize,
        selectedSizeLabel: item.selectedSizeLabel,
        selectedAddOns: item.selectedAddOns,
        quantity: item.quantity
      }))
    };

    try {
      const order = await placeOrder(payload);
      setOrderNumber(order.orderNumber);
      clearCart();
    } catch (orderError) {
      setError(orderError instanceof Error ? orderError.message : "Order could not be saved. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  if (orderNumber) {
    return (
      <section className="container-pad py-16">
        <div className="mx-auto max-w-xl rounded-lg border border-rudra/10 bg-white p-8 text-center shadow-soft">
          <CheckCircle2 className="mx-auto text-green-600" size={52} />
          <p className="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-saffron">Order Placed</p>
          <h1 className="mt-3 text-3xl font-black">Thank you for your order.</h1>
          <p className="mt-4 text-ink/60">
            Your order number is <b>{orderNumber}</b>.
          </p>
          <Link to="/track-order" className="btn-primary mt-6">
            Track Order
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#f4f4f2] py-10">
      <div className="container-pad">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,620px)_380px] xl:justify-center">
        <div className="rounded-lg border border-[#e6e2dc] bg-white p-5 shadow-sm md:p-6">
          <div className="mb-7 flex items-center gap-2 text-xs font-bold">
            <button type="button" onClick={() => setStep("address")} className={step === "address" ? "text-rudra" : "text-ink/45"}>
              Cart
            </button>
            <span className="text-ink/25">›</span>
            <button type="button" onClick={() => setStep("address")} className={step === "address" ? "text-rudra" : "text-ink/45"}>
              Shipping
            </button>
            <span className="text-ink/25">›</span>
            <button type="button" onClick={() => step !== "address" && setStep("payment")} className={step === "payment" || step === "review" ? "text-rudra" : "text-ink/45"}>
              Payment
            </button>
          </div>
          {step === "address" && (
            <form id="checkout-address-form" onSubmit={submitAddress}>
              <h2 className="text-xl font-black">Shipping Address</h2>
              {user?.addresses?.length ? (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {user.addresses.map((address, index) => (
                    <button
                      key={`${address.line1}-${index}`}
                      type="button"
                      onClick={() => applySavedAddress(address, index)}
                      className={`rounded-lg border p-4 text-left text-sm leading-6 ${
                        selectedAddressIndex === index ? "border-rudra bg-sandal" : "border-rudra/10 bg-white"
                      }`}
                    >
                      <b>Saved Address {index + 1}</b>
                      <p className="mt-2 text-ink/60">
                        {address.phone ? <>{address.phone}<br /></> : null}
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ""}
                        <br />
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAddressIndex("new");
                      setForm((current) => ({ ...current, line1: "", line2: "", city: "", state: "", pincode: "" }));
                    }}
                    className={`rounded-lg border border-dashed p-4 text-left text-sm font-black ${
                      selectedAddressIndex === "new" ? "border-rudra bg-sandal" : "border-rudra/20 bg-white"
                    }`}
                  >
                    + Add New Address
                  </button>
                </div>
              ) : null}
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Field label="Full Name*" value={form.name} onChange={(value) => updateField("name", value)} placeholder="Your name" required />
                <Field label="Email*" type="email" value={form.email} onChange={(value) => updateField("email", value)} placeholder="name@example.com" required />
                <Field label="Phone number*" value={form.phone} onChange={(value) => updateField("phone", value)} placeholder="+91 00000 00000" required />
                <Field label="City*" value={form.city} onChange={(value) => updateField("city", value)} placeholder="City" required />
                <Field label="State*" value={form.state} onChange={(value) => updateField("state", value)} placeholder="State" required />
                <Field label="Zip Code*" value={form.pincode} onChange={(value) => updateField("pincode", value)} placeholder="Pincode" required />
                <Field className="md:col-span-2" label="Address line*" value={form.line1} onChange={(value) => updateField("line1", value)} placeholder="House no, street, area" required />
                <label className="md:col-span-2">
                  <span className="text-xs font-bold text-ink/70">Description</span>
                  <textarea
                    className="mt-2 min-h-24 w-full rounded-md border border-[#dedbd5] bg-white px-3 py-3 text-sm outline-none transition focus:border-rudra focus:ring-2 focus:ring-rudra/10"
                    value={form.line2}
                    onChange={(event) => updateField("line2", event.target.value)}
                    placeholder="Landmark, apartment, or delivery note..."
                  />
                </label>
              </div>
              {user && selectedAddressIndex === "new" && (
                <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-ink/70">
                  <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
                  Save this address to my client id for next order
                </label>
              )}
              {couponMessage && <p className="mt-4 rounded-md bg-green-50 px-4 py-3 text-sm font-bold text-green-700">{couponMessage}</p>}
              {error && <p className="mt-4 text-sm font-bold text-red-600">{error}</p>}
              <h3 className="mt-6 text-lg font-black">Shipping Method</h3>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <button type="button" onClick={() => updateField("shippingMethod", "standard")} className={`rounded-lg border p-4 text-left ${form.shippingMethod === "standard" ? "border-rudra bg-sandal" : "border-rudra/10"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex gap-3">
                      <Truck className="mt-0.5 text-saffron" size={18} />
                      <span><b className="block">Standard Shipping</b><span className="text-sm text-ink/55">4-7 Days</span></span>
                    </span>
                    <b>{subtotal >= 1499 ? "Free" : "Rs.99"}</b>
                  </div>
                </button>
                <button type="button" onClick={() => updateField("shippingMethod", "express")} className={`rounded-lg border p-4 text-left ${form.shippingMethod === "express" ? "border-rudra bg-sandal" : "border-rudra/10"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex gap-3">
                      <PackageCheck className="mt-0.5 text-saffron" size={18} />
                      <span><b className="block">Express Shipping</b><span className="text-sm text-ink/55">2-3 Days</span></span>
                    </span>
                    <b>Rs.149</b>
                  </div>
                </button>
              </div>
              <button disabled={items.length === 0} className="mt-6 w-full rounded-md bg-black px-5 py-4 text-sm font-black text-white transition hover:bg-ink disabled:opacity-50">
                Continue to Payment
              </button>
            </form>
          )}

          {step === "payment" && (
            <form id="checkout-payment-form" onSubmit={submitPayment}>
              <h2 className="text-2xl font-black">Payment method</h2>
              <p className="mt-2 text-sm text-ink/55">Choose how the customer will pay after address details are confirmed.</p>
              <div className="mt-6 grid gap-3">
                {paymentMethods.map((method) => {
                  const Icon = methodIcons[method.code] || Wallet;
                  const active = form.paymentMethod === method.code;
                  return (
                    <button
                      type="button"
                      key={method.code}
                      onClick={() => {
                        updateField("paymentMethod", method.code);
                        updateField("paymentApp", method.apps?.[0]?.code || "");
                      }}
                      className={`rounded-lg border p-4 text-left transition ${active ? "border-rudra bg-sandal" : "border-rudra/10 bg-white hover:border-rudra/30"}`}
                    >
                      <div className="flex gap-4">
                        <Icon className="mt-1 text-saffron" />
                        <div>
                          <b>{method.label}</b>
                          <p className="mt-1 text-sm text-ink/55">{method.description}</p>
                          {method.instructions && <p className="mt-2 text-xs font-semibold text-rudra">{method.instructions}</p>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {selectedPayment?.apps?.length ? (
                <div className="mt-6">
                  <h3 className="font-black">
                    Select {selectedPayment.code === "wallet" ? "wallet" : "UPI app"}
                  </h3>
                  <p className="mt-1 text-sm text-ink/55">
                    This demo records the selected app. Real direct app payment needs gateway keys and deep-link setup.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {selectedPayment.apps.filter((app) => app.active !== false).map((app) => (
                      <PaymentAppTile
                        key={app.code}
                        app={app}
                        active={form.paymentApp === app.code}
                        onClick={() => updateField("paymentApp", app.code)}
                      />
                    ))}
                  </div>
                  {selectedApp?.instructions && (
                    <p className="mt-3 rounded-md bg-sandal p-3 text-xs font-semibold text-rudra">
                      {selectedApp.instructions}
                    </p>
                  )}
                </div>
              ) : null}
              {error && <p className="mt-4 text-sm font-bold text-red-600">{error}</p>}
              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" onClick={() => setStep("address")} className="btn-secondary">Back</button>
                <button className="btn-primary">Review Order</button>
              </div>
            </form>
          )}

          {step === "review" && (
            <div>
              <h2 className="text-2xl font-black">Review order details</h2>
              <p className="mt-2 text-sm text-ink/55">Confirm address, shipping, payment, and product details before placing the order.</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <ReviewBox title="Delivery Address">
                  {form.name}<br />
                  {form.phone}<br />
                  {form.line1}{form.line2 ? `, ${form.line2}` : ""}<br />
                  {form.city}, {form.state} - {form.pincode}
                </ReviewBox>
                <ReviewBox title="Payment">
                  {selectedPayment?.label}<br />
                  {selectedApp ? `${selectedApp.label}` : ""}{selectedApp ? <br /> : null}
                  {selectedPayment?.provider !== "manual" ? `Provider: ${selectedPayment?.provider}` : "Pay on delivery"}<br />
                  {selectedPayment?.type === "online" ? "Payment will be captured by gateway." : "Payment pending until delivery."}
                </ReviewBox>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" onClick={() => setStep("payment")} className="btn-secondary">Back</button>
                <button onClick={confirmOrder} disabled={placing || items.length === 0} className="btn-primary disabled:opacity-50">
                  {placing ? "Placing..." : "Place Order"}
                </button>
              </div>
            </div>
          )}
        </div>

        <OrderSummary
          summary={summary}
          couponCode={form.couponCode}
          couponMessage={couponMessage}
          onCouponChange={(value) => updateField("couponCode", value)}
          onApplyCoupon={applyCoupon}
          step={step}
          placing={placing}
          onConfirmOrder={confirmOrder}
        />
      </div>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  className = ""
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="text-xs font-bold text-ink/70">{label}</span>
      <input
        className="mt-2 w-full rounded-md border border-[#dedbd5] bg-white px-3 py-3 text-sm outline-none transition focus:border-rudra focus:ring-2 focus:ring-rudra/10"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </label>
  );
}

function PaymentAppTile({ app, active, onClick }: { app: PaymentApp; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border p-3 text-left transition ${
        active ? "border-rudra bg-white shadow-soft" : "border-rudra/10 bg-white hover:border-rudra/40"
      }`}
    >
      <span
        className="flex h-10 w-14 items-center justify-center rounded-md px-2 text-[10px] font-black uppercase leading-none text-white"
        style={{ backgroundColor: app.brandColor }}
      >
        {app.logoText}
      </span>
      <span className="mt-3 block text-sm font-black">{app.label}</span>
    </button>
  );
}

function ReviewBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg bg-sandal p-4 text-sm leading-7">
      <p className="mb-2 font-black text-ink">{title}</p>
      <div className="text-ink/65">{children}</div>
    </div>
  );
}

function OrderSummary({
  summary,
  couponCode,
  couponMessage,
  onCouponChange,
  onApplyCoupon,
  step,
  placing,
  onConfirmOrder
}: {
  summary: ReturnType<typeof calculatePriceSummary>;
  couponCode: string;
  couponMessage: string;
  onCouponChange: (value: string) => void;
  onApplyCoupon: () => void;
  step: Step;
  placing: boolean;
  onConfirmOrder: () => void;
}) {
  const { items, subtotal } = useCart();
  const actionForm = step === "address" ? "checkout-address-form" : step === "payment" ? "checkout-payment-form" : undefined;
  const actionLabel = step === "address" ? "Continue to Payment" : step === "payment" ? "Review Order" : placing ? "Placing..." : "Place Order";

  return (
    <aside className="h-max rounded-lg border border-[#e6e2dc] bg-white p-5 shadow-sm lg:sticky lg:top-28">
      <h2 className="text-2xl font-black">Your Cart</h2>
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div key={item.cartKey || item.slug} className="flex gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-sandal">
              <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover" />
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-black text-white">
                {item.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-black leading-5">{item.title}</p>
              {item.selectedSizeLabel && <p className="text-xs text-ink/50">Size: {item.selectedSizeLabel}</p>}
              {(item.selectedAddOns || []).map((addOn) => (
                <p key={addOn.code} className="text-xs text-green-700">{addOn.title}: Rs.{addOn.price}</p>
              ))}
            </div>
            <b className="shrink-0 text-sm">
              Rs.{(item.price + (item.selectedAddOns || []).reduce((sum, addOn) => sum + addOn.price, 0)) * item.quantity}
            </b>
          </div>
        ))}
      </div>

      <div className="mt-5 flex overflow-hidden rounded-md border border-[#dedbd5]">
        <span className="flex items-center px-3 text-ink/45"><Tag size={17} /></span>
        <input
          className="min-w-0 flex-1 px-2 py-3 text-sm outline-none"
          value={couponCode}
          onChange={(event) => onCouponChange(event.target.value)}
          placeholder="Discount code"
        />
        <button type="button" onClick={onApplyCoupon} className="px-4 text-sm font-black">
          Apply
        </button>
      </div>
      {couponMessage && <p className="mt-2 text-xs font-bold text-green-700">{couponMessage}</p>}

      <div className="mt-5 space-y-2 border-t border-[#dedbd5] pt-4 text-sm">
        <SummaryRow label="Subtotal" value={subtotal} />
        <SummaryRow label="Shipping" value={summary.shipping} freeWhenZero />
        <SummaryRow label="Estimated taxes" value={summary.tax} />
        <SummaryRow label="Discount" value={-summary.totalDiscount} highlight />
        <SummaryRow label="Payment fee" value={summary.paymentFee} freeWhenZero />
        <div className="flex justify-between border-t border-[#dedbd5] pt-3 text-lg"><span>Total</span><b>Rs.{summary.total}</b></div>
      </div>
      <button
        type={step === "review" ? "button" : "submit"}
        form={actionForm}
        onClick={step === "review" ? onConfirmOrder : undefined}
        disabled={!items.length || placing}
        className="mt-5 w-full rounded-md bg-black px-5 py-4 text-sm font-black text-white transition hover:bg-ink disabled:opacity-50"
      >
        {items.length ? actionLabel : "Cart Empty"}
      </button>
    </aside>
  );
}

function SummaryRow({
  label,
  value,
  highlight = false,
  freeWhenZero = false
}: {
  label: string;
  value: number;
  highlight?: boolean;
  freeWhenZero?: boolean;
}) {
  return (
    <div className={`flex justify-between ${highlight ? "text-green-700" : ""}`}>
      <span>{label}</span>
      <b>{freeWhenZero && value === 0 ? "Free" : `${value < 0 ? "- " : ""}Rs.${Math.abs(value)}`}</b>
    </div>
  );
}

function currentAddress(form: CheckoutForm): Address {
  return {
    line1: form.line1.trim(),
    line2: form.line2.trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    pincode: form.pincode.trim(),
    phone: form.phone.trim()
  };
}

function sameAddressLocation(left: Address, right: Address) {
  return (
    left.line1.trim().toLowerCase() === right.line1.trim().toLowerCase() &&
    (left.line2 || "").trim().toLowerCase() === (right.line2 || "").trim().toLowerCase() &&
    left.city.trim().toLowerCase() === right.city.trim().toLowerCase() &&
    left.state.trim().toLowerCase() === right.state.trim().toLowerCase() &&
    left.pincode.trim() === right.pincode.trim()
  );
}
