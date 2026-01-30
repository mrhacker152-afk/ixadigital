import React, { useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import Services from "./components/Services";
import WhyChooseUs from "./components/WhyChooseUs";
import Process from "./components/Process";
import Industries from "./components/Industries";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import ContactModal from "./components/ContactModal";
import WhatsAppButton from "./components/WhatsAppButton";

const Home = () => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const handleCTAClick = () => {
    setIsContactModalOpen(true);
  };

  const handleViewServices = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onCTAClick={handleCTAClick} />
      <Hero onCTAClick={handleCTAClick} onViewServices={handleViewServices} />
      <About />
      <Services onCTAClick={handleCTAClick} />
      <WhyChooseUs />
      <Process />
      <Industries />
      <CTA onCTAClick={handleCTAClick} />
      <Footer onCTAClick={handleCTAClick} />
      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
      <WhatsAppButton />
      <Toaster />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
