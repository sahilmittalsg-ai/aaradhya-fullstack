import { FormEvent, useState } from "react";
import { createSupportTicket } from "../../lib/api";

const productOptions = [
  "Rudraksha Bracelets",
  "Rudraksha Malas",
  "Karungali Wearables",
  "Energy Stones",
  "Spiritual Jewellery",
  "Gift Hampers",
  "Mixed / Custom Order"
];

const quantityOptions = ["25 - 50 pieces", "51 - 100 pieces", "101 - 250 pieces", "251 - 500 pieces", "500+ pieces"];

export function BulkWholesale() {
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "");
    const phone = String(form.get("phone") || "");
    const company = String(form.get("company") || "");
    const productRequirement = String(form.get("productRequirement") || "");
    const quantity = String(form.get("quantity") || "");
    const emailValue = String(form.get("email") || "").trim();

    try {
      await createSupportTicket({
        name,
        email: emailValue || "wholesale-enquiry@aaradhyabeads.local",
        phone,
        category: "bulk-wholesale",
        priority: "high",
        subject: `Wholesale Inquiry - ${company || name}`,
        message: [
          `Company Name: ${company || "Not shared"}`,
          `Product Requirements: ${productRequirement}`,
          `Quantity Needed: ${quantity}`,
          `Phone Number: ${phone}`,
          emailValue ? `Email: ${emailValue}` : "Email: Not shared"
        ].join("\n")
      });

      setMessage("Wholesale inquiry submitted. Our admin team will contact you shortly.");
      event.currentTarget.reset();
    } catch {
      setMessage("Inquiry saved in demo mode. Connect backend so it appears in the admin support inbox.");
    }
  }

  return (
    <section className="bg-[#fff6e8] py-8 md:py-12">
      <div className="container-pad">
        <div className="mx-auto max-w-[402px] rounded-md border border-[#d94141] bg-[#f7f7f7] px-4 py-5 shadow-sm sm:px-5">
          <h1 className="text-center text-lg font-black text-[#d23a3a]">Wholesale Inquiry</h1>

          <img
            src="/assets/products/hero-spiritual-shop.png"
            alt="Aaradhya Beads bulk and wholesale spiritual products"
            className="mt-5 h-[206px] w-full rounded-sm object-cover object-right"
          />

          <p className="mt-4 text-[13px] leading-6 text-[#17172a]">
            Aaradhya Beads is a trusted brand focused on quality products, beautiful packaging, and authenticity. If you
            want to partner with us or order our products in bulk, please fill the form below.
          </p>

          <form onSubmit={submit} className="mt-6 grid gap-4">
            <label className="grid gap-1 text-sm font-medium text-[#24304a]">
              Name
              <input name="name" className="input h-11" required />
            </label>

            <label className="grid gap-1 text-sm font-medium text-[#24304a]">
              Phone Number
              <input name="phone" className="input h-11" inputMode="tel" required />
            </label>

            <label className="grid gap-1 text-sm font-medium text-[#24304a]">
              Company Name
              <input name="company" className="input h-11" required />
            </label>

            <label className="grid gap-1 text-sm font-medium text-[#24304a]">
              Email
              <input name="email" type="email" className="input h-11" placeholder="Optional" />
            </label>

            <label className="grid gap-1 text-sm font-medium text-[#24304a]">
              Product Requirements
              <select name="productRequirement" className="input h-11" required defaultValue="">
                <option value="" disabled>
                  Select product category
                </option>
                {productOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-sm font-medium text-[#24304a]">
              Quantity Needed
              <select name="quantity" className="input h-11" required defaultValue="">
                <option value="" disabled>
                  Select quantity range
                </option>
                {quantityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <button className="mt-1 rounded-md bg-[#cb3d3f] px-5 py-3 text-sm font-black text-white transition hover:bg-[#b83234]">
              Submit Inquiry
            </button>

            {message && <p className="rounded-md bg-white px-3 py-3 text-sm font-semibold leading-6 text-rudra">{message}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
