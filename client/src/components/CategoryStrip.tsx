type CategoryOption = {
  name: string;
  image: string;
};

export function CategoryStrip({
  selectedCategory,
  onSelect,
  categories
}: {
  selectedCategory: string;
  onSelect: (category: string) => void;
  categories: CategoryOption[];
}) {
  const options = [{ name: "All", image: "/assets/categories/rudraksha.png" }, ...categories];

  return (
    <section className="w-full border-y border-[#211d33]/10 bg-[#f6e8ce]">
      <div className="w-full overflow-x-auto">
        <div className="flex min-w-max items-center gap-10 px-5 py-4 sm:gap-16 sm:px-8 lg:min-w-full lg:justify-between lg:gap-6 lg:px-10 xl:px-16">
          {options.map((category) => {
            const active = selectedCategory === category.name;

            return (
              <button
                key={category.name}
                onClick={() => onSelect(category.name)}
                className={`group flex h-[124px] w-[112px] shrink-0 flex-col items-center justify-center rounded-lg px-3 text-center transition ${
                  active ? "bg-white/80 shadow-sm" : "hover:bg-white/35"
                }`}
              >
                <span
                  className={`flex h-[86px] w-[86px] items-center justify-center rounded-full border-2 bg-[#fff8ea] p-1 transition ${
                    active ? "border-[#211d33]" : "border-transparent"
                  }`}
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    loading="lazy"
                    decoding="async"
                    className="h-[72px] w-[72px] rounded-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </span>
                <span className={`mt-2 text-[15px] leading-5 text-[#0f0d18] ${active ? "font-bold" : "font-semibold"}`}>
                  {category.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
