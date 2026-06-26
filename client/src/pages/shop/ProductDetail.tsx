import {
  BadgePercent,
  CalendarDays,
  CheckCircle2,
  Gift,
  Heart,
  IndianRupee,
  MapPin,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  TicketPercent,
  Truck,
  Zap
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ProductCard } from "../../components/ProductCard";
import { useCartActions } from "../../context/CartContext";
import { useLiveProducts } from "../../hooks/useLiveProducts";
import { getProduct, getProductReviews, getPublicCoupons } from "../../lib/api";
import type { CartItem, Coupon, Product, ProductReview } from "../../types";

export function ProductDetail() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartActions();
  const [product, setProduct] = useState<Product>();
  const allProducts = useLiveProducts();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [includePlan, setIncludePlan] = useState(false);
  const [pincode, setPincode] = useState("");
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [copiedCoupon, setCopiedCoupon] = useState("");

  useEffect(() => {
    getProduct(slug).then((item) => {
      setProduct(item);
      setSelectedSize(item?.sizeOptions?.[0]?.value || "");
      setQuantity(1);
      setIncludePlan(false);
    });
    getProductReviews(slug).then(setReviews);
    getPublicCoupons().then(setCoupons);
  }, [slug]);

  useEffect(() => {
    const liveProduct = allProducts.find((item) => item.slug === slug);
    if (liveProduct) setProduct(liveProduct);
  }, [allProducts, slug]);

  const selectedSizeOption = useMemo(
    () => product?.sizeOptions?.find((size) => size.value === selectedSize),
    [product, selectedSize]
  );
  const siddhPlan = product?.addOnServices?.find((service) => service.code === "siddh-energized" && service.active) || {
    code: "siddh-energized",
    title: "Get Siddh/Energized Product (Pran Pratishta)",
    description: "A special energizing ritual service before dispatch.",
    price: 100,
    active: true
  };
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter((item) => item.slug !== product.slug && (item.category === product.category || item.collection === product.collection))
      .slice(0, 8);
  }, [allProducts, product]);

  if (!product) {
    return <div className="container-pad py-20">Product not found.</div>;
  }

  const discountAmount = Math.max(product.compareAtPrice - product.price, 0);
  const discountPercent = product.compareAtPrice
    ? Math.round((discountAmount / product.compareAtPrice) * 100)
    : 0;
  const planPrice = includePlan && siddhPlan ? siddhPlan.price : 0;
  const linePrice = (product.price + planPrice) * quantity;
  const maxQuantity = Math.max(selectedSizeOption?.stock || product.stock || 1, 1);

  function estimateDelivery() {
    const cleaned = pincode.replace(/\D/g, "");
    if (cleaned.length !== 6) {
      setDeliveryMessage("Enter a valid 6 digit pincode.");
      return;
    }

    const delivery = product?.delivery || { minDays: 3, maxDays: 7, expressMinDays: 2, expressMaxDays: 4 };
    setDeliveryMessage(`Delivery to ${cleaned}: ${formatDate(addDays(delivery.minDays))} - ${formatDate(addDays(delivery.maxDays))}`);
  }

  function configuredItem(): CartItem {
    if (!product) throw new Error("Product is not loaded");

    return {
      ...product,
      selectedSize,
      selectedSizeLabel: selectedSizeOption?.label,
      selectedAddOns:
        includePlan && siddhPlan
          ? [{ code: siddhPlan.code, title: siddhPlan.title, price: siddhPlan.price }]
          : [],
      quantity
    };
  }

  function addConfiguredItem() {
    addItem(configuredItem(), quantity);
  }

  function orderNow() {
    addItem(configuredItem(), quantity, false);
    navigate("/checkout");
  }

  async function copyCoupon(code: string) {
    await navigator.clipboard?.writeText(code).catch(() => undefined);
    setCopiedCoupon(code);
  }

  return (
    <div className="bg-[#fff7ec] text-[#17172a]">
      <section className="border-y border-[#211d33]/10 bg-[#fff4e3]">
        <div className="container-pad grid gap-8 py-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="lg:sticky lg:top-6 lg:self-start">
            <div className="relative overflow-hidden rounded-none bg-[#f6e8ce] lg:min-h-[660px]">
              <span className="absolute left-5 top-5 z-10 bg-[#c93f42] px-3 py-2 text-sm font-bold text-white">
                <BadgePercent className="mr-1 inline" size={15} /> {discountPercent}% off
              </span>
              <img
                src={product.images[0]}
                alt={product.title}
                decoding="async"
                className="h-full min-h-[420px] w-full object-cover lg:min-h-[660px]"
              />
              <button className="absolute left-5 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-lg bg-white/80 text-2xl text-[#211d33]">
                ‹
              </button>
              <button className="absolute right-5 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-lg bg-white/90 text-2xl text-[#211d33]">
                ›
              </button>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {[product.images[0], ...product.images].slice(0, 4).map((image, index) => (
                <img
                  key={`${image}-${index}`}
                  src={image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="aspect-square rounded-md border border-[#211d33]/10 bg-[#f6e8ce] object-cover"
                />
              ))}
            </div>
          </div>

          <aside className="lg:pl-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="bg-[#c93f42] px-3 py-2 text-sm font-bold text-white">
                <BadgePercent className="mr-1 inline" size={15} /> {discountPercent}% off
              </span>
              <span className="bg-[#f7d746] px-3 py-2 text-sm font-medium text-[#17172a]">New arrival</span>
            </div>

            <h1 className="font-heading text-3xl font-bold leading-tight md:text-4xl">{product.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="flex text-[#d13f42]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={17} fill="currentColor" />
                ))}
              </span>
              <span className="text-sm font-medium text-[#17172a]/60">({Math.max(reviews.length, 10)} reviews)</span>
              <span className="rounded-full bg-[#f6e8ce] px-3 py-1 text-xs font-bold text-[#211d33]">{product.stock} in stock</span>
            </div>

            <div className="mt-5 flex items-end gap-3">
              <span className="font-heading text-4xl font-bold text-[#211d33]">Rs.{product.price}</span>
              <span className="pb-1 text-lg font-medium text-[#17172a]/45 line-through">Rs.{product.compareAtPrice}</span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <TrustPill icon={IndianRupee} title="100% CASHBACK" text="up to Rs500" />
              <TrustPill icon={ShieldCheck} title="6 MONTHS" text="Free Replacement" />
            </div>

            <div className="mt-6 border-y border-[#211d33]/10 py-5">
              <button onClick={() => setIncludePlan((value) => !value)} className="flex w-full items-center justify-between gap-4 text-left">
                <span className="flex items-center gap-3">
                  <span className={`flex h-6 w-6 items-center justify-center rounded border ${includePlan ? "border-[#211d33] bg-[#211d33]" : "border-[#211d33]/30 bg-white"}`}>
                    {includePlan && <CheckCircle2 size={15} className="text-white" />}
                  </span>
                  <Sparkles className="text-[#b86b2b]" size={28} />
                  <span className="text-base font-bold md:text-lg">{siddhPlan.title}</span>
                </span>
                <span className="whitespace-nowrap text-lg font-medium">+ Rs.{siddhPlan.price}</span>
              </button>
            </div>

            {(product.sizeOptions || []).length > 0 && (
              <div className="mt-5">
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-[#211d33]/60">Size / Variant</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {(product.sizeOptions || []).map((size) => (
                    <button
                      key={size.value}
                      onClick={() => {
                        setSelectedSize(size.value);
                        setQuantity(1);
                      }}
                      className={`rounded-lg border px-3 py-3 text-left text-sm transition ${
                        selectedSize === size.value ? "border-[#211d33] bg-[#f6e8ce]" : "border-[#211d33]/10 bg-white"
                      }`}
                    >
                      <b>{size.label}</b>
                      <span className="block text-xs text-[#17172a]/55">{size.stock} left</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-[196px_1fr]">
              <div className="flex h-[62px] items-center justify-between rounded-lg border border-[#211d33]/15 bg-white">
                <button className="px-4 py-4" onClick={() => setQuantity((value) => Math.max(value - 1, 1))}>
                  <Minus size={18} />
                </button>
                <span className="font-bold">{quantity}</span>
                <button className="px-4 py-4" onClick={() => setQuantity((value) => Math.min(value + 1, maxQuantity))}>
                  <Plus size={18} />
                </button>
              </div>
              <button onClick={addConfiguredItem} className="rounded-lg bg-[#211d33] px-6 py-4 text-base font-bold text-white transition hover:bg-[#b86b2b]">
                ADD TO CART
              </button>
            </div>
            <button onClick={orderNow} className="mt-4 w-full rounded-lg bg-[#c93f42] px-6 py-4 text-xl font-bold text-white transition hover:bg-[#b63337]">
              Order Now - Cash On Delivery
            </button>

            <div className="mt-5 rounded-2xl border border-[#d8c7a6] bg-[#f6e8ce] p-4">
              <div className="flex gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#c93f42]">
                  <CalendarDays size={25} />
                </span>
                <div>
                  <h2 className="text-lg font-bold">Estimated Delivery Date</h2>
                  <p className="text-sm text-[#17172a]/65">Prepaid orders are delivered on priority.</p>
                </div>
              </div>
              <div className="mt-4 flex overflow-hidden rounded-xl border border-[#d8c7a6] bg-white">
                <span className="flex items-center px-4 text-[#17172a]/55"><MapPin size={20} /></span>
                <input
                  value={pincode}
                  onChange={(event) => setPincode(event.target.value)}
                  className="min-w-0 flex-1 px-2 py-3 text-base outline-none"
                  placeholder="Enter Pincode"
                  inputMode="numeric"
                  maxLength={6}
                />
                <button onClick={estimateDelivery} className="m-1 rounded-lg bg-[#c93f42] px-6 font-bold text-white">Check</button>
              </div>
              {deliveryMessage && <p className="mt-3 text-sm font-bold text-[#211d33]">{deliveryMessage}</p>}
              <div className="mt-4 grid grid-cols-2 divide-x divide-[#d8c7a6] border-t border-[#d8c7a6] pt-4">
                <MiniBenefit icon={Gift} title="100% Cashback" text="pay via UPI" />
                <MiniBenefit icon={Truck} title="FREE Shipping" text="above Rs299" />
              </div>
            </div>

            <div className="mt-7">
              <h2 className="flex items-center gap-2 text-xl font-bold uppercase">
                <TicketPercent className="rounded-full bg-[#c93f42] p-1 text-white" size={28} /> Exclusive Offers
              </h2>
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {coupons.map((coupon) => (
                  <CouponCard key={coupon._id || coupon.code} coupon={coupon} copied={copiedCoupon === coupon.code} onCopy={() => copyCoupon(coupon.code)} />
                ))}
                <StaticOffer title="Buy 2 Get 1 Free" text="Add 3 items to cart. Min value item is free" code="AUTO APPLIED" />
              </div>
            </div>

            <div className="mt-7 rounded-xl bg-white p-5">
              <h2 className="text-xl font-bold">Why bring this home?</h2>
              <p className="mt-3 leading-7 text-[#17172a]/65">{product.description}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Detail title="Purpose" value={(product.purpose || []).join(", ")} />
                <Detail title="Bead Type" value={product.bead || ""} />
                <Detail title="Mukhi" value={product.mukhi || ""} />
                <Detail title="Plating" value={product.plating || ""} />
              </div>
            </div>
          </aside>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="container-pad py-12">
          <h2 className="font-heading text-3xl font-bold">You may also like</h2>
          <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        </section>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#211d33]/10 bg-white/95 p-3 shadow-2xl backdrop-blur lg:left-auto lg:right-6 lg:w-[500px] lg:rounded-t-2xl lg:border">
        <div className="flex items-center gap-3">
          <img src={product.images[0]} alt="" decoding="async" className="h-16 w-16 rounded-xl object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{product.title}</p>
            <p className="font-heading text-xl font-bold">Rs.{linePrice} <span className="text-sm font-medium text-[#17172a]/45 line-through">Rs.{product.compareAtPrice}</span></p>
          </div>
          <div className="flex items-center rounded-lg border border-[#211d33]/10">
            <button className="px-2 py-2" onClick={() => setQuantity((value) => Math.max(value - 1, 1))}><Minus size={15} /></button>
            <span className="px-2 text-sm font-bold">{quantity}</span>
            <button className="px-2 py-2" onClick={() => setQuantity((value) => Math.min(value + 1, maxQuantity))}><Plus size={15} /></button>
          </div>
          <button onClick={orderNow} className="rounded-lg bg-[#211d33] px-4 py-3 text-sm font-bold text-white">ORDER NOW</button>
        </div>
      </div>

      <Link to="/collections" className="container-pad block pb-28 font-bold text-[#b86b2b] lg:pb-10">
        Back to collections
      </Link>
    </div>
  );
}

function TrustPill({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-[#231400] px-4 py-3 text-[#f4c13b]">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4c13b] text-[#231400]">
        <Icon size={19} />
      </span>
      <div>
        <p className="text-sm font-bold leading-tight">{title}</p>
        <p className="text-sm font-bold leading-tight text-white">{text}</p>
      </div>
    </div>
  );
}

function MiniBenefit({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="flex items-center gap-3 px-2">
      <Icon size={28} className="text-[#7b5a25]" />
      <div>
        <p className="font-bold">{title}</p>
        <p className="text-sm text-[#17172a]/60">{text}</p>
      </div>
    </div>
  );
}

function CouponCard({ coupon, copied, onCopy }: { coupon: Coupon; copied: boolean; onCopy: () => void }) {
  const discount = coupon.type === "percent" ? `${coupon.value}% off` : `Rs.${coupon.value} off`;

  return (
    <div className="min-w-[210px] rounded-xl border border-dashed border-[#211d33]/20 bg-white p-4 shadow-sm">
      <p className="flex items-center gap-2 font-bold"><Sparkles size={17} /> {discount}</p>
      <p className="mt-3 min-h-[44px] text-sm leading-5 text-[#17172a]/65">On minimum cart value of Rs.{coupon.minSubtotal}</p>
      <div className="mt-3 flex items-center justify-between border-t border-[#211d33]/10 pt-3">
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#c93f42]">{coupon.code}</span>
        <button onClick={onCopy} className="text-sm font-semibold text-[#211d33]">{copied ? "Copied" : "Copy"}</button>
      </div>
    </div>
  );
}

function StaticOffer({ title, text, code }: { title: string; text: string; code: string }) {
  return (
    <div className="min-w-[210px] rounded-xl border border-dashed border-[#211d33]/20 bg-white p-4 shadow-sm">
      <p className="flex items-center gap-2 font-bold"><ShoppingBag size={17} /> {title}</p>
      <p className="mt-3 min-h-[44px] text-sm leading-5 text-[#17172a]/65">{text}</p>
      <p className="mt-3 border-t border-[#211d33]/10 pt-3 text-xs font-bold uppercase tracking-[0.12em] text-[#c93f42]">{code}</p>
    </div>
  );
}

function Detail({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#fff7ec] p-3">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#211d33]/45">{title}</p>
      <p className="mt-1 font-semibold">{value || "Will be updated soon."}</p>
    </div>
  );
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
