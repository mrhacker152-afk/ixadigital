import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';

const Header = ({ onCTAClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img
              src="https://customer-assets.emergentagent.com/job_a08c0b50-0e68-4792-b6a6-4a15ac002d5c/artifacts/3mcpq5px_Logo.jpeg"
              alt="IXA Digital"
              className="h-12 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('about')}
              className="text-gray-700 hover:text-red-600 transition-colors font-medium"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="text-gray-700 hover:text-red-600 transition-colors font-medium"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection('process')}
              className="text-gray-700 hover:text-red-600 transition-colors font-medium"
            >
              Process
            </button>
            <button
              onClick={() => scrollToSection('industries')}
              className="text-gray-700 hover:text-red-600 transition-colors font-medium"
            >
              Industries
            </button>
            <Button
              onClick={onCTAClick}
              className="bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              Get Started
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-red-600 transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <button
                onClick={() => scrollToSection('about')}
                className="text-gray-700 hover:text-red-600 transition-colors font-medium text-left"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection('services')}
                className="text-gray-700 hover:text-red-600 transition-colors font-medium text-left"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection('process')}
                className="text-gray-700 hover:text-red-600 transition-colors font-medium text-left"
              >
                Process
              </button>
              <button
                onClick={() => scrollToSection('industries')}
                className="text-gray-700 hover:text-red-600 transition-colors font-medium text-left"
              >
                Industries
              </button>
              <Button
                onClick={() => {
                  onCTAClick();
                  setIsMobileMenuOpen(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white w-full transition-colors"
              >
                Get Started
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
