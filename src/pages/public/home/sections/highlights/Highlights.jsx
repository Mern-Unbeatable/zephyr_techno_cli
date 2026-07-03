import React from "react";
import Container from "../../../../../layout/Container";

const features = [
  {
    id: 1,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5l4 4L19 6.5" />
      </svg>
    ),
    title: "Genuine Products",
    description: "Professionally checked devices with no hidden surprises.",
  },
  {
    id: 2,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 2.75l-6 8.25h4L10 21.25l7-10.25h-4L13 2.75z" />
      </svg>
    ),
    title: "Competitive Pricing",
    description: "Premium smartphones without unnecessary retail markups.",
  },
  {
    id: 3,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l7 3v5c0 5-3.58 9.74-7 11-3.42-1.26-7-6-7-11V5l7-3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12.5l1.75 1.75L15 10" />
      </svg>
    ),
    title: "Buy With Confidence",
    description: "Fast UK delivery, secure checkout, and customer-focused support.",
  },
];

export default function Highlights() {
  return (
    <section className="bg-white py-10 lg:py-16">
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        {features.map((f) => (
          <div
            key={f.id}
            className="card border border-[#EBECF0] bg-white rounded-2xl p-8
              transition-all duration-300 ease-out
              hover:scale-105 hover:border-custom cursor-default"
          >
            <div className="text-custom text-2xl mb-4">{f.icon}</div>
            <h3 className="text-base font-semibold text-[#171C1E] mb-2">{f.title}</h3>
            <p className="text-base max-w-62.5 text-[#6D797C] leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>
      </Container>
    </section>
  );
}