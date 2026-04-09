import React from 'react';
import ReactMarkdown from 'react-markdown';
import Mermaid from './Mermaid';

import { motion } from 'motion/react';

interface MarkdownProps {
  content: string;
}

const Markdown: React.FC<MarkdownProps> = ({ content }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="prose prose-invert max-w-none prose-headings:font-semibold prose-a:text-blue-400"
    >
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-mermaid/.exec(className || '');
            if (!inline && match) {
              return <Mermaid chart={String(children).replace(/\n$/, '')} />;
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </motion.div>
  );
};

export default Markdown;
