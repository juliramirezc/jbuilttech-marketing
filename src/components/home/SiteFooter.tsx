/**
 * Compact homepage footer — branding + Email / Call conversion buttons.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/[0.08] bg-[#090909] py-10 md:py-12">
      <div className="container-luxury">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xl font-semibold tracking-tight text-white">
              JBuiltTech
            </p>
            <p className="mt-1 text-sm text-white/50 font-light">
              Put your work where homeowners are looking.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <a
              href="mailto:info@jbuilttech.com"
              className="btn-conversion btn-conversion--pulse w-full sm:w-auto text-center"
            >
              EMAIL US
            </a>
            <a
              href="tel:3162466492"
              className="btn-conversion btn-conversion--pulse w-full sm:w-auto text-center"
              aria-label="Call us at (316) 246-6492"
            >
              CALL US
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-white/[0.06] pt-6 text-xs text-white/40">
          <p>© {year} JBuiltTech. All rights reserved.</p>
          <p className="font-medium text-white/55">(316) 246-6492</p>
        </div>
      </div>
    </footer>
  );
}
