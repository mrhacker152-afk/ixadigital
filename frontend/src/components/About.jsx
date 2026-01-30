import React from 'react';
import { Target, TrendingUp, Users } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            About <span className="text-red-600">IXA Digital</span>
          </h2>
          <div className="w-24 h-1 bg-red-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Your long-term digital growth partner focused on execution, transparency, and ROI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              Driving Measurable Growth Through Digital Excellence
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              At IXA Digital, we don't just deliver projects—we deliver results. Our team combines 
              technical expertise with strategic thinking to help businesses scale their digital presence 
              and achieve sustainable growth.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              From startups to enterprises, we partner with businesses to create impactful digital 
              solutions that drive real ROI. Our approach is simple: understand your goals, develop 
              data-driven strategies, and execute with precision.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Whether you need to dominate search rankings, scale your marketing campaigns, build 
              high-converting websites, or develop cutting-edge applications—we're your growth partner 
              for the long haul.
            </p>
          </div>

          {/* Right Content - Value Props */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                  <Target className="text-white" size={24} />
                </div>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Results-Focused Execution</h4>
                <p className="text-gray-600">
                  Every strategy and decision is tied to measurable business outcomes and KPIs that matter.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-white" size={24} />
                </div>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Scalable Solutions</h4>
                <p className="text-gray-600">
                  Built with growth in mind—our solutions scale with your business from day one.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                  <Users className="text-white" size={24} />
                </div>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">True Partnership</h4>
                <p className="text-gray-600">
                  Transparent communication, regular updates, and a genuine commitment to your success.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
