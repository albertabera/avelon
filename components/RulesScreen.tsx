import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ROLE_DEFINITIONS } from '../constants';
import { Alignment } from '../types';

interface RulesScreenProps {
    onBack: () => void;
}

const RulesScreen: React.FC<RulesScreenProps> = ({ onBack }) => {
    const { t } = useLanguage();
    const [tab, setTab] = useState<'guide' | 'roles'>('guide');

    const goodRoles = Object.values(ROLE_DEFINITIONS).filter(r => r.alignment === Alignment.GOOD);
    const evilRoles = Object.values(ROLE_DEFINITIONS).filter(r => r.alignment === Alignment.EVIL);

    const renderGuide = () => (
        <div className="space-y-6 text-white/90 pb-20">
            <div className="bg-white/5 p-5 rounded-xl border border-white/5">
                <h3 className="font-serif font-bold text-lg text-primary mb-2">{t('rules.header.intro')}</h3>
                <p className="text-sm leading-relaxed text-white/70">{t('rules.guide.intro')}</p>
            </div>

            <div className="bg-white/5 p-5 rounded-xl border border-white/5">
                <h3 className="font-serif font-bold text-lg text-primary mb-2">{t('rules.header.goal')}</h3>
                <p className="text-sm leading-relaxed text-white/70">{t('rules.guide.goal')}</p>
            </div>

            <div className="bg-white/5 p-5 rounded-xl border border-white/5">
                <h3 className="font-serif font-bold text-lg text-primary mb-2">{t('rules.header.turns')}</h3>
                <ol className="list-decimal pl-5 space-y-2 text-sm text-white/70">
                    <li>{t('rules.turn.1')}</li>
                    <li>{t('rules.turn.2')}</li>
                    <li>{t('rules.turn.3')}</li>
                </ol>
            </div>

            <div className="bg-white/5 p-5 rounded-xl border border-white/5">
                <h3 className="font-serif font-bold text-lg text-primary mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined">network_check</span>
                    {t('rules.header.sonda')}
                </h3>
                <p className="text-sm leading-relaxed text-white/70">{t('rules.sonda.desc')}</p>
            </div>
        </div>
    );

    const renderRoles = () => (
        <div className="space-y-8 pb-20">
            {/* Loyalists */}
            <div>
                <div className="flex items-center gap-2 mb-4 px-2">
                    <span className="material-symbols-outlined text-primary">shield</span>
                    <h3 className="text-primary font-bold tracking-widest uppercase text-sm">{t('setup.loyalists')}</h3>
                    <div className="h-px bg-primary/20 flex-1"></div>
                </div>
                <div className="grid gap-4">
                    {goodRoles.map(role => (
                        <div key={role.id} className="flex gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                            <div className="w-16 h-16 rounded-lg bg-black shrink-0 overflow-hidden border border-white/10">
                                <img src={role.image} className="w-full h-full object-cover opacity-90" />
                            </div>
                            <div>
                                <h4 className="font-serif font-bold text-primary">{t(`role.${role.id.toLowerCase()}.name`)}</h4>
                                <p className="text-xs text-white/60 leading-relaxed mt-1">{t(`role.${role.id.toLowerCase()}.desc`)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Minions */}
            <div>
                <div className="flex items-center gap-2 mb-4 px-2">
                    <span className="material-symbols-outlined text-evil-red">swords</span>
                    <h3 className="text-evil-red font-bold tracking-widest uppercase text-sm">{t('setup.minions')}</h3>
                    <div className="h-px bg-evil-red/20 flex-1"></div>
                </div>
                <div className="grid gap-4">
                    {evilRoles.map(role => (
                        <div key={role.id} className="flex gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                            <div className="w-16 h-16 rounded-lg bg-black shrink-0 overflow-hidden border border-white/10">
                                <img src={role.image} className="w-full h-full object-cover opacity-90" />
                            </div>
                            <div>
                                <h4 className="font-serif font-bold text-evil-red">{t(`role.${role.id.toLowerCase()}.name`)}</h4>
                                <p className="text-xs text-white/60 leading-relaxed mt-1">{t(`role.${role.id.toLowerCase()}.desc`)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 w-full h-[100dvh] flex flex-col bg-background-dark text-white overflow-hidden z-50 animate-fade-in">
            <header className="flex items-center p-4 border-b border-white/5 bg-background-dark/95 backdrop-blur">
                <button onClick={onBack} className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/80 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="flex-1 text-center font-serif text-lg font-bold tracking-wide uppercase text-white/90">
                    {t('rules.title')}
                </h1>
                <div className="size-10"></div>
            </header>

            <div className="flex p-2 gap-2 border-b border-white/5 bg-surface-dark">
                <button
                    onClick={() => setTab('guide')}
                    className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${tab === 'guide' ? 'bg-primary text-background-dark' : 'text-white/60 hover:bg-white/5'}`}
                >
                    {t('rules.tab.guide')}
                </button>
                <button
                    onClick={() => setTab('roles')}
                    className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${tab === 'roles' ? 'bg-primary text-background-dark' : 'text-white/60 hover:bg-white/5'}`}
                >
                    {t('rules.tab.roles')}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 content-start">
                {tab === 'guide' ? renderGuide() : renderRoles()}
            </div>
        </div>
    );
};

export default RulesScreen;
