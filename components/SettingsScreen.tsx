import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface SettingsScreenProps {
    onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
    const { language, setLanguage, t } = useLanguage();

    return (
        <div className="fixed inset-0 w-full h-[100dvh] flex flex-col bg-background-dark text-white overflow-hidden z-50 animate-fade-in">
            {/* Header */}
            <header className="flex items-center p-4 border-b border-white/5 bg-background-dark/95 backdrop-blur">
                <button onClick={onBack} className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/80 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="flex-1 text-center font-serif text-lg font-bold tracking-wide uppercase text-white/90">
                    {t('settings.title')}
                </h1>
                <div className="size-10"></div> {/* Spacer */}
            </header>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">

                {/* Language Section */}
                <div className="bg-surface-dark rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-outlined text-primary">language</span>
                        <h3 className="font-bold text-lg text-white">{t('settings.language')}</h3>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setLanguage('en')}
                            className={`flex-1 py-3 rounded-lg font-bold transition-all border ${language === 'en' ? 'bg-primary text-background-dark border-primary' : 'bg-white/5 text-white/60 border-transparent hover:bg-white/10'}`}
                        >
                            English
                        </button>
                        <button
                            onClick={() => setLanguage('es')}
                            className={`flex-1 py-3 rounded-lg font-bold transition-all border ${language === 'es' ? 'bg-primary text-background-dark border-primary' : 'bg-white/5 text-white/60 border-transparent hover:bg-white/10'}`}
                        >
                            Español
                        </button>
                    </div>
                </div>



            </div>
        </div>
    );
};

export default SettingsScreen;
