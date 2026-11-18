import { BackButton } from '@/components/ui/back-button';
import { SCHOOL_NAME } from '@/lib/config';

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-16">
      <h1 className="mb-4 text-3xl font-bold text-fg">
        Terms of Use
      </h1>

      <p className="mb-10 text-sm text-muted">
        Last Updated: November 2026
      </p>

      <div className="space-y-8 text-sm leading-8 text-muted">

        <section>
          <h2 className="mb-2 text-lg font-semibold text-fg">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using the {SCHOOL_NAME} website,
            you agree to comply with these Terms of Use.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-fg">
            2. Website Information
          </h2>
          <p>
            The information published on this website is intended
            for students, parents, teachers, and visitors.
            The school reserves the right to update or modify
            website content when necessary.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-fg">
            3. Acceptable Use
          </h2>
          <p>
            Users must not misuse the website, attempt unauthorized
            access, upload harmful content, or interfere with
            website functionality.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-fg">
            4. Intellectual Property
          </h2>
          <p>
            Website content, including text, images, logos, and
            materials, may not be reproduced or redistributed
            without appropriate permission.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-fg">
            5. External Links
          </h2>
          <p>
            This website may contain links to third-party websites.
            {` ${SCHOOL_NAME}`} is not responsible for their content
            or privacy practices.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-fg">
            6. Contact
          </h2>
          <p>
            For questions regarding these terms, please contact
            the school administration through our Contact Us page.
          </p>
        </section>
      </div>
      <BackButton/>
    </main>
  );
}