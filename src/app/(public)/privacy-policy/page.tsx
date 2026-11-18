import { BackButton } from '@/components/ui/back-button';
import { SCHOOL_NAME } from '@/lib/config';

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-16">
      <h1 className="mb-4 text-3xl font-bold text-fg">
        Privacy Policy
      </h1>

      <p className="mb-10 text-sm text-muted">
        Last Updated: November 2026
      </p>

      <div className="space-y-8 text-sm leading-8 text-muted">

        <section>
          <h2 className="mb-2 text-lg font-semibold text-fg">
            1. Introduction
          </h2>
          <p>
            {SCHOOL_NAME} respects the privacy of students,
            parents, teachers, and visitors. This policy explains
            how information may be collected and used through
            our website.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-fg">
            2. Information We Collect
          </h2>
          <p>
            Depending on the services used, we may collect
            information such as names, email addresses, phone
            numbers, and information submitted through admission
            or contact forms.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-fg">
            3. How We Use Information
          </h2>
          <p>
            Information may be used to process admission
            applications, respond to inquiries, communicate
            important notices, and provide school-related services.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-fg">
            4. Data Protection
          </h2>
          <p>
            We take reasonable measures to protect information
            against unauthorized access, alteration, disclosure,
            or destruction.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-fg">
            5. Information Sharing
          </h2>
          <p>
            Personal information is not intended to be publicly
            displayed. Information may be shared when necessary
            to provide school services or comply with applicable
            legal requirements.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-fg">
            6. Contact Us
          </h2>
          <p>
            If you have questions about this Privacy Policy,
            please contact the school administration.
          </p>
        </section>

      </div>
      <BackButton/>
    </main>
  );
}