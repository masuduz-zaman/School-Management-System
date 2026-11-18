import { BackButton } from '@/components/ui/back-button';
import { SCHOOL_NAME } from '@/lib/config';

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-16">
        
      <div className="mb-10">
        <p className="mb-3 text-sm font-semibold text-primary">
          ABOUT OUR INSTITUTION
        </p>

        <h1 className="text-3xl font-bold text-fg md:text-4xl">
          About {SCHOOL_NAME}
        </h1>

        <p className="mt-4 max-w-3xl leading-8 text-muted">
          Welcome to {SCHOOL_NAME}. Our institution is dedicated
          to providing quality education and creating an environment
          where students can learn, grow, and succeed.
        </p>
      </div>

      <section className="space-y-8">
        <div>
          <h2 className="mb-3 text-xl font-semibold text-fg">
            Our Mission
          </h2>
          <p className="leading-8 text-muted">
            To provide quality education, develop critical thinking,
            encourage creativity, and build responsible citizens.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-xl font-semibold text-fg">
            Our Vision
          </h2>
          <p className="leading-8 text-muted">
            To become a center of excellence where every student
            receives the opportunity to achieve their full potential.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-xl font-semibold text-fg">
            Our Commitment
          </h2>
          <p className="leading-8 text-muted">
            We are committed to maintaining a supportive learning
            environment, encouraging academic excellence, and
            promoting discipline and moral values.
          </p>
        </div>
      </section>
      <BackButton/>
    </main>
  );
}