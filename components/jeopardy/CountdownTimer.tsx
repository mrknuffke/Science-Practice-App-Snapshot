import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { playBeep, playTimeUp } from './audioUtils';

/**
 * Countdown timer component for Jeopardy game
 * Starts at 60 seconds, plays beeps in final 5 seconds, plays alert when time's up
 */
export const CountdownTimer: React.FC = () => {
    const [seconds, setSeconds] = useState(60);
    const [isActive, setIsActive] = useState(false);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        if (isActive && seconds > 0) {
            timerRef.current = window.setInterval(() => {
                setSeconds((prev) => {
                    if (prev <= 6 && prev > 1) playBeep();
                    return prev - 1;
                });
            }, 1000);
        } else if (seconds === 0 && isActive) {
            setIsActive(false);
            playTimeUp(); // Gentle chime when time is up
            if (timerRef.current) clearInterval(timerRef.current);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isActive, seconds]);

    const toggle = () => setIsActive(!isActive);
    const reset = () => {
        setIsActive(false);
        setSeconds(60);
    };

    return (
        <div className="flex items-center gap-4 bg-slate-900 px-6 py-3 rounded-2xl shadow-xl border border-slate-700">
            <div className="flex flex-col items-center min-w-[3rem]">
                <span className={`text-2xl font-black tabular-nums ${seconds <= 10 ? 'text-rose-500 animate-pulse' : 'text-indigo-400'}`}>
                    {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={toggle} title={isActive ? "Pause" : "Start Timer"} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    {isActive ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button onClick={reset} title="Reset to 1:00" className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 transition-colors">
                    <RotateCcw size={16} />
                </button>
            </div>
        </div>
    );
};
