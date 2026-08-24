export interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export const faqs: FAQ[] = [
  {
    id: 1,
    question: "How do I buy a ticket?",
    answer:
      "Choose an event, click Get Ticket and complete your payment securely.",
  },
  {
    id: 2,
    question: "Is my ticket refundable?",
    answer:
      "Refunds depend on the organizer's refund policy shown before checkout.",
  },
  {
    id: 3,
    question: "How will I receive my ticket?",
    answer:
      "Your ticket is delivered instantly to your email after payment.",
  },
  {
    id: 4,
    question: "Can I create an event for free?",
    answer:
      "Yes. Creating an event is free. Charges apply only when you sell paid tickets.",
  },
  {
    id: 5,
    question: "How much does Teeket charge?",
    answer:
      "We charge 7.5% plus processing fees for paid tickets and 0% for free tickets.",
  },
  {
    id: 6,
    question: "What happens if an event is cancelled?",
    answer:
      "If the organizer cancels the event, attendees will be notified and refunds will follow the organizer's refund policy.",
  },
];