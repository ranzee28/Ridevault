import { motion } from 'motion/react';
import Navbar from '../components/layout/Navbar';
import Hero from '../components/home/Hero';
import Brands from '../components/home/Brands';
import ShowcaseSlider from '../components/home/ShowcaseSlider';
import HowItWorks from '../components/home/HowItWorks';
import PremiumExperience from '../components/home/PremiumExperience';
import Membership from '../components/home/Membership';
import Footer from '../components/layout/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Brands />
        <ShowcaseSlider />
        <HowItWorks />
        <PremiumExperience />
        <Membership />
      </main>
      <Footer />
    </>
  );
}
