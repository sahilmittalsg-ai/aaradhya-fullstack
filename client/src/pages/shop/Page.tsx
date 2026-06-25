import { FileText, LifeBuoy } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPage } from "../../lib/api";
import type { ContentPage } from "../../types";

export function Page() {
  const { slug = "" } = useParams();
  const [page, setPage] = useState<ContentPage>();

  useEffect(() => {
    getPage(slug).then(setPage);
  }, [slug]);

  if (!page) {
    return (
      <section className="container-pad py-16">
        <h1 className="text-3xl font-black">Page not found</h1>
        <Link to="/support" className="btn-primary mt-6">Contact Support</Link>
      </section>
    );
  }

  return (
    <section className="container-pad py-12">
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <article className="rounded-lg border border-rudra/10 bg-white p-6 shadow-sm md:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-saffron">{page.type}</p>
          <h1 className="mt-3 text-4xl font-black">{page.title}</h1>
          <p className="mt-4 text-lg leading-8 text-ink/60">{page.excerpt}</p>
          <div className="mt-8 space-y-5 border-t border-rudra/10 pt-8 text-base leading-8 text-ink/70">
            {page.body.split("\n\n").map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>

        <aside className="h-max space-y-4">
          <div className="rounded-lg border border-rudra/10 bg-white p-5">
            <FileText className="text-saffron" />
            <h2 className="mt-3 font-black">Need a quick link?</h2>
            <div className="mt-4 space-y-3 text-sm font-semibold text-rudra">
              <Link className="block" to="/pages/refund-return-policy">Refund & Return Policy</Link>
              <Link className="block" to="/pages/shipping-policy">Shipping Policy</Link>
              <Link className="block" to="/pages/cancellation-policy">Cancellation Policy</Link>
              <Link className="block" to="/pages/terms-of-service">Terms of Service</Link>
              <Link className="block" to="/pages/privacy-policy">Privacy Policy</Link>
            </div>
          </div>
          <div className="rounded-lg border border-rudra/10 bg-sandal p-5">
            <LifeBuoy className="text-saffron" />
            <h2 className="mt-3 font-black">Still need help?</h2>
            <p className="mt-2 text-sm leading-6 text-ink/60">Create a support ticket for order, return, cancellation, or product questions.</p>
            <Link to="/support" className="btn-primary mt-4 w-full">Customer Support</Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
