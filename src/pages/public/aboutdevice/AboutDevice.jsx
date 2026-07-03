import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  CheckCircle,
  Sparkles,
  PenLine,
  ArrowRight,
  Medal,
  ThumbsUp,
  Wrench,
} from "lucide-react";
import Container from "../../../layout/Container";

const conditions = [
  {
    id: "brand-new",
    title: "Brand New (sealed)",
    icon: <Sparkles className="w-6 h-6 mb-4" strokeWidth={1.5} />,
    bullets: [
      "Original factory seal intact",
      "Never opened or activated",
      "Brand new condition",
    ],
    color: "custom",
  },
  {
    id: "excellent",
    title: "Excellent",
    icon: <Medal className="w-6 h-6 mb-4" strokeWidth={1.5} />,
    bullets: [
      "Fully working with no faults",
      "Minimal signs of use",
      "No scratches or dents",
    ],
    color: "custom",
  },
  {
    id: "good",
    title: "Good",
    icon: <ThumbsUp className="w-6 h-6 mb-4" strokeWidth={1.5} />,
    bullets: [
      "Fully working device",
      "Visible signs of use",
      "Minor scratches or marks",
    ],
    color: "custom",
  },
  {
    id: "broken",
    title: "Broken/Faulty",
    icon: <Wrench className="w-6 h-6 mb-4" strokeWidth={1.5} />,
    bullets: [
      "Device has faults or damage",
      "Cracked screen or housing possible",
      "Battery or charging issues possible",
    ],
    color: "red-500",
  },
];

const STORAGE_KEY = 'sellFlow';

const AboutDevice = () => {
  const [selectedCondition, setSelectedCondition] = useState("excellent");
  const [apiConditions, setApiConditions] = useState([]);
  const [device, setDevice] = useState(null);
  const [price, setPrice] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDevice(JSON.parse(raw));
    } catch (e) {}

    const fetchConditions = async () => {
      try {
        const base = import.meta.env.VITE_BASE_URL || '';
        const res = await fetch(`${base}/api/sell/conditions`);
        const json = await res.json();
        if (json?.success && Array.isArray(json.data)) setApiConditions(json.data);
      } catch (e) {
        // ignore
      }
    };

    fetchConditions();
  }, []);

  useEffect(() => {
    const fetchPrice = async () => {
      if (!selectedCondition || !device?.deviceModelId) return;
      try {
        const base = import.meta.env.VITE_BASE_URL || '';
        const res = await fetch(`${base}/api/sell/price?conditionId=${selectedCondition}&deviceModelId=${device.deviceModelId}`);
        const json = await res.json();
        if (json?.success && json.data && json.data.price) {
          setPrice(json.data.price);
          const updated = { ...device, conditionId: selectedCondition, baseOfferPrice: json.data.price };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
      } catch (e) {}
    };

    fetchPrice();
  }, [selectedCondition, device]);

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

            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full bg-[#006878] text-white flex items-center justify-center text-xs sm:text-sm font-bold">
                2
              </div>
              <span className="text-[11px] sm:text-sm font-semibold text-[#171C1E] leading-tight">
                Condition
              </span>
            </div>

            <div className="h-px flex-1 min-w-2 max-w-6 sm:flex-none sm:w-12 bg-[#BDC9CC] mx-0.5 sm:mx-2" />

            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 opacity-50">
              <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full bg-[#DFE3E5] text-[#3D494C] flex items-center justify-center text-xs sm:text-sm font-bold">
                3
              </div>
              <span className="text-[11px] sm:text-sm font-semibold text-[#171C1E] leading-tight">
                Summary
              </span>
            </div>
          </div>
        </div>

        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#171C1E] mb-4 leading-tight">
            Tell us about your device
          </h1>
          <p className="text-[#3D494C] text-sm md:text-base">
            Select your category to begin. We offer the UK's most competitive rates for
            <br className="hidden md:block" /> premium consumer electronics.
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-12">
          {/* Selected Device Banner */}
          <div className="bg-white border border-[#BDC9CC4D] rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between shadow-sm gap-4">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center p-2">
                <img
                  src="/Device_Preview.png"
                  alt={device?.deviceName || 'Device'}
                  className="object-contain h-full w-full"
                />
              </div>
              <h2 className="text-xl font-bold text-[#171C1E]">{device?.deviceName || 'Select Device'}</h2>
            </div>
            <Link to="/sell-worth" className="flex items-center gap-2 text-custom font-bold text-sm hover:underline cursor-pointer">
              Change
              <PenLine className="w-4 h-4" />
            </Link>
          </div>

          {/* Condition Selection */}
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-[#171C1E] mb-6">What is the condition?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(apiConditions.length ? apiConditions : conditions).map((cond) => {
                const id = cond.id;
                const name = cond.name || cond.title;
                const isActive = selectedCondition === id;
                const isBroken = (cond.name && cond.name.toLowerCase().includes('broken')) || id === 'broken';

                let borderClass = "border-[#BDC9CC] hover:border-custom";
                let bgClass = "bg-white";
                let textIconClass = "text-gray-500";

                if (isActive) {
                  if (isBroken) {
                    borderClass = "border-red-500 border-2";
                    textIconClass = "text-red-500";
                  } else {
                    borderClass = "border-custom border-2";
                    textIconClass = "text-custom";
                  }
                } else if (isBroken) {
                  borderClass = "border-[#D98F90] hover:border-red-500";
                  bgClass = "bg-[#FEFAFA]";
                }

                return (
                  <div
                    key={id}
                    onClick={() => setSelectedCondition(id)}
                    className={`relative rounded-xl p-6 border transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col ${bgClass} ${borderClass}`}
                  >
                    {isActive && !isBroken && (
                      <div className="absolute top-4 right-4 text-custom">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    )}

                    <div className={isActive ? textIconClass : "text-gray-500"}>
                      {/* show static icon if present */}
                      {cond.icon || null}
                    </div>

                    <h4 className="text-sm font-bold text-[#171C1E] mb-4">{name}</h4>

                    <ul className="space-y-3 mt-auto">
                      <li className="text-sm text-[#3D494C] leading-tight">Select this condition to get an estimated price.</li>
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quote Section */}
          <div className="relative bg-white rounded-2xl border border-[#BDC9CC33] shadow-sm overflow-hidden p-8 sm:p-12 text-center mt-16">
            {/* Decorative background blobs */}
            <div className="absolute top-0 left-0 w-64 h-40 bg-[#88EDFC] opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#88EDFC] opacity-10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

            <div className="relative z-10 max-w-2xl mx-auto">
              <p className="text-xs font-bold text-[#6D797C] mb-3 uppercase tracking-wide">
                Your Estimated Quote
              </p>
              <div className="text-4xl sm:text-5xl text-custom font-light mb-4">
                {price ? `£${price}` : '—'}
              </div>
              <p className="text-[#3D494C] text-sm mb-6 max-w-md mx-auto">
                This price is locked for 7 days. We'll verify the condition upon
                arrival and pay you within 24 hours.
              </p>

              <Link to={"/finalize-sale"} className="inline-flex items-center gap-2 bg-custom text-white font-bold py-3 px-6 text-sm md:text-base rounded-lg hover:brightness-110 transition-all shadow-md cursor-pointer">
                Next Step: Handover
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default AboutDevice;
