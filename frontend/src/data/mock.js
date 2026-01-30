// Mock data for IXA Digital website

export const contactInfo = {
  email: 'ixadigitalcom@gmail.com',
  phone: '+919436481775',
  whatsapp: '+919436481775'
};

export const services = [
  {
    id: 1,
    title: 'SEO',
    description: 'Technical SEO, on-page optimization, content SEO, local SEO, and authority building to boost your search rankings.',
    features: [
      'Technical SEO Audit',
      'On-Page Optimization',
      'Content Strategy',
      'Local SEO',
      'Link Building'
    ],
    image: 'https://images.unsplash.com/photo-1547658719-da2b51169166'
  },
  {
    id: 2,
    title: 'Digital Marketing',
    description: 'Paid ads, social media marketing, performance campaigns, and funnel optimization for maximum ROI.',
    features: [
      'Paid Advertising',
      'Social Media Marketing',
      'Performance Marketing',
      'Funnel Optimization',
      'Analytics & Reporting'
    ],
    image: 'https://images.unsplash.com/photo-1547658719-da2b51169166'
  },
  {
    id: 3,
    title: 'Web Development',
    description: 'Corporate websites, landing pages, CMS development, and conversion-focused UI/UX design.',
    features: [
      'Corporate Websites',
      'Landing Pages',
      'CMS Development',
      'E-commerce Solutions',
      'Conversion Optimization'
    ],
    image: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613'
  },
  {
    id: 4,
    title: 'App Development',
    description: 'Android apps, iOS apps, cross-platform apps, and scalable business solutions.',
    features: [
      'Android Development',
      'iOS Development',
      'Cross-Platform Apps',
      'Business Solutions',
      'App Maintenance'
    ],
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c'
  }
];

export const whyChooseUs = [
  {
    id: 1,
    title: 'Results-First Mindset',
    description: 'We focus on measurable outcomes that directly impact your bottom line.'
  },
  {
    id: 2,
    title: 'Data-Driven Strategies',
    description: 'Every decision backed by analytics and performance metrics.'
  },
  {
    id: 3,
    title: 'Clean & Scalable Code',
    description: 'Built with best practices for long-term growth and maintenance.'
  },
  {
    id: 4,
    title: 'Transparent Communication',
    description: 'Regular updates and clear reporting throughout the project.'
  }
];

export const industries = [
  { id: 1, name: 'Startups', icon: 'Rocket' },
  { id: 2, name: 'Businesses & Enterprises', icon: 'Building2' },
  { id: 3, name: 'Real Estate', icon: 'Home' },
  { id: 4, name: 'E-commerce', icon: 'ShoppingCart' },
  { id: 5, name: 'Service-based Companies', icon: 'Briefcase' }
];

export const processSteps = [
  { id: 1, name: 'Research', description: 'Deep dive into your business and market' },
  { id: 2, name: 'Strategy', description: 'Data-driven roadmap creation' },
  { id: 3, name: 'Build', description: 'Execute with precision' },
  { id: 4, name: 'Launch', description: 'Deploy and monitor' },
  { id: 5, name: 'Scale', description: 'Optimize and grow' }
];

export const heroImages = [
  'https://images.unsplash.com/photo-1573164713988-8665fc963095',
  'https://images.unsplash.com/39/lIZrwvbeRuuzqOoWJUEn_Photoaday_CSD%20%281%20of%201%29-5.jpg',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c'
];

// Form submission mock handler
export const submitContactForm = async (formData) => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Form submitted:', formData);
      resolve({ success: true, message: 'Form submitted successfully!' });
    }, 1000);
  });
};
