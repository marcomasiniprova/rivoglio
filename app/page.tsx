import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import Costruttore from "@/components/Costruttore";
import DentroApp from "@/components/DentroApp";
import Funzioni from "@/components/Funzioni";
import Passi from "@/components/Passi";
import ContoAperto from "@/components/ContoAperto";
import PerChi from "@/components/PerChi";
import Numeri from "@/components/Numeri";
import Canali from "@/components/Canali";
import Testimonial from "@/components/Testimonial";
import Prezzi from "@/components/Prezzi";
import Faq from "@/components/Faq";
import Iscriviti from "@/components/Iscriviti";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Manifesto />
        <Funzioni />
        <Passi />
        <ContoAperto />
        <Costruttore />
        <DentroApp />
        <PerChi />
        <Numeri />
        <Canali />
        <Testimonial />
        <Prezzi />
        <Faq />
        <Iscriviti />
      </main>
      <Footer />
    </>
  );
}
