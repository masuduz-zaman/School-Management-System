import { BackButton } from "@/components/ui/back-button";

const faqs = [
  {
    question: 'How can I apply for admission?',
    answer:
      'Please visit the Admission page to learn about the admission process, eligibility, and required documents.',
  },
  {
    question: 'Where can I find school notices?',
    answer:
      'All published school notices, including examination, admission, and holiday notices, can be found on the Notice Board.',
  },
  {
    question: 'How can I contact the school?',
    answer:
      'You can find the official contact information on our Contact Us page.',
  },
  {
    question: 'Where can I find academic information?',
    answer:
      'Visit the Academics page for information about classes, subjects, routines, and examination systems.',
  },
  {
    question: 'Where can I see school activities?',
    answer:
      'Visit our Gallery page to explore photographs and activities from different school events.',
  },
];

export default function FAQPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-16">
      <h1 className="text-3xl font-bold text-fg">
        Frequently Asked Questions
      </h1>

      <p className="mb-10 mt-4 text-sm leading-7 text-muted">
        Find answers to common questions about our school,
        admission, academics, and other services.
      </p>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <section
            key={index}
            className="rounded-xl border border-border p-5"
          >
            <h2 className="mb-2 font-semibold text-fg">
              {faq.question}
            </h2>

            <p className="text-sm leading-7 text-muted">
              {faq.answer}
            </p>
          </section>
        ))}
      <BackButton/>
      </div>
    </main>
  );
}