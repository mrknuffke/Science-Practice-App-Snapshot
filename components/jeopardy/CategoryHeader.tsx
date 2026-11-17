import React, { useState, useLayoutEffect, useRef } from 'react';
import { RenderHTML } from './RenderHTML';

interface CategoryHeaderProps {
    title: string;
}

export const CategoryHeader: React.FC<CategoryHeaderProps> = ({ title }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLSpanElement>(null);
    const [fontClass, setFontClass] = useState('text-xl md:text-2xl');
    const [marquee, setMarquee] = useState(false);
    const [marqueeDistance, setMarqueeDistance] = useState(0);

    useLayoutEffect(() => {
        if (!containerRef.current || !contentRef.current) return;
        const tiers = ['text-xl md:text-2xl', 'text-base md:text-lg', 'text-sm md:text-base', 'text-xs md:text-sm'];
        let tierIdx = 0;
        setFontClass(tiers[0]);
        setMarquee(false);

        const measure = () => {
            if (!containerRef.current || !contentRef.current) return;
            const containerW = containerRef.current.clientWidth;
            const contentW = contentRef.current.scrollWidth;
            if (contentW <= containerW) {
                return true;
            }
            return false;
        };

        const tryFit = () => {
            requestAnimationFrame(() => {
                if (measure()) return;
                if (tierIdx < tiers.length - 1) {
                    tierIdx += 1;
                    setFontClass(tiers[tierIdx]);
                    tryFit();
                } else {
                    if (contentRef.current && containerRef.current) {
                        const overflow = contentRef.current.scrollWidth - containerRef.current.clientWidth;
                        if (overflow > 0) {
                            setMarquee(true);
                            setMarqueeDistance(-overflow - 12);
                        }
                    }
                }
            });
        };
        tryFit();
    }, [title]);

    return (
        <div ref={containerRef} className="bg-slate-900 text-white px-4 rounded-2xl h-28 md:h-32 flex items-center justify-center shadow-xl border-b-4 border-indigo-600 overflow-hidden relative">
            <span
                ref={contentRef}
                className={`font-display uppercase tracking-wider leading-tight whitespace-nowrap ${fontClass} ${marquee ? 'jeopardy-marquee' : ''}`}
                style={marquee ? ({ ['--marquee-distance' as string]: `${marqueeDistance}px` } as React.CSSProperties) : undefined}
            >
                <RenderHTML text={title} />
            </span>
        </div>
    );
};
