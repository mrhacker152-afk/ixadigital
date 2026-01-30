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
import SupportTicketModal from "./components/SupportTicketModal";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import AdminSettings from "./components/AdminSettings";
import AdminTickets from "./components/AdminTickets";

const Home = () => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const handleCTAClick = () => {
    setIsContactModalOpen(true);
  };

  const handleTicketClick = () => {
    setIsTicketModalOpen(true);
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
      <Footer onCTAClick={handleCTAClick} onTicketClick={handleTicketClick} />
      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
      <SupportTicketModal isOpen={isTicketModalOpen} onClose={() => setIsTicketModalOpen(false)} />
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
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/tickets" element={<AdminTickets />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
