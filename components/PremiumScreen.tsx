import React, { useState, useEffect } from 'react';
import { Payment, PaymentProduct } from '../services/payment';
import { useLanguage } from '../contexts/LanguageContext';

interface PremiumScreenProps {
  onClose: () => void;
  onUnlock: () => void; // Kept for legacy prop compatibility, but debug button removed
}

const PremiumScreen: React.FC<PremiumScreenProps> = ({ onClose, onUnlock }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<PaymentProduct | null>(null);

  useEffect(() => {
    Payment.getProducts().then(products => {
      if (products.length > 0) {
        setProduct(products[0]);
      }
    });
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const success = await Payment.purchase(product || undefined);
      if (success) {
        alert("Welcome, Director. Clearance Granted.");
        onUnlock(); // Actually unlock the content
        onClose();
      }
    } catch (err: any) {
      alert(err.message || "Failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    const success = await Payment.restorePurchases();
    if (success) {
      alert("Purchases Restored.");
      onUnlock(); // Re-unlock
      onClose();
    } else {
      // alert already shown in service specific to error
    }
    setLoading(false);
  };

  const getPrice = () => product ? product.priceString : '40,00 €';

  return (
    <div className="fixed inset-0 w-full h-[100dvh] flex flex-col bg-[#14120e] pb-0 overflow-y-auto no-scrollbar z-50 font-sans">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-yellow-900/40 via-[#14120e] to-[#14120e]"></div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 pt-6">
        <button onClick={onClose} className="flex size-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
        <button onClick={handleRestore} className="text-white/40 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
          Restore
        </button>
      </div>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center px-4 pt-2 pb-6 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-900 to-black border border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.25)]">
          <span className="material-symbols-outlined text-blue-500 text-4xl">security</span>
        </div>
        <h1 className="text-white font-serif text-3xl font-bold leading-none tracking-wide mb-3 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
          {t('premium.title').split(' ').slice(0, 2).join(' ')}<br />{t('premium.title').split(' ').slice(2).join(' ')}
        </h1>
        <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-[260px]">
          {t('premium.subtitle')}
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="relative z-10 px-4 mb-6">
        <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
          {/* Free Card */}
          <div className="flex flex-col rounded-xl border border-gray-800 bg-gray-950 p-4 relative">
            <h3 className="text-white/60 font-serif text-xs font-bold uppercase tracking-wider mb-2">{t('premium.recruit')}</h3>
            <p className="text-3xl font-bold text-white mb-4">$0</p>
            <div className="flex flex-col gap-2.5 mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-500 text-sm">check</span>
                <span className="text-gray-400 text-xs font-medium leading-none">{t('premium.standard')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-500 text-sm">check</span>
                <span className="text-gray-400 text-xs font-medium leading-none">{t('premium.basic')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-500 text-sm">history</span>
                <span className="text-gray-400 text-xs font-medium leading-none">{t('premium.ads')}</span>
              </div>
            </div>
            <div className="mt-auto py-3 rounded-lg bg-gray-900 border border-gray-800 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              {t('premium.active')}
            </div>
          </div>

          {/* Premium Card */}
          <div className="flex flex-col rounded-xl border border-blue-600 bg-gradient-to-b from-blue-900/20 to-black p-4 relative shadow-[0_0_20px_rgba(59,130,246,0.1)]">
            <div className="absolute -top-3 -right-3">
              <span className="bg-blue-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded shadow-md">{t('premium.top_secret')}</span>
            </div>
            <h3 className="text-blue-400 font-serif text-xs font-bold uppercase tracking-wider mb-2">{t('premium.director')}</h3>
            <div className="flex items-baseline gap-2 mb-1">
              <p className="text-3xl font-bold text-white">0 €</p>
              <span className="text-sm text-blue-400 font-bold uppercase tracking-wide">/ 3 Días</span>
            </div>
            <p className="text-[10px] text-gray-400 mb-4 uppercase tracking-widest font-bold">LUEGO {getPrice()} / LIFETIME</p>
            <div className="flex flex-col gap-2.5 mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500 text-sm">check_circle</span>
                <span className="text-white text-xs font-medium leading-none">{t('premium.all_roles')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500 text-sm">check_circle</span>
                <span className="text-white text-xs font-medium leading-none">{t('premium.analytics')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500 text-sm">check_circle</span>
                <span className="text-white text-xs font-medium leading-none">{t('premium.no_ads')}</span>
              </div>
            </div>
            <div className="mt-auto py-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center text-[10px] font-bold text-blue-400 uppercase tracking-widest">
              {t('premium.recommended')}
            </div>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="relative z-10 px-4 py-2 pb-40 max-w-lg mx-auto">
        <h2 className="font-serif text-lg font-bold text-white mb-4 text-center tracking-wide">{t('premium.features_title')}</h2>
        <div className="flex flex-col gap-3">
          {[
            { icon: 'lock_open', title: t('premium.feat.operatives_title'), desc: t('premium.feat.operatives_desc') },
            { icon: 'block', title: t('premium.feat.clean_title'), desc: t('premium.feat.clean_desc') },
            { icon: 'monitoring', title: t('premium.feat.dossier_title'), desc: t('premium.feat.dossier_desc') }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-950 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-900/20 text-blue-500">
                <span className="material-symbols-outlined text-2xl">{item.icon}</span>
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-white mb-0.5">{item.title}</h4>
                <p className="text-xs text-gray-400 leading-snug">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Links */}
        <div className="flex justify-center gap-6 mt-8 pb-4">
          <button className="text-[#666] text-[10px] hover:text-[#888]">{t('premium.terms')}</button>
          <button className="text-[#666] text-[10px] hover:text-[#888]">{t('premium.privacy')}</button>
        </div>
      </div>

      {/* Sticky Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/95 to-transparent pt-10">
        <div className="max-w-lg mx-auto flex flex-col gap-2">
          <button
            onClick={handleSubscribe}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-transform active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined text-xl">encrypted</span>
            <span className="text-sm tracking-wide uppercase font-bold">{loading ? t('premium.processing') : `COMENZAR PRUEBA GRATIS`}</span>
          </button>
          <p className="text-[9px] text-center text-gray-500 uppercase tracking-widest font-bold">
            3 Días gratis • Luego {getPrice()} pago único • Cancela cuando quieras
          </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumScreen;
