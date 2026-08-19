const ITEMS = [
  {
    title: "SHOW THE WORK",
    body: "Put real completed projects in front of homeowners.",
  },
  {
    title: "BUILD TRUST",
    body: "Give homeowners proof of what your company actually does.",
  },
  {
    title: "GET THE NEXT OPPORTUNITY",
    body: "Make it easier for homeowners looking for a contractor to discover your business.",
  },
] as const;

export function HowWeHelpBlock() {
  return (
    <section
      className="relative bg-[#0a0a0a] py-14 md:py-16 lg:py-20 overflow-hidden"
      aria-labelledby="how-heading"
    >
      <div className="container-luxury relative z-10">
        <h2
          id="how-heading"
          className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold text-white tracking-tight leading-[1.1] mb-2 max-w-3xl"
        >
          YOU DO THE WORK.
        </h2>
        <p className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold text-gold tracking-tight leading-[1.1] mb-10 max-w-3xl">
          WE HELP PEOPLE FIND IT.
        </p>

        <div className="grid gap-5 md:grid-cols-3 md:gap-6">
          {ITEMS.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-white/[0.08] bg-[#101010]/80 p-5 sm:p-6"
            >
              <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight mb-2">
                {item.title}
              </h3>
              <p className="text-sm sm:text-base text-white/65 font-light leading-relaxed">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
