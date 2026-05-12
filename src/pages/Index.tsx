import { useEffect, useState } from "react";
import { CurtainOpener } from "@/components/palace/CurtainOpener";
import { Navbar } from "@/components/palace/Navbar";
import { Hero } from "@/components/palace/Hero";
import { Rooms } from "@/components/palace/Rooms";
import { About } from "@/components/palace/About";
import { Reviews } from "@/components/palace/Reviews";
import { Footer } from "@/components/palace/Footer";
import { Gallery } from "@/components/palace/Gallery";
import { Facilities } from "@/components/palace/Facilities";
import { FeedbackSection } from "@/components/palace/FeedbackSection";
import { Offers } from "@/components/palace/Offers";

const Index = () => {
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    document.title = "Raj Mandir Guest House — Heritage Palace Stay in Jodhpur";
    const meta = document.querySelector('meta[name="description"]');
    const content =
      "Raj Mandir Guest House — a 19th-century heritage palace in Jodhpur. Royal chambers, jharokha views, and Rajasthani hospitality at the foot of Mehrangarh Fort.";
    if (meta) meta.setAttribute("content", content);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = content;
      document.head.appendChild(m);
    }
  }, []);

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <CurtainOpener onComplete={() => setOpened(true)} />
      <Navbar />
      <Hero start={opened} />
      <Rooms />
      <Offers />
      <Facilities />
      <Gallery />
      <About />
      <FeedbackSection />
      <Reviews />
      <Footer />
    </main>
  );
};

export default Index;
