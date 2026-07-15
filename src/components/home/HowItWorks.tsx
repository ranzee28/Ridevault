import { motion } from 'motion/react';
import { Bike, ShieldCheck, Zap } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function HowItWorks() {
  const { t } = useLanguage();
  const steps = [
    {
      number: "01",
      title: t('howitworks.step1.title'),
      description: t('howitworks.step1.desc'),
      icon: <Bike size={24} className="text-[#D4AF37]" />
    },
    {
      number: "02",
      title: t('howitworks.step2.title'),
      description: t('howitworks.step2.desc'),
      icon: <ShieldCheck size={24} className="text-[#D4AF37]" />
    },
    {
      number: "03",
      title: t('howitworks.step3.title'),
      description: t('howitworks.step3.desc'),
      icon: <Zap size={24} className="text-[#D4AF37]" />
    }
  ];

  return (
    <section className="py-24 bg-[#050505] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
        <div className="md:col-span-6 lg:col-span-4 sticky top-24">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-[#F3F4F6] mb-4">{t('howitworks.title')}</h2>
          <p className="text-white/40 max-w-sm">{t('howitworks.badge')}</p>
        </div>

        <div className="md:col-span-6 lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {steps.map((step, i) => (
            <motion.div 
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              className="text-left group border border-white/5 bg-white/5 p-8 rounded-sm hover:bg-white/10 transition-colors"
            >
              <div className="mb-6">{step.icon}</div>
              <p className="text-4xl font-light text-white/60 mb-2 tracking-tighter">{step.number}</p>
              <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] mb-0">{step.title}</p>
              
              <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-300">
                <div className="overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                  <p className="text-white/40 text-sm pt-4">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
