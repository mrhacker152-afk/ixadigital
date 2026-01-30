import React from 'react';
import { Rocket, Building2, Home, ShoppingCart, Briefcase } from 'lucide-react';
import { industries } from '../data/mock';

const iconComponents = {
  Rocket,
  Building2,
  Home,
  ShoppingCart,
  Briefcase
};

const Industries = () => {
  return (
    <section id="industries" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Industries We <span className="text-red-600">Serve</span>
          </h2>
          <div className="w-24 h-1 bg-red-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Tailored digital solutions for diverse industries and business models
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {industries.map((industry) => {
            const Icon = iconComponents[industry.icon];
            return (
              <div
                key={industry.id}
                className="text-center p-6 bg-gray-50 rounded-xl hover:bg-red-600 transition-all duration-300 hover:shadow-xl group cursor-pointer"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md group-hover:bg-red-700 transition-colors">
                  <Icon className="text-red-600 group-hover:text-white transition-colors" size={28} />
                </div>
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-white transition-colors">
                  {industry.name}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Industries;
