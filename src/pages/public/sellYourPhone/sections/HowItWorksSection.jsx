import React from "react";
import { Banknote, ClipboardList, Smartphone, SquareDashedMousePointer } from "lucide-react";
import Container from "../../../../layout/Container";

const steps = [
  {
    icon: ClipboardList,
    iconClassName: "text-white",
    color: "bg-[#7DCDDD]",
    shadow: "shadow-[0px_1.85px_3px_#72EAFF03]",
    title: "Get A Quote",
    description:
      "Select your device model and condition to receive an instant quote online.",
    hasLine: true,
  },
  {
    icon: Smartphone,
    iconClassName: "text-white",
    color: "bg-[#4DDFFD]",
    shadow: "shadow-[0px_1.85px_3px_#4DDFFD03]",
    title: "Send Your Device",
    description:
      "Use our free postage service to send your phone safely to our facility.",
    hasLine: true,
  },
  {
    icon: SquareDashedMousePointer,
    iconClassName: "text-white",
    color: "bg-[#2E395B]",
    shadow: "shadow-[0px_1.85px_3px_#4F467403]",
    title: "Device Inspection",
    description:
      "Our experts carefully inspect your device and verify its condition.",
    hasLine: true,
  },
  {
    icon: Banknote,
    iconClassName: "text-white",
    color: "bg-[#0CA161]",
    shadow: "shadow-[0px_1.85px_3px_#0CA26103]",
    title: "Get Paid",
    description:
      "Receive payment within 24–48 hours after your device is inspected.",
    hasLine: false,
  },
];

const HowItWorksSection = () => {
  return (
    <section className="bg-[#FBFDFF] py-14 lg:py-20">
      <Container>
        <div className="text-center mb-10 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0A0A0A]">
            How it works?
          </h2>
        </div>

        {/* Desktop Layout - Perfectly Aligned */}
        <div className="hidden lg:grid grid-cols-4 w-full">
          {steps.map((step, idx) => {
            const Icon = step.icon;

            return (
              <div
                key={idx}
                className="relative flex flex-col items-center text-center px-2"
              >
                {step.hasLine && (
                  <div className="absolute top-10 left-[50%] w-full z-0 px-10 -translate-y-1/2">
                    <div className="w-full border-t-2 border-dashed border-[#7DCDDD]" />
                  </div>
                )}

                <div
                  className={`relative z-10 flex shrink-0 items-center justify-center ${step.color} w-20 h-20 rounded-[20px] ${step.shadow}`}
                >
                  <Icon
                    className={`w-6 h-6 ${step.iconClassName}`}
                    aria-hidden="true"
                  />
                </div>

                <h3 className="text-lg lg:text-[22px] font-bold text-black mt-8 mb-3">
                  {step.title}
                </h3>
                <p className="text-sm lg:text-base text-[#333333] max-w-65">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Mobile / Tablet Layout */}
        <div className="lg:hidden flex flex-col gap-8 max-w-md mx-auto">
          {steps.map((step, idx) => {
            const Icon = step.icon;

            return (
              <div key={idx} className="flex items-start gap-5">
                <div
                  className={`flex shrink-0 items-center justify-center ${step.color} p-5 rounded-2xl ${step.shadow}`}
                >
                  <Icon
                    className={`w-5 h-5 ${step.iconClassName}`}
                    aria-hidden="true"
                  />
                </div>
                <div className="flex flex-col pt-1">
                  <h3 className="text-lg sm:text-xl font-bold text-black mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#333333]">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

export default HowItWorksSection;
