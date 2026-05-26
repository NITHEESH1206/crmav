"use client";

import { useMemo } from "react";

/**
 * Tiny, dependency-free markdown renderer — handles headings, bold, italic,
 * inline code, bullet lists, paragraphs. AI output sticks to these shapes.
 */
export function Markdown({ text }: { text: string }) {
  const html = useMemo(() => render(text), [text]);
  return (
    <div
      className="prose-Zynex text-sm leading-relaxed text-white/85 [&>h1]:font-display [&>h1]:text-xl [&>h1]:font-semibold [&>h1]:tracking-tight [&>h1]:text-white [&>h1]:mt-5 [&>h1]:mb-2 [&>h2]:font-display [&>h2]:text-lg [&>h2]:font-semibold [&>h2]:text-white [&>h2]:mt-5 [&>h2]:mb-2 [&>h3]:font-semibold [&>h3]:text-white [&>h3]:mt-4 [&>h3]:mb-1.5 [&>p]:my-2 [&>ul]:my-2 [&>ul]:space-y-1 [&>ul>li]:pl-1 [&>ul>li]:before:content-['•'] [&>ul>li]:before:text-signal-400 [&>ul>li]:before:mr-2 [&_strong]:text-white [&_strong]:font-semibold [&_em]:text-white/95 [&_code]:bg-white/[0.06] [&_code]:border [&_code]:border-white/[0.06] [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[12px] [&_code]:font-mono [&_a]:text-signal-400 [&_a]:underline-offset-2 hover:[&_a]:underline"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function render(src: string): string {
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const inline = (s: string) =>
    escape(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');

  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? "";

    // headings
    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      const tag = `h${h[1].length}`;
      out.push(`<${tag}>${inline(h[2])}</${tag}>`);
      i++;
      continue;
    }

    // bullet list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^\s*[-*]\s+/, ""))}</li>`);
        i++;
      }
      out.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    // blank line → break
    if (line.trim() === "") {
      i++;
      continue;
    }

    // paragraph (gather until blank line or block boundary)
    const para: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,3}\s|\s*[-*]\s+)/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    out.push(`<p>${inline(para.join(" "))}</p>`);
  }
  return out.join("\n");
}
