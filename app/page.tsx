import Navbar from "@/components/public/Navbar";
import HeroVideo from "@/components/public/HeroVideo";
import BrandPhilosophy from "@/components/public/BrandPhilosophy";
import ExpandingCards from "@/components/public/ExpandingCards";
import ConceptCarousel from "@/components/public/ConceptCarousel";
import PricingMatrix from "@/components/public/PricingMatrix";
import GymTimings from "@/components/public/GymTimings";
import AmenitiesShowcase from "@/components/public/AmenitiesShowcase";
import Footer from "@/components/public/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-void text-zinc-100">
      <Navbar />
      <HeroVideo />
      <BrandPhilosophy />
      <ExpandingCards />
      <ConceptCarousel />
      <PricingMatrix />
      <GymTimings />
      <AmenitiesShowcase />
      <Footer />
    </main>
  );
}
