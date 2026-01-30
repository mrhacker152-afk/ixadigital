import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Cache for branding data
let brandingCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useBranding = () => {
  const [branding, setBranding] = useState({
    logo_url: 'https://customer-assets.emergentagent.com/job_a08c0b50-0e68-4792-b6a6-4a15ac002d5c/artifacts/3mcpq5px_Logo.jpeg',
    favicon_url: '',
    company_name: 'IXA Digital'
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchBranding = useCallback(async () => {
    // Check cache first
    const now = Date.now();
    if (brandingCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
      setBranding(brandingCache);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${BACKEND_URL}/api/branding`);
      if (response.data.success && response.data.branding) {
        const brandingData = response.data.branding;
        
        // Convert relative URLs to absolute
        if (brandingData.logo_url && !brandingData.logo_url.startsWith('http')) {
          brandingData.logo_url = `${BACKEND_URL}${brandingData.logo_url}`;
        }
        if (brandingData.favicon_url && !brandingData.favicon_url.startsWith('http')) {
          brandingData.favicon_url = `${BACKEND_URL}${brandingData.favicon_url}`;
        }
        
        // Update cache
        brandingCache = brandingData;
        cacheTimestamp = now;
        
        setBranding(brandingData);
        
        // Update favicon dynamically
        if (brandingData.favicon_url) {
          updateFavicon(brandingData.favicon_url);
        }
        
        // Update page title
        if (brandingData.company_name) {
          document.title = `${brandingData.company_name} - Results-Driven Digital Solutions`;
        }
      }
    } catch (error) {
      console.error('Failed to fetch branding:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranding();
  }, [fetchBranding]);

  const updateFavicon = (url) => {
    // Remove existing favicons
    const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
    existingFavicons.forEach(favicon => favicon.remove());

    // Add new favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = url;
    document.head.appendChild(link);
  };

  return { branding, isLoading };
};
