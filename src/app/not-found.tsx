import Link from "next/link";
import { Crest } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <Crest className="mx-auto size-12 text-muted" />
        <h1 className="mt-6 font-display text-4xl font-semibold">This page does not exist</h1>
        <p className="mt-2 text-muted">The link may be old, or the page may have moved.</p>
        <Link href="/" className="btn btn-primary mt-8">
          Back to home
        </Link>
      </div>
    </div>
  );
}
