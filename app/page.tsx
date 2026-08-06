import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import ComeFunziona from "@/components/ComeFunziona";
import Trasparenza from "@/components/Trasparenza";
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
        <ComeFunziona />
        <Trasparenza />
        <Prezzi />
        <Faq />
        <Iscriviti />
      </main>
      <Footer />
    </>
  );
}
