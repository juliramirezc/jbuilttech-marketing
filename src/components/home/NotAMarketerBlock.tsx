export function NotAMarketerBlock() {
  return (
    <section
      className="relative bg-[#090909] py-14 md:py-16 lg:py-20 overflow-hidden"
      aria-labelledby="not-marketer-heading"
    >
      <div className="container-luxury relative z-10 max-w-3xl">
        <h2
          id="not-marketer-heading"
          className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold text-white tracking-tight leading-[1.1] mb-2"
        >
          YOU&apos;RE A CONTRACTOR.
        </h2>
        <p className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold text-gold tracking-tight leading-[1.1] mb-6">
          NOT A MARKETING COMPANY.
        </p>

        <div className="space-y-3 text-base sm:text-lg text-white/75 font-light leading-relaxed mb-8">
          <p>Good.</p>
          <p>You shouldn&apos;t have to become one.</p>
          <p>
            You shouldn&apos;t have to spend your nights figuring out algorithms,
            SEO, content, or marketing software.
          </p>
          <p>You have jobs to finish.</p>
          <p>Customers to take care of.</p>
          <p>A crew to keep moving.</p>
          <p>A business to run.</p>
        </div>

        <p className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
          YOU DO THE WORK.
        </p>
        <p className="text-xl sm:text-2xl font-semibold text-gold tracking-tight mt-1">
          JBUILTTECH HELPS MAKE IT VISIBLE.
        </p>
      </div>
    </section>
  );
}
