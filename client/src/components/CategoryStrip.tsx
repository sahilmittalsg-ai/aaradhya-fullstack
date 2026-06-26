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
    <section className="w-full border-b border-[#211d33]/10 bg-[#f6e8ce] shadow-sm">
      <div className="w-full overflow-x-auto">
        <div className="mx-auto flex w-max min-w-full items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
          {options.map((category) => {
            const active = selectedCategory === category.name;

            return (
              <button
                key={category.name}
                onClick={() => onSelect(category.name)}
                className={`group flex min-w-[74px] flex-col items-center rounded-lg px-2 py-1.5 text-center transition ${
                  active ? "bg-white/60" : "hover:bg-white/35"
                }`}
              >
                <span
                  className={`flex h-[58px] w-[58px] items-center justify-center rounded-full border-2 bg-white/40 p-1 transition md:h-[68px] md:w-[68px] ${
                    active ? "border-[#211d33]" : "border-transparent"
                  }`}
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    loading="lazy"
                    decoding="async"
                    className="h-[50px] w-[50px] object-contain p-1 transition duration-300 group-hover:scale-105 md:h-[60px] md:w-[60px]"
                  />
                </span>
                <span className={`mt-1 text-xs leading-4 text-[#17172a] ${active ? "font-bold" : "font-medium"}`}>
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
