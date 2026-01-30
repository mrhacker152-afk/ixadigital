import React from 'react';
import { Search, Lightbulb, Wrench, Rocket, TrendingUp } from 'lucide-react';
import { processSteps } from '../data/mock';

const processIcons = [Search, Lightbulb, Wrench, Rocket, TrendingUp];

const Process = () => {
  return (
    <section id="process" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Our <span className="text-red-600">Process</span>
          </h2>
          <div className="w-24 h-1 bg-red-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            A proven methodology that delivers results every time
          </p>
        </div>

        <div className="relative">
          {/* Desktop View */}
          <div className="hidden md:flex justify-between items-start">
            {processSteps.map((step, index) => {
              const Icon = processIcons[index];
              return (
                <div key={step.id} className="flex-1 text-center relative">
                  {/* Connecting Line */}
                  {index < processSteps.length - 1 && (
                    <div className="absolute top-12 left-1/2 w-full h-0.5 bg-red-200 z-0"></div>
                  )}

                  <div className="relative z-10">
                    <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg hover:scale-110 transition-transform duration-300">
                      <Icon className="text-white" size={36} />
                    </div>
                    <div className="w-8 h-8 bg-white border-4 border-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-red-600 font-bold text-sm">{step.id}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{step.name}</h3>
                    <p className="text-gray-600 text-sm px-2">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-6">
            {processSteps.map((step, index) => {
              const Icon = processIcons[index];
              return (
                <div key={step.id} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                      <Icon className="text-white" size={28} />
                    </div>
                    <div className="w-8 h-8 bg-white border-4 border-red-600 rounded-full flex items-center justify-center mx-auto mt-2">
                      <span className="text-red-600 font-bold text-sm">{step.id}</span>
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{step.name}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
