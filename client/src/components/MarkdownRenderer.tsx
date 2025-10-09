import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose prose-lg max-w-none dark:prose-invert", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Custom heading components with proper styling
          h1: ({ children }) => (
            <h1 className="text-4xl font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-3xl font-semibold mt-8 mb-4 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-2xl font-semibold mt-6 mb-3 text-gray-900 dark:text-gray-100">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-gray-100">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-base font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100">
              {children}
            </h6>
          ),
          // Custom paragraph styling
          p: ({ children }) => (
            <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              {children}
            </p>
          ),
          // Custom list styling
          ul: ({ children }) => (
            <ul className="mb-4 ml-6 space-y-2 list-disc text-gray-700 dark:text-gray-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 ml-6 space-y-2 list-decimal text-gray-700 dark:text-gray-300">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-700 dark:text-gray-300">
              {children}
            </li>
          ),
          // Custom blockquote styling
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 py-2 rounded-r">
              {children}
            </blockquote>
          ),
          // Custom code styling
          code: ({ children, className, ...props }: any) => {
            const isInline = !className?.includes('language-');
            if (isInline) {
              return (
                <code 
                  className="bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 px-1 py-0.5 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code 
                className="block bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
          // Custom table styling
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border border-gray-200 dark:border-gray-700">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800 font-semibold text-left">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">
              {children}
            </td>
          ),
          // Custom link styling
          a: ({ children, href }) => (
            <a 
              href={href} 
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          // Custom strong (bold) styling
          strong: ({ children }) => (
            <strong className="font-bold text-gray-900 dark:text-gray-100">
              {children}
            </strong>
          ),
          // Custom emphasis (italic) styling
          em: ({ children }) => (
            <em className="italic text-gray-800 dark:text-gray-200">
              {children}
            </em>
          ),
          // Custom horizontal rule
          hr: () => (
            <hr className="my-8 border-t border-gray-300 dark:border-gray-600" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}