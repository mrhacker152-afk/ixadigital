import React from 'react';
import { CheckCircle2, Database, Code2, Shield } from 'lucide-react';
import { whyChooseUs } from '../data/mock';

const iconMap = {
  'Results-First Mindset': CheckCircle2,
  'Data-Driven Strategies': Database,
  'Clean & Scalable Code': Code2,
  'Transparent Communication': Shield
};

const WhyChooseUs = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Why Choose <span className="text-red-600">IXA Digital</span>
          </h2>
          <div className="w-24 h-1 bg-red-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our commitment to excellence and results sets us apart from the rest
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {whyChooseUs.map((item) => {
            const Icon = iconMap[item.title];
            return (
              <div
                key={item.id}
                className="text-center p-6 bg-gray-50 rounded-xl hover:bg-red-50 transition-all duration-300 hover:shadow-lg group"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md group-hover:bg-red-600 transition-colors">
                  <Icon className="text-red-600 group-hover:text-white transition-colors" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
