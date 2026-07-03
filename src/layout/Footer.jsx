import React from "react";
import logo from "../assets/logo.webp";
import Container from "./Container";
import { Link } from "react-router";
import { FaFacebookF, FaInstagram, FaWhatsapp, FaYoutube } from "react-icons/fa";
import { MdOutlineEmail, MdOutlinePhone } from "react-icons/md";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <div className="bg-[#EBECF0]">
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 py-10">
          {/* Brand */}
          <div className="sm:col-span-2 max-w-md">
            <img src={logo} className="w-36 mb-3" alt="Zephyr Technology" />
            {/* <p className="text-base text-[#6A6A6A] font-normal">
              Premium mobile technology solutions. From flagship new devices to certified refurbished phones.
            </p> */}
            <p className="text-base text-[#6A6A6A] font-normal">
              Zephyr Technology Is An Independent UK Retailer. Apple@ Is A Trademark Of Apple Inc. We Are Not
              Affiliated With Apple Unless Explicitly Stated.
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="https://www.instagram.com/zephyrtechnology"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full border border-black/20 flex items-center justify-center hover:bg-black/10 transition-colors"
              >
                <FaInstagram size={18} />
              </a>
              <a
                href="https://wa.me/447500990009"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-10 h-10 rounded-full border border-black/20 flex items-center justify-center hover:bg-black/10 transition-colors"
              >
                <FaWhatsapp size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h6 className="text-lg font-bold text-[#454545] mb-3">
              Quick Links
            </h6>
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                className="text-[#6A6A6A] text-base hover:underline text-left"
              >
                Home
              </Link>
              <Link
                to="/products"
                className="text-[#6A6A6A] text-base hover:underline text-left"
              >
                Products
              </Link>
              <Link
                to="/sell"
                className="text-[#6A6A6A] text-base hover:underline text-left"
              >
                Sell Your Phone
              </Link>
              <Link
                to="/contact"
                className="text-[#6A6A6A] text-base hover:underline text-left"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h6 className="text-lg font-bold text-[#454545] mb-3">Company</h6>
            <div className="flex flex-col gap-2">
              <Link
                to="/about-us"
                className="text-[#6A6A6A] text-base hover:underline text-left"
              >
                About
              </Link>
              <Link
                to="/for-businesses"
                className="text-[#6A6A6A] text-base hover:underline text-left"
              >
                For Businesses
              </Link>
              <Link
                to="/contact"
                className="text-[#6A6A6A] text-base hover:underline text-left"
              >
                Contact
              </Link>
              <Link
                to="/privacy-policy"
                className="text-[#6A6A6A] text-base hover:underline text-left"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-condition"
                className="text-[#6A6A6A] text-base hover:underline text-left"
              >
                Terms and conditions
              </Link>
              <Link
                to="/refund-policy"
                className="text-[#6A6A6A] text-base hover:underline text-left"
              >
                Refund Policy
              </Link>
              <Link
                to="/shipping-policy"
                className="text-[#6A6A6A] text-base hover:underline text-left"
              >
                Shipping Policy
              </Link>
            </div>
          </div>

          {/* Find Us */}
          <div>
            <h6 className="text-lg font-bold text-[#454545] mb-3">Find Us</h6>
            <p className="text-base text-[#6A6A6A]">
              ZEPHYR CORP LTD,
              <br />
              The Porter Building, Brunel Way,
              <br />
              Slough, England, SL1 1FQ
            </p>
            <div className="flex flex-col gap-2 mt-3">
              <a
                href="mailto:support@zephyrtechnology.co.uk"
                className="text-base text-[#6A6A6A] flex items-center gap-2 hover:underline"
              >
                <MdOutlineEmail size={20} />
                support@zephyrtechnology.co.uk
              </a>
              <a
                href="tel:+441753316031"
                className="text-base text-[#6A6A6A] flex items-center gap-2 hover:underline"
              >
                <MdOutlinePhone size={20} />
                44 1753 316031
              </a>
              <a
                href="https://wa.me/447500990009"
                target="_blank"
                rel="noopener noreferrer"
                className="text-base text-[#6A6A6A] flex items-center gap-2 hover:underline"
              >
                <FaWhatsapp size={20} />
                +44 7500 990009
              </a>
            </div>
          </div>
        </div>
        {/* Bottom bar */}
        <div className="border-t border-black/10 py-4 text-center text-sm text-[#6A6A6A]">
          © {currentYear} Zephyr Technology. All rights reserved.
        </div>
      </Container>
    </div>
  );
};

export default Footer;
