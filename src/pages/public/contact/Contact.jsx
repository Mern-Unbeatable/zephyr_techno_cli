import { useState } from "react";
import Swal from "sweetalert2";
import Container from "../../../layout/Container";

const Contact = () => {
  const [form, setForm] = useState({
    firstName: "",
    email: "",
    subject: "",
    phone: "",
    message: "",
  });
  const API_BASE_URL =
    import.meta.env.VITE_BASE_URL ||
    "https://api-zephyr-techno.maktechgroup.tech";
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const sanitizedPhone = value.replace(/[^\d+()\-\s]/g, "");
      setForm((s) => ({ ...s, [name]: sanitizedPhone }));
      return;
    }

    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        firstName: form.firstName,
        email: form.email,
        subject: form.subject,
        phone: form.phone,
        message: form.message,
      };

      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to send message");
      }

      await Swal.fire({
        icon: "success",
        title: "Message sent!",
        text: data.message || "Thank you for contacting us. We will get back to you soon.",
        showConfirmButton: true,
      });

      setForm({
        firstName: "",
        email: "",
        subject: "",
        phone: "",
        message: "",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Submission failed",
        text: err.message || "An error occurred. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Container>
        <div className=" max-w-7xl mx-auto py-10 md:pb-24">
          {/* ── Centered Header ── */}
          <div className="text-center mb-10 form-stagger">
            <h1 className="title-custom font-bold mb-3">We're here to help.</h1>
            <p className="subtitle-custom md:text-lg max-w-2xl mx-auto leading-relaxed">
              Our specialists are available around the clock to ensure your
              Zephyr experience
              <br className="hidden sm:block" />
              remains seamless and exceptional.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 justify-center items-stretch">
            {/* ── Form (Unchanged as requested) ── */}
            <div className="flex-1 max-w-3xl form-stagger">
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 sm:p-8 h-full">
                <h2 className="text-xl sm:text-2xl md:font-bold font-semibold text-[#151A2A] mb-6">
                  Send us a message
                </h2>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 form-stagger"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        type="text"
                        placeholder="John Doe"
                        className="w-full border border-[#BDC9CC] rounded px-4 py-2.5 text-sm text-[#151A2A] bg-white focus:outline-none focus:ring-2 focus:ring-cyan-300 transition-shadow"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        type="email"
                        placeholder="john@example.com"
                        className="w-full border border-[#BDC9CC] rounded px-4 py-2.5 text-sm text-[#151A2A] bg-white focus:outline-none focus:ring-2 focus:ring-cyan-300 transition-shadow"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone (Optional)
                      </label>
                      <input
                        name="phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        pattern="[0-9()+\\-\\s]*"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                        className="w-full border border-[#BDC9CC] rounded px-4 py-2.5 text-sm text-[#151A2A] bg-white focus:outline-none focus:ring-2 focus:ring-cyan-300 transition-shadow"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <select
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        className="w-full border border-[#BDC9CC] rounded px-4 py-2.5 text-sm text-[#151A2A] bg-white focus:outline-none focus:ring-2 focus:ring-cyan-300 transition-shadow cursor-pointer"
                        required
                      >
                        <option value="">Select a topic</option>
                        <option value="Technical Support">
                          Technical Support
                        </option>
                        <option value="Order Inquiry">Order Inquiry</option>
                        <option value="Returns & Refunds">
                          Returns & Refunds
                        </option>
                        <option value="Partnership">Partnership</option>
                        <option value="General Question">
                          General Question
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Tell us how we can help you..."
                      className="w-full border border-[#BDC9CC] rounded px-4 py-2.5 text-sm text-[#151A2A] bg-white focus:outline-none focus:ring-2 focus:ring-cyan-300 transition-shadow resize-y"
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-custom w-full sm:w-auto px-8 py-3 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {submitting ? "Sending..." : "Submit Message"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* ── RIGHT: Dark info panel ── */}
            <div className="w-full lg:w-72 xl:w-96 shrink-0 form-stagger">
              <div className="bg-[#1a2035] rounded-xl p-6 sm:p-7 h-full text-white">
                {/* Our Headquarters */}
                <div className="mb-5 sm:mb-6">
                  <h3 className="text-base lg:text-lg font-semibold text-white mb-2">
                    Our Headquarters
                  </h3>
                  <p className="text-sm text-[#EBECF0]/80">
                    ZEPHYR CORP LTD,
                    <br />
                    The Porter Building, Brunel Way, Slough, England, SL1 1FQ
                  </p>
                </div>

                {/* Contact Info */}
                <div className="mb-5 sm:mb-6">
                  <h3 className="text-base lg:text-lg font-semibold text-white mb-2">
                    Contact Info
                  </h3>
                  <p className="text-sm text-[#EBECF0]/80">
                    Email : support@zephyrtechnology.co.uk
                    <br />
                    Phone : 44 1753 316031
                  </p>
                </div>

                {/* Business Hours */}
                <div className="mb-5 sm:mb-6">
                  <h3 className="text-base lg:text-lg font-semibold text-white mb-2">
                    Business Hours
                  </h3>
                  <p className="text-sm text-[#EBECF0]/80 leading-relaxed">
                    Monday – Friday: 08:00 – 20:00 PST
                    <br />
                    Saturday – Sunday: 10:00 – 16:00 PST
                  </p>
                </div>

                {/* Direct Lines */}
                <div>
                  <h3 className="text-base lg:text-lg font-semibold text-white mb-3">
                    Direct Lines
                  </h3>

                  {/* WhatsApp link */}
                  <a
                    href="#"
                    className="flex items-center gap-2 text-sm text-custom hover:text-[#5bcde0] transition-colors mb-4 w-fit"
                  >
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    WhatsApp Support
                  </a>

                  {/* Icon buttons */}
                  <div className="flex gap-2">
                    {/* Share */}
                    <button className="w-9 h-9 rounded-lg border border-white/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/40 transition-all duration-200 cursor-pointer">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <circle cx="18" cy="5" r="3" />
                        <circle cx="6" cy="12" r="3" />
                        <circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                      </svg>
                    </button>
                    {/* Globe */}
                    <button className="w-9 h-9 rounded-lg border border-white/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/40 transition-all duration-200 cursor-pointer">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
                      </svg>
                    </button>
                    {/* Cog */}
                    <button className="w-9 h-9 rounded-lg border border-white/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/40 transition-all duration-200 cursor-pointer">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Contact;
