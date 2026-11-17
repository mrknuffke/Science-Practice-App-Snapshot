import React, { useEffect, useRef, useState } from 'react';

interface MermaidDiagramProps {
    chart: string;
}

let mermaidInitialized = false;

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const renderChart = async () => {
            // Clean markdown code blocks if the AI accidentally wrapped it
            const cleanChart = chart ? chart.replace(/```mermaid\n?/gi, '').replace(/```\n?/g, '').trim() : '';

            if (containerRef.current && cleanChart && cleanChart !== 'null') {
                try {
                    setError(null);
                    // Load mermaid on demand so it isn't in the main bundle
                    const mermaid = (await import('mermaid')).default;
                    if (!mermaidInitialized) {
                        mermaid.initialize({
                            startOnLoad: false,
                            theme: 'default',
                            securityLevel: 'loose',
                            fontFamily: 'inherit',
                        });
                        mermaidInitialized = true;
                    }
                    // Generate a unique ID for this diagram
                    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                    // Mermaid rendering
                    const { svg } = await mermaid.render(id, cleanChart);
                    setSvg(svg);
                } catch (err) {
                    console.error('Failed to render mermaid chart:', err);
                    setError('Invalid Mermaid syntax');
                    // Important: Mermaid might leave the error element in the DOM, we might want to clean it up or let the user know.
                }
            }
        };

        renderChart();
    }, [chart]);

    if (error || !chart || chart.trim() === 'null') {
        if (!error && (!chart || chart.trim() === 'null')) return null; // Don't render error if it's just legitimately empty/null from the AI
        
        return (
            <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-md text-sm font-mono">
                <p className="font-bold">Diagram Error:</p>
                {error}
                <pre className="mt-2 text-xs overflow-auto">{chart}</pre>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="mermaid-diagram my-4 flex justify-center overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
};

export default MermaidDiagram;
