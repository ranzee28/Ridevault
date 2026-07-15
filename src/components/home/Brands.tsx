import { useLanguage } from '../../contexts/LanguageContext';
import LogoLoop from './LogoLoop';

export default function Brands() {
  const { t } = useLanguage();
  const brands = [
    { name: 'BMW Motorrad', logo: 'BMW' },
    { name: 'Ducati', logo: 'DUCATI' },
    { name: 'Kawasaki', logo: 'KAWASAKI' },
    { name: 'Yamaha', logo: 'YAMAHA' },
    { name: 'Harley-Davidson', logo: 'HARLEY-DAVIDSON' },
    { name: 'Triumph', logo: 'TRIUMPH' }
  ];

  const brandLogos = brands.map(brand => ({
    node: (
      <div className="text-lg md:text-xl font-bold text-[#F3F4F6]/60 hover:text-white tracking-[0.2em] uppercase whitespace-nowrap transition-colors duration-300 cursor-pointer">
        {brand.name}
      </div>
    ),
    title: brand.name
  }));

  return (
    <section className="py-12 border-b border-white/10 bg-[#050505] overflow-hidden">
      <div className="w-full">
        <p className="text-center text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold mb-8">
          {t('brands.title')}
        </p>
        
        <div className="relative w-full overflow-hidden py-2">
          <LogoLoop
            logos={brandLogos}
            speed={40}
            direction="left"
            logoHeight={24}
            gap={80}
            hoverSpeed={10}
            scaleOnHover={true}
            fadeOut={true}
            fadeOutColor="#050505"
            ariaLabel="Premium Motorcycle Brands"
          />
        </div>
      </div>
    </section>
  );
}
