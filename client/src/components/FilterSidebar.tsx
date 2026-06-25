const filters = [
  { label: "Category", options: ["Rudraksha", "Energy Stones", "Malas", "Bracelets"] },
  { label: "Price", options: ["Under Rs.500", "Rs.500 - Rs.999", "Rs.1000+"] },
  { label: "Bead Type", options: ["Rudraksha", "Karungali", "Sphatik", "Tiger Eye"] },
  { label: "Stone", options: ["Pyrite", "Rose Quartz", "Amethyst", "Sandalwood"] },
  { label: "Zodiac", options: ["Aries", "Leo", "Scorpio", "Pisces"] },
  { label: "Availability", options: ["In stock", "Sale", "Bestseller"] }
];

export function FilterSidebar() {
  return (
    <aside className="rounded-lg border border-[#211d33]/10 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-xl font-bold text-[#17172a]">Filters</h3>
        <button className="text-xs font-semibold text-[#211d33]/60">Clear</button>
      </div>

      <div className="mt-4 divide-y divide-[#211d33]/10">
        {filters.map((filter) => (
          <section key={filter.label} className="py-4">
            <p className="text-sm font-semibold text-[#17172a]">{filter.label}</p>
            <div className="mt-3 grid gap-2">
              {filter.options.map((option) => (
                <label key={option} className="flex cursor-pointer items-center gap-2 text-sm text-[#17172a]/70">
                  <input type="checkbox" className="h-4 w-4 rounded border-[#211d33]/20 text-[#211d33] focus:ring-[#211d33]" />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}
