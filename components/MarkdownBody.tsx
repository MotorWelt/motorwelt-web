import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Si ya usas next/image y quieres, lo conectamos luego.
// Por ahora img normal para que funcione rápido.
export default function MarkdownBody({ body }: { body: string }) {
  if (!body?.trim()) return null;

  return (
    <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-headings:scroll-mt-28">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => (
            <h2 className="text-2xl md:text-3xl font-extrabold mt-10 mb-4">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl md:text-2xl font-bold mt-8 mb-3">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg md:text-xl font-bold mt-6 mb-2">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-base md:text-lg font-semibold mt-5 mb-2">
              {children}
            </h5>
          ),
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={String(src || "")}
              alt={String(alt || "imagen")}
              className="w-full rounded-2xl border border-white/10 my-6"
              loading="lazy"
            />
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-white/20 pl-4 italic text-gray-200 my-6">
              {children}
            </blockquote>
          ),
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}
