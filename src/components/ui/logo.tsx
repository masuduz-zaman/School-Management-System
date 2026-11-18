import { cx } from "@/lib/format";

/** A simple crest: a shield holding an open book. */
export function Crest({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={cx("size-8", className)} aria-hidden>
      <path d="M16 2.5 4.5 6.5v8.2c0 7 4.6 12.2 11.5 14.8 6.9-2.6 11.5-7.8 11.5-14.8V6.5L16 2.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M16 11.2c-1.9-1.2-4.2-1.5-6.3-1.1v8.6c2.1-.4 4.4-.1 6.3 1.1m0-8.6c1.9-1.2 4.2-1.5 6.3-1.1v8.6c-2.1-.4-4.4-.1-6.3 1.1m0-8.6v8.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
