import EventOrganizer from "@/components/home/EventOrganizer";
import FAQ from "@/components/home/FAQ";
import Footer from "@/components/home/Footer";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import Navbar from "@/components/home/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <HowItWorks />
      <EventOrganizer />
      <FAQ />
      <Footer />
    </>
  );
}