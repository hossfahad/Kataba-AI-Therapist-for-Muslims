'use client';

import { useState, useEffect, useRef } from 'react';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/lib/hooks/useLanguage';

interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

const faqItems: FaqItem[] = [
  {
    question: "What is Kataba?",
    answer: (
      <p>
        Kataba (<em>كَتَبَ</em>) means "to write" in Arabic. In the Islamic tradition, writing is a means of reflection, seeking clarity, and deepening one's connection to the <em>Deen</em>. Kataba is your AI therapeutic companion, designed to provide thoughtful, judgment-free support through conversation—whether you need to express your thoughts, seek guidance, or reflect on life's journey.
      </p>
    ),
  },
  {
    question: "Is Kataba a replacement for therapy?",
    answer: (
      <p>
        No, Kataba is not a licensed therapist or a substitute for professional mental health services. Instead, it offers a space for reflection, journaling, and guided self-discovery, integrating Islamic wisdom with modern AI to support your emotional and spiritual well-being.
      </p>
    ),
  },
  {
    question: "How does Kataba ensure privacy?",
    answer: (
      <p>
        Your conversations are completely private and are <strong>never used for training AI models or shared with third parties</strong>. You can pick up where you left off at any time, and your data remains secure and confidential.
      </p>
    ),
  },
  {
    question: "Can I use Kataba if I'm not Muslim?",
    answer: (
      <p>
        Absolutely! While Kataba is inspired by Islamic principles of <em>tazkiyah</em> (self-purification) and <em>fikr</em> (reflection), it is open to anyone seeking a mindful and intentional space for self-expression.
      </p>
    ),
  },
  {
    question: "What can I talk about with Kataba?",
    answer: (
      <div className="space-y-2">
        <p>
          Kataba is your <strong>judgment-free AI companion</strong>, designed for self-reflection and support. You can talk about:
        </p>
        <ul className="list-disc pl-6">
          <li><strong>Personal struggles & emotions</strong> – Process thoughts in a private space.</li>
          <li><strong>Marriage & relationships</strong> – Navigate challenges with <em>rahma</em> and <em>sabr</em>.</li>
          <li><strong>Family & social matters</strong> – Strengthen bonds and resolve conflicts.</li>
          <li><strong>Faith & spirituality</strong> – Deepen your connection to <em>deen</em> and mindfulness.</li>
          <li><strong>Daily stress & clarity</strong> – Unwind and gain perspective.</li>
        </ul>
        <p>Kataba is here for <strong>any conversation that helps you reflect, grow, and find peace</strong>.</p>
      </div>
    ),
  },
  {
    question: "Does Kataba offer religious advice or fatwas?",
    answer: (
      <p>
        No, Kataba is not a religious authority and does not issue fatwas. While it incorporates Islamic values and therapeutic principles, it is designed for reflection and emotional support rather than providing religious rulings. In the future, we plan to incorporate references to the Qur'an and authentic Hadith.
      </p>
    ),
  },
  {
    question: "Is Kataba available in languages other than English?",
    answer: (
      <p>
        Currently, Kataba primarily supports English, but we are working on expanding language support to Spanish, French, Russian, Japanese, and Arabic.
      </p>
    ),
  },
  {
    question: "How does Kataba generate responses?",
    answer: (
      <div className="space-y-2">
        <p>
          Kataba is built on <strong>Islamic counseling principles</strong>, ensuring responses are ethical, empathetic, and spiritually aligned.
        </p>
        <ul className="list-disc pl-6">
          <li><strong>Faith-Based Approach</strong> – Inspired by Islamic therapy, marriage, and family counseling.</li>
          <li><strong>Ethical & Culturally Aware AI</strong> – Grounded in <em>rahma</em>, <em>sabr</em>, and self-improvement.</li>
          <li><strong>Personalized Conversations</strong> – Picks up where you left off for continuous reflection.</li>
        </ul>
        <p>Unlike generic AI chatbots, Kataba is designed for Muslims seeking <strong>support, clarity, and guidance in a faith-centered way</strong>.</p>
      </div>
    ),
  },
  {
    question: "How does Kataba compare to other AI companions?",
    answer: (
      <p>
        Unlike generic AI chatbots, Kataba is built with a focus on <strong>spiritual and emotional well-being</strong>, incorporating an understanding of Islamic ethics, values, and mental health principles. It's designed to be a <strong>companion on your journey</strong>, not just a conversation tool.
      </p>
    ),
  },
  {
    question: "Can I delete my data?",
    answer: (
      <p>
        Yes. You can delete your data at any time through your account settings. We respect your privacy and give you full control over your information.
      </p>
    ),
  },
];

const FaqItem = ({ item, isOpen, toggleOpen }: { item: FaqItem; isOpen: boolean; toggleOpen: () => void }) => {
  return (
    <div className="faq-item border-b border-gray-100 py-4">
      <button
        onClick={toggleOpen}
        className="faq-question-button w-full flex justify-between items-center text-left focus:outline-none"
        aria-expanded={isOpen}
      >
        <h3 className="faq-question text-lg font-light text-gray-800">{item.question}</h3>
        <span className={`ml-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-teal-500"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="faq-answer mt-3 text-gray-600 text-sm font-light leading-relaxed">
          {item.answer}
        </div>
      )}
    </div>
  );
};

export const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { isRTL, exemptFromRTL } = useLanguage();
  const faqRef = useRef<HTMLElement>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Force LTR for FAQ section regardless of site language
  useEffect(() => {
    if (faqRef.current) {
      faqRef.current.dir = 'ltr';
      
      // For RTL languages, explicitly set all FAQ elements to LTR
      if (isRTL) {
        exemptFromRTL('#faq, #faq *, .faq-item, .faq-question, .faq-answer');
      }
    }
  }, [isRTL, exemptFromRTL]);

  return (
    <section 
      id="faq" 
      ref={faqRef}
      className="faq-section py-12"
      dir="ltr" // Explicitly set direction to LTR
      data-section="faq" // Add a data attribute for targeting in CSS
    >
      <div className="faq-content max-w-4xl mx-auto px-4">
        <h2 className="faq-heading text-2xl font-light text-gray-800 mb-8 text-center">Frequently Asked Questions</h2>
        <div className="faq-container bg-white rounded-lg shadow-sm p-6">
          {faqItems.map((item, index) => (
            <FaqItem
              key={index}
              item={item}
              isOpen={openIndex === index}
              toggleOpen={() => toggleFaq(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}; 