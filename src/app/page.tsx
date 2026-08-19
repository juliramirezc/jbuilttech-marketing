import { SalesHero } from "@/components/home/SalesHero";
import { CompetitorBlock } from "@/components/home/CompetitorBlock";
import { SiteFooter } from "@/components/home/SiteFooter";

/**
 * Compact contractor sales homepage.
 * Section 1 (hero) → Section 2 (competitor) → Footer.
 * No scroll runway. No Blueprint → Build → Finish → Launch storytelling.
 */
export default function HomePage() {
  return (
    <main>
      <SalesHero />
      <CompetitorBlock />
      <SiteFooter />
    </main>
  );
}
