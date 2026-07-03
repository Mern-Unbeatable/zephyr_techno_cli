import React from "react";
import Container from "../../../../layout/Container";
import { Smartphone } from "lucide-react";
import { Link } from "react-router";

const CTASection = () => {
  return (
    <section className="py-14 sm:py-16 lg:py-20">
      <Container>
        <div className="bg-[#2E395B] rounded-3xl py-12 px-6 sm:px-10 lg:py-16 lg:px-20 flex flex-col items-center text-center gap-5 sm:gap-6 shadow-sm">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            Ready To Sell Your Device?
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-white/90">
            Get started with a fast online quote today.
          </p>
          <Link
            to={"/sell-your-phone"}
            className="mt-2 flex items-center bg-custom py-3 px-6 sm:py-3.5 sm:px-8 gap-2.5 rounded-lg border-0 cursor-pointer hover:brightness-110 transition-all duration-300 hover:scale-105"
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

export default CTASection;
