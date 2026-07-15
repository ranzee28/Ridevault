import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Crown, Check, X, Plus, Minus } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import { membershipApi, MembershipDetails } from '../../lib/membershipApi';

const renderFeatureValue = (val: boolean | string) => {
  if (typeof val === 'boolean') {
    return val ? <Check size={16} className="mx-auto text-white" /> : <X size={16} className="mx-auto text-white/20" />;
  }
  return <span className="text-sm font-medium text-white/80">{val}</span>;
};

export default function Membership() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [currentMembership, setCurrentMembership] = useState<MembershipDetails | null>(null);
  const navigate = useNavigate();

  const { t } = useLanguage();

  useEffect(() => {
    const fetchMembership = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const membership = await membershipApi.getMembershipDashboard(user.id);
        if (membership && membership.membership_status === 'active') {
          setCurrentMembership(membership);
        }
      }
    };
    fetchMembership();
  }, []);

  const tiers = [
    {
      name: "Bronze",
      alias: t('membership.tier1.alias') || "Initiate",
      price: "Rp 750 ribu",
      period: "/bln",
      description: t('membership.tier1.desc') || "Perfect for occasional weekend riders seeking access to premium standard models.",
      gradient: "from-[#CD7F32]/20 via-[#CD7F32]/5 to-transparent",
      border: "border-[#CD7F32]/30",
      text: "text-[#CD7F32]",
      btnStyle: "bg-transparent border border-[#CD7F32]/50 text-[#CD7F32] hover:bg-[#CD7F32]/10",
      activeBtnStyle: "bg-transparent border border-[#CD7F32] text-[#CD7F32] hover:bg-[#CD7F32] hover:text-black",
      iconColor: "text-[#CD7F32]",
      features: [
        t('membership.tier1.feat1') || "Access to standard sport fleet",
        t('membership.tier1.feat2') || "5% off daily rates",
        t('membership.tier1.feat3') || "Standard booking priority",
        t('membership.tier1.feat4') || "Basic insurance included"
      ]
    },
    {
      name: "Silver",
      alias: t('membership.tier2.alias') || "Enthusiast",
      price: "Rp 1.5 juta",
      period: "/bln",
      description: t('membership.tier2.desc') || "For dedicated riders who want priority access and significant savings across the year.",
      gradient: "from-slate-400/20 via-slate-400/5 to-transparent",
      border: "border-slate-400/50",
      text: "text-slate-300",
      btnStyle: "bg-transparent border border-slate-400/50 text-slate-300 hover:bg-slate-400/10",
      activeBtnStyle: "bg-transparent border border-slate-400 text-slate-300 hover:bg-slate-400 hover:text-black",
      iconColor: "text-slate-300",
      popular: true,
      features: [
        t('membership.tier2.feat1') || "Priority Booking Access",
        t('membership.tier2.feat2') || "10% exclusive discount",
        t('membership.tier2.feat3') || "Priority customer support",
        t('membership.tier2.feat4') || "Premium insurance included",
        t('membership.tier2.feat5') || "1 free delivery per month"
      ]
    },
    {
      name: "Gold",
      alias: t('membership.tier3.alias') || "Elite",
      price: "Rp 3 juta",
      period: "/bln",
      description: t('membership.tier3.desc') || "The ultimate unlimited passport to our worldwide fleet and private clubhouse lounges.",
      gradient: "from-[#D4AF37]/30 via-[#D4AF37]/10 to-transparent",
      border: "border-[#D4AF37]/50",
      text: "text-[#D4AF37]",
      btnStyle: "bg-[#D4AF37] text-black hover:bg-white transition-colors shadow-[0_0_30px_rgba(212,175,55,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]",
      activeBtnStyle: "bg-transparent border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black",
      iconColor: "text-[#D4AF37]",
      elite: true,
      vaultAccess: [
        t('membership.tier3.vault1') || "Priority Insurance Coverage",
        t('membership.tier3.vault2') || "24/7 Dedicated Concierge",
        t('membership.tier3.vault3') || "Private Event Access"
      ],
      features: [
        t('membership.tier3.feat1') || "Access to exclusive VIP fleet",
        t('membership.tier3.feat2') || "20% discount on all rides",
        t('membership.tier3.feat3') || "No security deposits required",
        t('membership.tier3.feat4') || "Unlimited free delivery",
        t('membership.tier3.feat5') || "VIP Touring Experiences"
      ]
    }
  ];

  const comparisonFeatures = [
    {
      category: t('membership.comp.cat1') || "Fleet Access",
      items: [
        { name: t('membership.comp.cat1.item1') || "Standard Sport Models", bronze: true, silver: true, gold: true },
        { name: t('membership.comp.cat1.item2') || "Premium Touring Models", bronze: false, silver: true, gold: true },
        { name: t('membership.comp.cat1.item3') || "Exclusive VIP Vault Fleet", bronze: false, silver: false, gold: true },
        { name: t('membership.comp.cat1.item4') || "Early Booking Access", bronze: false, silver: "48h prior", gold: "72h prior" },
      ]
    },
    {
      category: t('membership.comp.cat2') || "Financials & Discounts",
      items: [
        { name: t('membership.comp.cat2.item1') || "Daily Rental Discount", bronze: "5%", silver: "10%", gold: "20%" },
        { name: t('membership.comp.cat2.item2') || "Security Deposit", bronze: "Standard", silver: "50% Reduced", gold: "Waived" },
        { name: t('membership.comp.cat2.item3') || "Cancellation Policy", bronze: "48 Hours", silver: "24 Hours", gold: "Flexible" },
      ]
    },
    {
      category: t('membership.comp.cat3') || "Premium Services",
      items: [
        { name: t('membership.comp.cat3.item1') || "Concierge Delivery", bronze: false, silver: "1 Free/mo", gold: "Unlimited Free" },
        { name: "Perlengkapan Riding & GoPro", bronze: "Berbayar", silver: "Berbayar", gold: "GRATIS" },
        { name: "Asistensi Darurat 24/7", bronze: "Berbayar", silver: "Berbayar", gold: "GRATIS" },
        { name: "Diskon Tur Terpandu", bronze: "-", silver: "10%", gold: "20%" },
        { name: t('membership.comp.cat3.item2') || "Private Lounge Access", bronze: false, silver: false, gold: true },
        { name: t('membership.comp.cat3.item3') || "Event Invitations", bronze: false, silver: "Standard Events", gold: "VIP Galas" },
        { name: t('membership.comp.cat3.item4') || "Dedicated Handler", bronze: false, silver: false, gold: true },
      ]
    }
  ];

  const faqs = [
    {
      question: t('membership.faq1.q') || "Apakah saya perlu deposit keamanan?",
      answer: t('membership.faq1.a') || "Untuk sewa standar dan anggota Bronze, deposit keamanan tetap diperlukan. Anggota Silver menerima potongan deposit sebesar 50%. Sedangkan anggota Gold kami menikmati bebas deposit keamanan sepenuhnya berkat sistem verifikasi tepercaya kami."
    },
    {
      question: t('membership.faq2.q') || "Bagaimana dengan Perlengkapan Riding Premium & GoPro?",
      answer: t('membership.faq2.a') || "Penyewa standar atau anggota Bronze & Silver dikenakan biaya sewa harian tambahan untuk helm premium, jaket, dan GoPro. Khusus anggota Gold, semua Perlengkapan Riding Premium (Shoei/AGV, Komine, Alpinestars) serta Action Cam GoPro Hero 11 terpasang sudah termasuk GRATIS untuk setiap pemesanan."
    },
    {
      question: t('membership.faq3.q') || "Dapatkah saya membatalkan atau mengubah reservasi saya?",
      answer: t('membership.faq3.a') || "Anggota Bronze dapat membatalkan reservasi hingga 48 jam sebelum perjalanan untuk pengembalian dana penuh. Anggota Silver memiliki kelonggaran hingga 24 jam. Anggota Gold menikmati jaminan fleksibilitas penuh, memungkinkan pembatalan atau perubahan jadwal hingga waktu penyerahan unit tanpa denda."
    },
    {
      question: t('membership.faq4.q') || "Bagaimana cara kerja Layanan Pengiriman Pramutamu?",
      answer: t('membership.faq4.a') || "Layanan ini menggunakan truk towing hidrolik tertutup khusus Moge untuk mengantarkan unit langsung ke bandara, vila, atau hotel Anda di Bali dengan kondisi BBM penuh dan siap gas. Layanan ini GRATIS tanpa batas untuk anggota Gold, gratis 1x sebulan untuk Silver, dan berbayar untuk Bronze."
    },
    {
      question: t('membership.faq5.q') || "Bisakah saya meningkatkan keanggotaan nanti?",
      answer: t('membership.faq5.a') || "Ya, Anda dapat meningkatkan tingkat keanggotaan Anda kapan saja. Sisa saldo keanggotaan Anda saat ini akan dihitung secara proporsional untuk mengurangi biaya pembayaran tingkat keanggotaan baru."
    },
    {
      question: t('membership.faq7.q') || "Bagaimana metode pembayaran dan proses penagihan keanggotaan?",
      answer: t('membership.faq7.a') || "Pembayaran dilakukan secara bulanan menggunakan sistem billing terenkripsi. Kami menerima berbagai metode pembayaran aman seperti Kartu Kredit (Visa/Mastercard), Virtual Account (BCA), GoPay, dan Transfer Bank langsung."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleUpgrade = (tierName: string) => {
    navigate('/membership/checkout', { state: { tier: tierName.toLowerCase() } });
  };

  return (
    <section id="membership" className="py-32 bg-[#050505] relative overflow-hidden border-t border-white/5">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 md:mb-24">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-white/40 text-[10px] uppercase tracking-[0.4em] font-semibold mb-6 block flex items-center justify-center gap-2"
          >
            <Crown size={14} className="text-[#D4AF37]" /> Exclusive Access
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-6"
          >
            Elevate Your Status.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/40 text-lg md:text-xl font-light leading-relaxed"
          >
            Join the most exclusive riders club. Choose your tier and unlock unparalleled privileges, significant savings, and global access to our vault.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier, i) => (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              key={tier.name}
              className={`relative rounded-sm border ${tier.border} overflow-hidden bg-black/80 backdrop-blur-xl group flex flex-col ${tier.elite ? 'md:-translate-y-4 shadow-2xl' : ''}`}
            >
              {/* Card Hover Glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-b ${tier.gradient} opacity-40 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`}></div>

              <div className="p-10 relative z-10 flex-1 flex flex-col">
                {tier.elite && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-black text-[8px] uppercase tracking-widest font-bold px-4 py-2 rounded-bl-sm shadow-md">
                    Most Premium
                  </div>
                )}
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-slate-200 text-black text-[8px] uppercase tracking-widest font-bold px-4 py-2 rounded-bl-sm shadow-md">
                    Most Popular
                  </div>
                )}

                <h3 className={`text-2xl font-bold tracking-tight mb-2 ${tier.text}`}>{tier.name}</h3>
                <span className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-semibold block mb-8">{tier.alias}</span>

                <div className="flex items-end gap-2 mb-6">
                  <span className="text-5xl font-bold tracking-tighter text-white">{tier.price}</span>
                  <span className="text-white/40 mb-2 font-mono text-sm uppercase">{tier.period}</span>
                </div>

                <p className="text-white/50 font-light text-sm leading-relaxed mb-6 h-16">
                  {tier.description}
                </p>

                {tier.elite && tier.vaultAccess && (
                  <div className="mb-8 p-5 rounded-sm bg-[#D4AF37]/5 border border-[#D4AF37]/20 backdrop-blur-md relative overflow-hidden group/vault shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/10 to-transparent opacity-50"></div>
                    <div className="relative z-10">
                      <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-3">
                        <Crown size={14} /> Vault Access
                      </h4>
                      <ul className="space-y-3">
                        {tier.vaultAccess.map((vaultFeat, v) => (
                          <li key={v} className="text-white/80 text-[13px] font-light flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shrink-0 group-hover/vault:scale-150 transition-transform shadow-[0_0_5px_rgba(212,175,55,0.5)]"></div>
                            {vaultFeat}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="mt-auto">
                  <ul className="space-y-4 mb-10">
                    {tier.features.map((feat, j) => (
                      <li key={j} className="flex items-start gap-4">
                        <div className={`w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5`}>
                          <CheckCircle2 className={`${tier.iconColor}`} size={12} />
                        </div>
                        <span className="text-white/70 font-light text-sm">{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => {
                      if (currentMembership?.tier.toLowerCase() === tier.name.toLowerCase()) {
                        navigate('/membership/dashboard');
                      } else {
                        handleUpgrade(tier.name);
                      }
                    }}
                    className={`group w-full py-4 rounded-sm font-bold tracking-widest text-[10px] uppercase transition-all flex items-center justify-center gap-2 ${currentMembership?.tier.toLowerCase() === tier.name.toLowerCase()
                        ? tier.activeBtnStyle
                        : tier.btnStyle
                      }`}>
                    {currentMembership?.tier.toLowerCase() === tier.name.toLowerCase() ? (
                      <>Tier Saat Ini <span className="text-lg leading-none group-hover:translate-x-1 transition-transform">→</span> Dashboard</>
                    ) : 'Select Tier'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center"
        >
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 bg-transparent border border-white/20 text-white rounded-sm font-bold tracking-widest hover:bg-white hover:text-black transition-all text-[10px] uppercase inline-flex items-center gap-2 group"
          >
            Compare All Privileges <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-32 max-w-3xl mx-auto"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white tracking-tight mb-4">{t('membership.faq.title') || "Membership FAQs"}</h3>
            <p className="text-white/40 font-light">{t('membership.faq.subtitle') || "Common questions about our exclusive tiers."}</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`border border-white/10 rounded-sm overflow-hidden transition-colors duration-300 ${openFaq === index ? 'bg-white/5 border-white/20' : 'bg-black/50 hover:bg-black/80'}`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left p-6 flex justify-between items-center gap-4"
                >
                  <span className={`font-medium ${openFaq === index ? 'text-white' : 'text-white/80'}`}>{faq.question}</span>
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${openFaq === index ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-white/10 text-white/50'}`}>
                    {openFaq === index ? <Minus size={16} /> : <Plus size={16} />}
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="p-6 pt-0 text-white/50 font-light leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* Compare Privileges Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 md:px-12 bg-black/80 backdrop-blur-md py-10 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0A0A0A] border border-white/10 w-full max-w-5xl rounded-sm shadow-2xl relative flex flex-col my-auto max-h-[90vh]"
            >
              <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#0A0A0A]/95 backdrop-blur z-30">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    Compare Privileges
                  </h3>
                  <p className="text-white/40 text-xs md:text-sm mt-1 font-light">Detailed breakdown of tier benefits.</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 custom-scrollbar p-6 md:p-8">
                <div className="overflow-x-auto custom-scrollbar pb-6">
                  <div className="min-w-[700px] border border-white/5 rounded-sm bg-[#0a0a0a]/80 backdrop-blur-md">

                    {/* Table Header */}
                    <div className="grid grid-cols-4 border-b border-white/10 items-end p-6 sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl z-20">
                      <div className="col-span-1">
                        <span className="text-white/40 text-xs font-medium">Features</span>
                      </div>
                      <div className="col-span-1 text-center border-l border-white/5">
                        <span className="block text-[#CD7F32] font-bold text-lg mb-1">Bronze</span>
                      </div>
                      <div className="col-span-1 text-center border-l border-white/5 relative">
                        <span className="block text-slate-300 font-bold text-lg mb-1">Silver</span>
                      </div>
                      <div className="col-span-1 text-center border-l border-white/10 relative">
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-full flex justify-center">
                          <span className="bg-[#D4AF37]/20 text-[#D4AF37] px-3 py-1 rounded-sm text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 border border-[#D4AF37]/30">
                            <Crown size={12} /> Vault Access
                          </span>
                        </div>
                        <span className="block text-[#D4AF37] font-bold text-lg mb-1">Gold</span>
                      </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-white/5">
                      {comparisonFeatures.map((group, i) => (
                        <div key={i} className="group/section">
                          {/* Category Header */}
                          <div className="bg-white/5 p-4 pl-6">
                            <span className="text-white/60 text-xs uppercase tracking-widest font-bold">{group.category}</span>
                          </div>

                          {/* Features */}
                          <div className="divide-y divide-white/5">
                            {group.items.map((item, j) => (
                              <div key={j} className="grid grid-cols-4 p-4 hover:bg-white/[0.02] transition-colors rounded-sm mx-2 my-1 items-center">
                                <div className="col-span-1 pr-4">
                                  <span className="text-white/70 text-sm font-light">{item.name}</span>
                                </div>
                                <div className="col-span-1 text-center">
                                  {renderFeatureValue(item.bronze)}
                                </div>
                                <div className="col-span-1 text-center">
                                  {renderFeatureValue(item.silver)}
                                </div>
                                <div className="col-span-1 text-center bg-gradient-to-r from-[#D4AF37]/[0.02] to-transparent py-2 rounded-sm border-l border-[#D4AF37]/10 relative group-hover:bg-[#D4AF37]/[0.05] transition-colors">
                                  {/* Subtle glow for Gold column */}
                                  <div className="absolute inset-0 bg-[#D4AF37]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm blur-xl"></div>
                                  <div className="relative z-10 text-[#D4AF37]">
                                    {renderFeatureValue(item.gold)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upgrade Celebration Overlay */}
    </section>
  );
}
