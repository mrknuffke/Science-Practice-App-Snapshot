import React from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import MermaidDiagram from './MermaidDiagram';

interface MarkdownRendererProps {
    content: string;
    className?: string;
    /** Overrides for the default renderers. Pass a constant (like those below), not an inline object: a new object each render defeats the memo and re-renders the markdown, KaTeX and Mermaid included. */
    components?: Components;
}

/** Paragraphs as spans: for markdown inside a button, an option, or a line of text. */
export const INLINE_PARAGRAPHS: Components = {
    p: ({ node, ...props }) => <span {...props} />
};

/** Block paragraphs with a small gap between them and none after the last. */
export const SPACED_PARAGRAPHS: Components = {
    p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = React.memo(({ content, className, components: propComponents }) => {

    // Memoize default components to prevent re-renders on every update (fixed flickering)
    const components = React.useMemo((): Components => ({
        // react-markdown 10 has no `inline` flag; a mermaid language tag only appears on fenced blocks.
        code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isMermaid = match && match[1] === 'mermaid';

            if (isMermaid) {
                return <MermaidDiagram chart={String(children).replace(/\n$/, '')} />;
            }

            return (
                <code className={className} {...props}>
                    {children}
                </code>
            );
        },
        // Custom renderer for tables
        table({ node, children, ...props }) {
            return (
                <div className="overflow-x-auto my-4">
                    <table className="min-w-full divide-y divide-gray-300 border border-gray-300 rounded-lg" {...props}>
                        {children}
                    </table>
                </div>
            );
        },
        thead({ node, children, ...props }) {
            return <thead className="bg-gray-50 mb-2" {...props}>{children}</thead>;
        },
        th({ node, children, ...props }) {
            return <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200" {...props}>{children}</th>;
        },
        td({ node, children, ...props }) {
            return <td className="px-3 py-2 whitespace-normal text-sm text-gray-700 border-b border-gray-100" {...props}>{children}</td>;
        },
        a({ node, children, href, ...props }) {
            return <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" {...props}>{children}</a>
        },
        ...propComponents
    }), [propComponents]);

    return (
        <div className={className}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
                rehypePlugins={[rehypeKatex, rehypeRaw]}
                components={components}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
});

export default MarkdownRenderer;
