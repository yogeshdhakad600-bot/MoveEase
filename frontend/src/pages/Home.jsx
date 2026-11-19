import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Hero from '../components/Hero';
import ServicesSection from '../components/ServicesSection';
import HowItWorks from '../components/HowItWorks';
import StatsCounter from '../components/StatsCounter';
import Testimonials from '../components/Testimonials';
import FAQAccordion from '../components/FAQAccordion';

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const sectionId = location.hash.slice(1);
    window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    });
  }, [location.hash, location.key]);

  return (
    <MainLayout>
      <Hero />
      <ServicesSection />
      <HowItWorks />
      <StatsCounter />
      <Testimonials />
      <FAQAccordion />
    </MainLayout>
  );
}
