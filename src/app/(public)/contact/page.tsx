import { SCHOOL_NAME } from '@/lib/config';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-16">
      <div className="mb-10">
        <p className="mb-3 text-sm font-semibold text-primary">
          GET IN TOUCH
        </p>

        <h1 className="text-3xl font-bold text-fg">
          Contact Us
        </h1>

        <p className="mt-4 leading-8 text-muted">
          Have questions or need assistance? Contact the
          administration of {SCHOOL_NAME}.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-border p-6">
          <h2 className="mb-3 font-semibold text-fg">
            School Address
          </h2>
          <p className="text-sm leading-7 text-muted">
            School address will be displayed here.
          </p>
        </div>

        <div className="rounded-xl border border-border p-6">
          <h2 className="mb-3 font-semibold text-fg">
            Phone Number
          </h2>
          <p className="text-sm text-muted">
            Contact number will be displayed here.
          </p>
        </div>

        <div className="rounded-xl border border-border p-6">
          <h2 className="mb-3 font-semibold text-fg">
            Email Address
          </h2>
          <p className="text-sm text-muted">
            Official email will be displayed here.
          </p>
        </div>

        <div className="rounded-xl border border-border p-6">
          <h2 className="mb-3 font-semibold text-fg">
            Office Hours
          </h2>
          <p className="text-sm text-muted">
            School office hours will be displayed here.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-xl bg-muted/20 p-6">
        <h2 className="mb-3 font-semibold text-fg">
          Need More Information?
        </h2>
        <p className="mb-4 text-sm text-muted">
          For admission, academic information, or other inquiries,
          please contact our school administration.
        </p>
        <Link
          href="/"
          className="text-sm font-semibold text-primary hover:underline"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}