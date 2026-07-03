import React from "react";
import banner from "../../../../../../src/assets/banner/hero.webp";
import mobileBanner from "../../../../../../src/assets/banner/mobilebanner3.png";
import { Link } from "react-router";
import Container from "../../../../../layout/Container";

const Hero = () => {
  return (
    <section className="pt-4 pb-6">
      <Container>
        <div className="overflow-hidden rounded-2xl">
          <div className="sm:hidden">
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src={mobileBanner}
                className="w-full h-64 object-fit"
                alt="Mobile hero banner"
              />
              <div className="absolute bottom-[26%] left-[5%]">
                <Link
                  to="/products"
                  className="inline-flex items-center rounded-lg bg-custom px-5 py-2 text-xs font-semibold text-white hover:brightness-110 cursor-pointer hover:scale-105 transform transition-all duration-300"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>

          <div className="relative hidden sm:block">
            <img
              src={banner}
              className="w-full xl:h-[55vh] h-full xl:object-cover"
              alt="Hero Banner"
            />
            <div className="absolute inset-0 bg-linear-to-r from-black/45 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-start">
              <div className="h-full flex items-center">
                <div className="w-full px-6 sm:px-10 lg:pl-12 xl:pl-22 text-white">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold uppercase tracking-wide drop-shadow leading-tight neon-flicker">
                    Buy New & Used
                    <span className="block mt-2">Smart Phones</span>
                    <span className="block mt-3 xl:mt-5 text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-semibold">
                      At the Best Prices
                    </span>
                  </h1>
                  <div className="mt-6 xl:mt-10 flex flex-wrap gap-3">
                    <Link
                      to="/products"
                      className="inline-flex items-center rounded-lg bg-custom px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 cursor-pointer hover:scale-105 transform transition-all duration-300"
                    >
                      Shop Now
                    </Link>
                    <Link
                      to="/sell"
                      className="inline-flex items-center rounded-lg border border-white/60 bg-black/15 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 cursor-pointer hover:scale-105 transform transition-all duration-300"
                    >
                      Sell Your Phone
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
