import { motion } from 'motion/react';
import { ArrowRight, Instagram, Github, Mail } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-[#050505] pt-24 pb-12 text-white/40 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20 relative">
           
           <div className="lg:col-span-2">
             <div className="flex items-center gap-2 group mb-6">
               <div className="w-8 h-8 bg-gradient-to-tr from-[#94a3b8] to-[#f8fafc] rounded-sm transform rotate-45"></div>
               <span className="font-bold text-2xl text-[#F3F4F6] tracking-tighter uppercase pl-2">
                 RideVault
               </span>
             </div>
             <p className="max-w-xs text-sm leading-relaxed mb-8 font-light text-white/60">
               {t('footer.desc') || "The ultimate premium sport bike rental platform. Delivering unparalleled riding experiences across Bali's most beautiful destinations."}
             </p>
             
             <div className="flex gap-4">
               <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-sm hover:bg-white hover:text-black transition-all" title="Instagram">
                 <Instagram size={18} />
               </a>
               <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-sm hover:bg-white hover:text-black transition-all" title="GitHub">
                 <Github size={18} />
               </a>
               <a href="mailto:info@ridevault.com" className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-sm hover:bg-white hover:text-black transition-all" title="Mail">
                 <Mail size={18} />
               </a>
             </div>
           </div>

           <div>
             <h4 className="text-[#D4AF37] text-[10px] uppercase tracking-[0.3em] font-bold mb-6">{t('footer.platform') || "Platform"}</h4>
             <ul className="space-y-4 text-sm font-light">
               <li><a href="#" className="hover:text-white transition-colors">{t('footer.link1') || "The Vault Collection"}</a></li>
               <li><a href="#experience" className="hover:text-white transition-colors">{t('footer.link2') || "Experiences & Tours"}</a></li>
               <li><a href="#membership" className="hover:text-white transition-colors">{t('footer.link3') || "Elite Membership"}</a></li>
               <li><a href="#" className="hover:text-white transition-colors">{t('footer.link4') || "Gift Cards"}</a></li>
             </ul>
           </div>

           <div>
             <h4 className="text-[#D4AF37] text-[10px] uppercase tracking-[0.3em] font-bold mb-6">{t('footer.connect') || "Stay Connected"}</h4>
             <p className="text-sm font-light mb-4">{t('footer.subscribe') || "Subscribe for exclusive fleet additions and private event invites."}</p>
             <div className="flex border border-white/10 rounded-sm overflow-hidden focus-within:border-white/30 transition-colors">
               <input 
                 type="email" 
                 placeholder={t('footer.email_placeholder') || "Enter your email"} 
                 className="bg-transparent text-sm text-white px-6 py-3 w-full outline-none placeholder:text-white/20 font-light"
               />
               <button className="bg-white text-black px-6 py-3 font-medium hover:bg-[#94a3b8] transition-colors flex items-center justify-center">
                 <ArrowRight size={18} />
               </button>
             </div>
           </div>

        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest font-bold">
          <p>&copy; {new Date().getFullYear()} RideVault. {t('footer.rights') || "All rights reserved."}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">{t('footer.privacy') || "Privacy Policy"}</a>
            <a href="#" className="hover:text-white transition-colors">{t('footer.terms') || "Terms of Service"}</a>
            <a href="#" className="hover:text-white transition-colors">{t('footer.legal') || "Legal"}</a>
          </div>
        </div>
        
      </div>
    </footer>
  );
}
