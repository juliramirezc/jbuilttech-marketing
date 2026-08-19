export function ReferralsBlock() {
  return (
    <section
      className="relative bg-[#090909] py-14 md:py-16 lg:py-20 overflow-hidden"
      aria-labelledby="referrals-heading"
    >
      <div className="container-luxury relative z-10 max-w-3xl">
        <h2
          id="referrals-heading"
          className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold text-white tracking-tight leading-[1.1] mb-2"
        >
          REFERRALS ARE GREAT.
        </h2>
        <p className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold text-gold tracking-tight leading-[1.1] mb-6">
          UNTIL THEY SLOW DOWN.
        </p>

        <div className="space-y-3 text-base sm:text-lg text-white/75 font-light leading-relaxed mb-8">
          <p>Referrals built a lot of contracting businesses.</p>
          <p>Keep them.</p>
          <p>But you can&apos;t control when someone recommends you.</p>
          <p>You can&apos;t control when their neighbor needs work.</p>
          <p>
            And you shouldn&apos;t have to wait for somebody else to mention your
            name before the next homeowner discovers your company.
          </p>
        </div>

        <p className="text-xl sm:text-2xl font-semibold text-white tracking-tight mb-3">
          YOUR WORK SHOULD BE REFERRING YOU TOO.
        </p>
        <p className="text-base sm:text-lg text-white/75 font-light leading-relaxed max-w-2xl">
          Every completed project is proof of what your company can do.
          <br />
          JBuiltTech helps put that proof where homeowners can find it.
        </p>
      </div>
    </section>
  );
}
