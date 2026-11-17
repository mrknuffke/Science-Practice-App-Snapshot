import React, { useState, useRef, useEffect } from 'react';
import { X, GripHorizontal } from 'lucide-react';

interface DesmosCalculatorModalProps {
    onClose: () => void;
}

const DesmosCalculatorModal: React.FC<DesmosCalculatorModalProps> = ({ onClose }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

    useEffect(() => {
        // Initialize position to center-right of the screen on mount
        if (typeof window !== 'undefined') {
            const width = 400;
            const height = 500;
            const startX = window.innerWidth > 800 ? window.innerWidth - width - 20 : (window.innerWidth - width) / 2;
            const startY = Math.max(80, (window.innerHeight - height) / 2);
            setPosition({ x: Math.max(10, startX), y: Math.max(10, startY) });
        }
    }, []);

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            initialX: position.x,
            initialY: position.y
        };
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        setPosition({
            x: dragRef.current.initialX + dx,
            y: dragRef.current.initialY + dy
        });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    return (
        <div
            className="fixed z-[100] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
            style={{
                left: position.x,
                top: position.y,
                width: '400px',
                height: '500px',
            }}
        >
            {/* Header (Draggable Area) */}
            <div
                className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between cursor-move shrink-0 touch-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                title="Drag to move"
            >
                <div className="flex items-center gap-2">
                    <GripHorizontal className="w-5 h-5 text-slate-400" />
                    <h3 className="font-bold text-sm tracking-wide">Desmos Calculator</h3>
                </div>
                <button aria-label="Close calculator"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent drag triggered
                        onClose();
                    }}
                    className="p-1 hover:bg-slate-600 rounded-full transition-colors text-slate-300 hover:text-white pointer-events-auto"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Iframe Container */}
            <div className="flex-1 w-full relative bg-white">
                <iframe
                    src="https://www.desmos.com/scientific"
                    className="absolute inset-0 w-full h-full border-0"
                    title="Desmos Scientific Calculator"
                    allow="clipboard-read; clipboard-write"
                />
            </div>
        </div>
    );
};

export default DesmosCalculatorModal;
