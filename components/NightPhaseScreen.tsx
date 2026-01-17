import React, { useState, useEffect, useRef } from 'react';
import { Player, Role } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface NightPhaseScreenProps {
    players: Player[];
    onNext: () => void;
}

const NightPhaseScreen: React.FC<NightPhaseScreenProps> = ({ players, onNext }) => {
    const { t, language } = useLanguage();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentLine, setCurrentLine] = useState('');
    const [progress, setProgress] = useState(0);

    // Create script based on roles present
    const generateScript = () => {
        const roles = players.map(p => p.role);
        const hasMerlin = roles.includes(Role.MERLIN);
        const hasPercival = roles.includes(Role.PERCIVAL);
        const hasMorgana = roles.includes(Role.MORGANA);
        const hasMordred = roles.includes(Role.MORDRED);
        const hasOberon = roles.includes(Role.OBERON);
        const hasMinions = roles.some(r => [Role.ASSASSIN, Role.MORGANA, Role.MORDRED, Role.MINION].includes(r));

        const script: { text: string; delay: number }[] = [];

        // 1. Intro
        script.push({ text: "Everyone, close your eyes and extend your fist in front of you.", delay: 5000 });

        // 2. Minions (Evil see plays Evil)
        // Oberon does not open eyes.
        if (hasMinions) {
            let text = "Minions of Mordred, open your eyes and look around.";
            if (hasOberon) text = "Minions of Mordred, except Oberon, open your eyes and look around.";

            script.push({ text: text, delay: 6000 });
            script.push({ text: "Minions, close your eyes.", delay: 3000 });
        }

        // 3. Merlin (Sees Evil)
        if (hasMerlin) {
            let text = "Minions of Mordred, extend your thumbs so Merlin may know of you.";
            if (hasMordred) text = "Minions of Mordred, except Mordred, extend your thumbs so Merlin may know of you.";

            script.push({ text: text, delay: 5000 });
            script.push({ text: "Merlin, open your eyes and see the agents of Evil.", delay: 7000 });
            script.push({ text: "Merlin, close your eyes. Minions, put your thumbs down.", delay: 4000 });
        }

        // 4. Percival (Sees Merlin & Morgana)
        if (hasPercival) {
            script.push({ text: "Merlin and Morgana, extend your thumbs so Percival may know you.", delay: 5000 });
            script.push({ text: "Percival, open your eyes and see the Magicians.", delay: 6000 });
            script.push({ text: "Percival, close your eyes. Merlin and Morgana, put your thumbs down.", delay: 4000 });
        }

        // 5. Outro
        script.push({ text: "Everyone, open your eyes. The game begins.", delay: 2000 });

        return script;
    };

    const playScript = async () => {
        if (isPlaying) return;
        setIsPlaying(true);
        const script = generateScript();

        // Choose voice
        const voices = window.speechSynthesis.getVoices();
        // Try to find a deeper/english voice. 
        // Usually 'Google UK English Male' or similar feels narrative.
        const selectedVoice = voices.find(v => v.name.includes('Google UK English Male')) ||
            voices.find(v => v.lang.includes('en-GB')) ||
            voices[0];

        for (let i = 0; i < script.length; i++) {
            const line = script[i];
            setCurrentLine(line.text);
            setProgress(((i + 1) / script.length) * 100);

            // Speech
            const utterance = new SpeechSynthesisUtterance(line.text);
            if (selectedVoice) utterance.voice = selectedVoice;
            utterance.rate = 0.9; // Slower for dramatic effect
            utterance.pitch = 0.8; // Deeper

            window.speechSynthesis.speak(utterance);

            // Wait for usage + delay
            // Rough estimation of speech duration + explicit delay
            const estimatedSpeechDuration = line.text.length * 60; // ~60ms per char
            await new Promise(r => setTimeout(r, estimatedSpeechDuration + line.delay));
        }

        setIsPlaying(false);
        setCurrentLine("Night Phase Complete.");
        setTimeout(onNext, 1500);
    };

    // Ensure voices are loaded (Chrome quirk)
    useEffect(() => {
        window.speechSynthesis.getVoices();
    }, []);

    return (
        <div className="h-full bg-[#1a1810] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Dark Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#1a1810] to-[#000000]"></div>

            <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
                <div className="mb-8">
                    <span className="material-symbols-outlined text-[80px] text-primary/50 animate-pulse">
                        nightlight
                    </span>
                </div>

                <h1 className="text-4xl font-serif font-bold text-white mb-2 tracking-wider">Night Phase</h1>
                <p className="text-white/50 mb-12">The kingdom sleeps, but secrets awake.</p>

                <div className="h-24 flex items-center justify-center mb-8 w-full px-4">
                    <p className={`text-xl font-serif text-primary transition-opacity duration-500 ${currentLine ? 'opacity-100' : 'opacity-0'}`}>
                        "{currentLine}"
                    </p>
                </div>

                {!isPlaying ? (
                    <button
                        onClick={playScript}
                        className="group relative flex flex-col items-center justify-center bg-primary hover:bg-[#ffe14d] text-[#2a261a] rounded-full w-24 h-24 mb-6 shadow-[0_0_30px_rgba(244,209,37,0.3)] transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-4xl">play_arrow</span>
                        <span className="text-[10px] font-bold uppercase mt-1 tracking-widest">Start</span>
                    </button>
                ) : (
                    <div className="w-full max-w-[200px] h-1 bg-white/20 rounded-full overflow-hidden mb-6">
                        <div
                            className="h-full bg-primary transition-all duration-1000 ease-linear"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                <button onClick={onNext} className="text-white/30 text-xs font-mono uppercase hover:text-white transition-colors">
                    Skip Narration
                </button>
            </div>
        </div>
    );
};

export default NightPhaseScreen;
