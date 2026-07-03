import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLocation } from 'react-router-dom';
import { SEO } from '../components/common/SEO';

interface MarkdownPageProps {
  title?: string;
  content: string;
}

export default function MarkdownPage({ title, content }: MarkdownPageProps) {
  // Try to generate a title from the URL if not provided
  const location = useLocation();
  const displayTitle = title || location.pathname.split('/').pop()?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Information';

  return (
    <div className="min-h-screen bg-[#f7fbf8] py-16 px-4 sm:px-6 lg:px-8 font-body">
      <SEO 
        title={`${displayTitle} - GoPanda`} 
        description={`Read our ${displayTitle.toLowerCase()} to learn more about GoPanda's services and policies.`}
      />
      <div className="max-w-4xl mx-auto bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] p-8 sm:p-10 md:p-16 mt-10 border border-[#dfeee6]">
        
        {/* We use custom components to style the markdown exactly how we want it */}
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({node, ...props}) => <h1 className="text-4xl sm:text-5xl font-display font-bold text-[#010101] mb-8 tracking-tight" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#010101] mt-12 mb-6 tracking-tight border-b border-[#dfeee6] pb-4" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-xl sm:text-2xl font-display font-semibold text-[#010101] mt-8 mb-4" {...props} />,
            p: ({node, ...props}) => <p className="text-[#3f4943] leading-relaxed mb-6 text-base sm:text-lg" {...props} />,
            a: ({node, ...props}) => <a className="text-[#3bb881] font-medium hover:text-[#167a50] underline decoration-[#3bb881]/30 hover:decoration-[#167a50] transition-colors" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc pl-6 space-y-3 mb-8 text-[#3f4943] marker:text-[#3bb881]" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal pl-6 space-y-3 mb-8 text-[#3f4943] marker:text-[#3bb881] marker:font-semibold" {...props} />,
            li: ({node, ...props}) => <li className="leading-relaxed text-base sm:text-lg" {...props} />,
            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[#3bb881] bg-[#f7fbf8] p-6 rounded-r-xl my-8 italic text-[#5f6963]" {...props} />,
            strong: ({node, ...props}) => <strong className="font-semibold text-[#010101]" {...props} />,
            code: ({node, ...props}: any) => <code className="bg-[#f7fbf8] text-[#167a50] px-1.5 py-0.5 rounded-md font-mono text-sm border border-[#dfeee6]" {...props} />,
            hr: ({node, ...props}) => <hr className="border-[#dfeee6] my-12" {...props} />
          }}
        >
          {content}
        </ReactMarkdown>

      </div>
    </div>
  );
}
