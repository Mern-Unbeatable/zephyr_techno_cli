import React, { useEffect, useState } from "react";
import { Package, Truck } from "lucide-react";
import Swal from 'sweetalert2';
import Container from "../../../layout/Container";

const STORAGE_KEY = 'sellFlow';

const FinalizeSale = () => {
  const [formData, setFormData] = useState({ fullName: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [flow, setFlow] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setFlow(JSON.parse(raw));
    } catch (e) {}
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const sanitized = value.replace(/[^\d+()\-\s]/g, '');
      setFormData((prev) => ({ ...prev, [name]: sanitized }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!flow) return Swal.fire({ icon: 'error', title: 'Missing device', text: 'Please start the sell flow again.' });
    setSubmitting(true);
    try {
      const base = import.meta.env.VITE_BASE_URL || '';
      const body = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        deviceName: flow.deviceName,
        deviceModelId: flow.deviceModelId,
        conditionId: flow.conditionId,
        baseOfferPrice: parseFloat(flow.baseOfferPrice) || undefined,
      };

      const res = await fetch(`${base}/api/sell/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || 'Request failed');

      Swal.fire({ icon: 'success', title: json.message || 'Submitted' });
      localStorage.removeItem(STORAGE_KEY);
      setFormData({ fullName: '', email: '', phone: '' });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Submission failed', text: err.message || 'Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FBFDFF] min-h-screen py-10 lg:py-16">
      <Container>
        {/* Step Indicator */}
        <div className="mb-12 w-full max-w-xl sm:max-w-none mx-auto px-1 sm:px-0">
          <div className="flex items-center justify-between sm:justify-center gap-1 sm:gap-4">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 opacity-80">
              <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full bg-[#006878] text-white flex items-center justify-center text-xs sm:text-sm font-bold">
                1
              </div>
              <span className="text-[11px] sm:text-sm font-semibold text-[#171C1E] leading-tight">
                Device Details
              </span>
            </div>

            <div className="h-px flex-1 min-w-2 max-w-6 sm:flex-none sm:w-12 bg-[#006878] mx-0.5 sm:mx-2" />

            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 opacity-80">
              <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full bg-[#006878] text-white flex items-center justify-center text-xs sm:text-sm font-bold">
                2
              </div>
              <span className="text-[11px] sm:text-sm font-semibold text-[#171C1E] leading-tight">
                Condition
              </span>
            </div>

            <div className="h-px flex-1 min-w-2 max-w-6 sm:flex-none sm:w-12 bg-[#006878] mx-0.5 sm:mx-2" />

            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full bg-[#006878] text-white flex items-center justify-center text-xs sm:text-sm font-bold">
                3
              </div>
              <span className="text-[11px] sm:text-sm font-semibold text-[#171C1E] leading-tight">
                Summary
              </span>
            </div>
          </div>
        </div>

        {/* Header Content */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-3xl md:text-5xl lg:text-[56px] font-bold text-[#171C1E] mb-6 leading-tight">
            Finalize Your Sale
          </h1>
          <p className="text-[#3D494C] text-base md:text-lg">
            Complete your details to secure your trade-in price of {flow?.baseOfferPrice ? `£${flow.baseOfferPrice}` : '—'}.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Your Details */}
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-medium text-[#171C1E]">
                Your Details
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-[#6D797C] mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. James Wilson"
                    className="w-full bg-white border border-[#BDC9CC] rounded-lg py-4 px-5 text-[#171C1E] outline-none focus:border-custom focus:ring-1 focus:ring-custom transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-[#6D797C] mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="james@example.com"
                      className="w-full bg-white border border-[#BDC9CC] rounded-lg py-4 px-5 text-[#171C1E] outline-none focus:border-custom focus:ring-1 focus:ring-custom transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#6D797C] mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      inputMode="tel"
                      autoComplete="tel"
                      pattern="[0-9()+\-\s]*"
                      placeholder="07123 456789"
                      className="w-full bg-white border border-[#BDC9CC] rounded-lg py-4 px-5 text-[#171C1E] outline-none focus:border-custom focus:ring-1 focus:ring-custom transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Handover Method */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Truck className="w-6 h-6 text-custom" />
                <h2 className="text-xl sm:text-2xl font-bold text-[#171C1E]">
                  Handover Method
                </h2>
              </div>

              <div className="w-full bg-white border border-[#BDC9CC] rounded-xl p-8 sm:p-12 flex flex-col items-center justify-center cursor-default hover:border-custom hover:shadow-sm transition-all duration-300">
                <Package
                  className="w-10 h-10 text-gray-500 mb-4"
                  strokeWidth={1.5}
                />
                <h3 className="text-base font-bold text-[#171C1E] mb-2">
                  Send via Courier
                </h3>
                <p className="text-sm text-[#6D797C] text-center">
                  Free fully-insured shipping kit provided.
                </p>
              </div>
            </div>

            {/* Submit Section */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-custom text-white text-lg font-semibold py-4 px-8 rounded-lg hover:brightness-110 transition-all duration-300 shadow-md mb-4 cursor-pointer"
              >
                Submit Request
              </button>
              <p className="text-center text-[#6D797C] text-xs">
                By clicking confirm, you agree to our Terms of Sale and Privacy
                Policy.
              </p>
            </div>
          </form>
        </div>
      </Container>
    </div>
  );
};

export default FinalizeSale;
