import React from "react";
import Container from "../../../../layout/Container";
import { CheckCircle, Smartphone } from "lucide-react";
import HeroBg from "../../../../assets/sellBg.webp";
import { Link } from "react-router";

const HeroSection = () => {
  return (
    <section
      className="bg-cover bg-center py-16 sm:py-20 lg:py-28"
      style={{
        backgroundImage: `url(${HeroBg})`,
      }}
    >
      <Container>
        <div className="flex flex-col items-center text-center gap-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#2E395B] leading-tight">
            Sell Your Phone With Confidence
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-[#2E395B] max-w-2xl">
            Get a fast quote, fair grading, and payment within 24–48 hours after
            delivery with Zephyr Technology.
          </p>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:flex lg:items-center lg:justify-center lg:gap-8">
          {[
            "Fast UK Payments",
            "Competitive Market Pricing",
            "Free Returns On Revised Offers",
            "Trusted UK Mobile Retailer",
          ].map((label, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-custom shrink-0" />
              <span className="text-[#2E395B] text-xs sm:text-sm lg:text-base">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-10 flex justify-center">
          <Link
            to={"/sell-worth"}
            className="flex items-center bg-custom py-3 px-6 sm:py-3.5 sm:px-8 gap-2.5 rounded-lg border-0 cursor-pointer hover:brightness-110 transition-all duration-300 hover:scale-105"
          >
            <Smartphone className="w-5 h-5 text-white" />
            <span className="text-white text-sm sm:text-base font-bold">
              Sell Your Phone Now
            </span>
          </Link>
        </div>
      </Container>
    </section>
  );
};

export default HeroSection;
