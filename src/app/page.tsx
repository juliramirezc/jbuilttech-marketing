import { Hero } from "@/components/hero";
import { ProcessSection } from "@/components/sections/process";
import { VisibilitySection } from "@/components/sections/visibility";
import { ConsultationSection } from "@/components/sections/consultation";

export default function HomePage() {
  return (
    <main>
      <Hero />
      
      {/* Process Section - "We Build Your Brand" */}
      <ProcessSection />

      {/* Visibility Section - "Your Work Deserves More Attention" */}
      <VisibilitySection />

      {/* Final CTA */}
      <ConsultationSection />
    </main>
  );
}
