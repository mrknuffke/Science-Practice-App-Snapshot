/* global SpeechSynthesisVoice */
import React, { useState, useEffect, useRef } from 'react';
import {
    cleanTextForSpeech,
    getBestVoice,
    getAvailableNaturalVoices,
    getStoredTTSSettings,
    setStoredTTSSettings,
    chunkTextIntoSentences,
    DEFAULT_RATE
} from '../utils/speech';

interface TTSButtonProps {
    text: string;
    label?: string; // Optional text label next to icon
    className?: string; // Additional classes
    showSettings?: boolean; // Whether to offer the audio settings popover (default true)
}

export const TTSButton: React.FC<TTSButtonProps> = ({
    text,
    label,
    className = '',
    showSettings = true
}) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [hasSpeechSupport, setHasSpeechSupport] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [showMenu, setShowMenu] = useState(false);
    const [selectedVoiceUri, setSelectedVoiceUri] = useState<string | null>(null);
    const [playbackRate, setPlaybackRate] = useState<number>(DEFAULT_RATE);
    const [isPreviewing, setIsPreviewing] = useState(false);

    const stopPlaybackRef = useRef<(() => void) | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const myIdRef = useRef<string>(Math.random().toString(36).substring(7));

    // Load available voices and persisted settings
    useEffect(() => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
            return;
        }
        setHasSpeechSupport(true);

        const updateVoices = () => {
            const available = window.speechSynthesis.getVoices();
            if (available.length > 0) {
                setVoices(available);
            }
        };

        updateVoices();
        window.speechSynthesis.onvoiceschanged = updateVoices;

        // Load stored settings
        const stored = getStoredTTSSettings();
        setSelectedVoiceUri(stored.voiceUri);
        setPlaybackRate(stored.rate);

        // Listen for stops from other TTS buttons
        const handleGlobalStop = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail?.senderId !== myIdRef.current) {
                if (stopPlaybackRef.current) {
                    stopPlaybackRef.current();
                    stopPlaybackRef.current = null;
                }
                setIsSpeaking(false);
                setIsPreviewing(false);
            }
        };

        // Listen for settings changes from other instances
        const handleSettingsChanged = () => {
            const fresh = getStoredTTSSettings();
            setSelectedVoiceUri(fresh.voiceUri);
            setPlaybackRate(fresh.rate);
        };

        window.addEventListener('spp-tts-stop', handleGlobalStop);
        window.addEventListener('spp-tts-settings-changed', handleSettingsChanged);

        return () => {
            window.removeEventListener('spp-tts-stop', handleGlobalStop);
            window.removeEventListener('spp-tts-settings-changed', handleSettingsChanged);
            if (stopPlaybackRef.current) {
                stopPlaybackRef.current();
            }
        };
    }, []);

    // Close settings popover on click outside
    useEffect(() => {
        if (!showMenu) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowMenu(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [showMenu]);

    const stopAllSpeech = () => {
        if (stopPlaybackRef.current) {
            stopPlaybackRef.current();
            stopPlaybackRef.current = null;
        }
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPreviewing(false);

        // Notify other TTSButtons that speech was stopped
        window.dispatchEvent(new CustomEvent('spp-tts-stop', {
            detail: { senderId: myIdRef.current }
        }));
    };

    const playSpeech = (rawTextToSpeak: string, onFinish?: () => void) => {
        if (!hasSpeechSupport) return;

        // Stop any current speech first
        stopAllSpeech();

        const cleaned = cleanTextForSpeech(rawTextToSpeak);
        if (!cleaned) return;

        const activeVoice = getBestVoice(voices, selectedVoiceUri);
        const chunks = chunkTextIntoSentences(cleaned);

        let cancelled = false;
        let chunkIndex = 0;

        const speakNextChunk = () => {
            if (cancelled || chunkIndex >= chunks.length) {
                setIsSpeaking(false);
                if (onFinish) onFinish();
                return;
            }

            const currentText = chunks[chunkIndex];
            const utterance = new SpeechSynthesisUtterance(currentText);

            if (activeVoice) {
                utterance.voice = activeVoice;
            }
            utterance.rate = playbackRate;
            utterance.pitch = 1.0;

            utterance.onend = () => {
                if (!cancelled) {
                    chunkIndex++;
                    speakNextChunk();
                }
            };

            utterance.onerror = (e) => {
                if (e.error !== 'interrupted' && e.error !== 'canceled') {
                    console.warn('SpeechSynthesis error:', e);
                }
                setIsSpeaking(false);
                if (onFinish) onFinish();
            };

            window.speechSynthesis.speak(utterance);
        };

        stopPlaybackRef.current = () => {
            cancelled = true;
            window.speechSynthesis.cancel();
        };

        setIsSpeaking(true);
        speakNextChunk();
    };

    const handleSpeakToggle = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!hasSpeechSupport) return;

        if (isSpeaking) {
            stopAllSpeech();
        } else {
            playSpeech(text);
        }
    };

    const handleRateChange = (newRate: number) => {
        setPlaybackRate(newRate);
        setStoredTTSSettings({ rate: newRate });
        window.dispatchEvent(new CustomEvent('spp-tts-settings-changed'));
    };

    const handleVoiceChange = (uri: string) => {
        const val = uri === 'auto' ? null : uri;
        setSelectedVoiceUri(val);
        setStoredTTSSettings({ voiceUri: val });
        window.dispatchEvent(new CustomEvent('spp-tts-settings-changed'));
    };

    const handlePreview = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isPreviewing) {
            stopAllSpeech();
            setIsPreviewing(false);
        } else {
            setIsPreviewing(true);
            playSpeech("Photosynthesis converts carbon dioxide and water into glucose and oxygen.", () => {
                setIsPreviewing(false);
            });
        }
    };

    if (!hasSpeechSupport) return null;

    const naturalVoices = getAvailableNaturalVoices(voices);
    const activeBestVoice = getBestVoice(voices, selectedVoiceUri);

    return (
        <div className="relative inline-flex items-center gap-1">
            {/* MAIN PLAY/STOP BUTTON */}
            <button
                type="button"
                onClick={handleSpeakToggle}
                className={`group flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 dark:hover:text-cyan-300 transition-all p-1.5 rounded-lg hover:bg-slate-800/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 ${className}`}
                title={isSpeaking ? "Stop Speaking" : "Read Aloud (Natural Voice)"}
                aria-label={isSpeaking ? "Stop Speaking" : "Read Aloud"}
            >
                {isSpeaking ? (
                    <div className="flex items-center gap-0.5 h-4 w-4 justify-center" aria-hidden="true">
                        <span className="w-1 bg-cyan-500 dark:bg-cyan-400 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3" />
                        <span className="w-1 bg-cyan-400 dark:bg-cyan-300 rounded-full animate-[pulse_0.4s_ease-in-out_infinite_0.1s] h-4" />
                        <span className="w-1 bg-cyan-500 dark:bg-cyan-400 rounded-full animate-[pulse_0.5s_ease-in-out_infinite_0.2s] h-2.5" />
                    </div>
                ) : (
                    <svg className="w-4 h-4 transition-transform group-hover:scale-105" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                )}
                {label && (
                    <span className="text-xs font-bold uppercase tracking-wide">
                        {isSpeaking ? 'Speaking' : label}
                    </span>
                )}
            </button>

            {/* VOICE SETTINGS TRIGGER */}
            {showSettings && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                    }}
                    className={`p-1 text-slate-400/70 hover:text-cyan-400 hover:bg-slate-800/40 rounded transition-all focus:outline-none ${showMenu ? 'text-cyan-400 bg-slate-800/50' : 'opacity-60 hover:opacity-100'}`}
                    title="Audio & Voice Settings"
                    aria-label="Audio and Voice Settings"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            )}

            {/* SETTINGS POPOVER */}
            {showMenu && (
                <div
                    ref={popoverRef}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-full left-0 mt-1.5 w-64 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 text-slate-800 dark:text-slate-100 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-100"
                >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                        <span className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                            Voice Options
                        </span>
                        <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-medium">
                            Natural TTS
                        </span>
                    </div>

                    {/* SPEED SELECTOR */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Pacing
                        </label>
                        <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg">
                            {[
                                { rate: 0.85, label: '0.85×' },
                                { rate: DEFAULT_RATE, label: '0.95×' },
                                { rate: 1.1, label: '1.1×' }
                            ].map(({ rate, label: rateLabel }) => (
                                <button
                                    key={rate}
                                    type="button"
                                    onClick={() => handleRateChange(rate)}
                                    className={`py-1 text-center font-bold text-[11px] rounded transition-all ${playbackRate === rate
                                        ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-300 shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                        }`}
                                >
                                    {rateLabel}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* VOICE SELECTOR */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Voice
                        </label>
                        <select aria-label="Voice"
                            value={selectedVoiceUri || 'auto'}
                            onChange={(e) => handleVoiceChange(e.target.value)}
                            className="w-full text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        >
                            <option value="auto">
                                ✨ Auto-Best ({activeBestVoice ? activeBestVoice.name.replace(/Online\s*\(Natural\)/i, '').slice(0, 24) : 'Default'})
                            </option>
                            {naturalVoices.map((v) => (
                                <option key={v.voiceURI || v.name} value={v.voiceURI || v.name}>
                                    {v.name.slice(0, 32)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* PREVIEW BUTTON */}
                    <div className="pt-1 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={handlePreview}
                            className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-bold flex items-center gap-1 transition-colors"
                        >
                            {isPreviewing ? (
                                <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
                                    Playing sample...
                                </>
                            ) : (
                                <>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                                    Test Voice Sample
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowMenu(false)}
                            className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 uppercase font-semibold"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
