import React from "react";
import Container from "../../../../layout/Container";

const OurPromiseSection = () => {
  return (
    <section className="bg-white py-12 lg:py-20">
      <Container>
        <div className="grid items-start gap-6 lg:grid-cols-[auto_1fr] lg:gap-16">
          <span className="text-sm font-bold uppercase tracking-wide text-custom">
            Our Promise
          </span>
          <div className="space-y-5">
            <p className="text-sm sm:text-base lg:text-lg leading-7 lg:leading-8 text-[#2E395B]">
              At Zephyr Technology, we believe in making the mobile trade-in
              process simple, transparent, and trustworthy. We've built our
              service around fairness, speed, and reliability, ensuring you
              receive competitive market value for your device without hidden
              fees or unexpected surprises.
            </p>
            <p className="text-sm sm:text-base lg:text-lg leading-7 lg:leading-8 text-[#2E395B]">
              Whether you're upgrading to the latest model or simply looking to
              trade in an old device, we're committed to providing a seamless
              experience from quote to payment. Your satisfaction is our
              priority, and we stand behind every valuation we make.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default OurPromiseSection;
