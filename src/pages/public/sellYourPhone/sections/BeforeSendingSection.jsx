import React from "react";
import Container from "../../../../layout/Container";

const BeforeSendingSection = () => {
  const checklist = [
    "Back up all your personal data and photos",
    "Sign out of all accounts (iCloud, Google, etc.)",
    "Perform a factory reset to erase all data",
    "Remove SIM card and memory card if applicable",
    "Clean your device and include all original accessories",
    "Package securely to prevent damage during shipping",
  ];

  return (
    <section className="py-10 lg:py-16">
      <Container>
        <div className="rounded-2xl bg-white p-6 sm:p-10 lg:p-12 shadow-[0_1px_2px_rgba(0,0,0,0.1)] max-w-4xl mx-auto">
          <div className="text-center lg:text-left mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2E395B]">
              Before Sending Your Device
            </h2>
          </div>

          <div className="flex flex-col gap-3 mb-8">
            {checklist.map((item, idx) => (
              <div key={idx} className="flex items-start lg:items-center gap-3">
                <div className="bg-custom w-2 h-2 mt-1.5 lg:mt-0 rounded-full shrink-0" />
                <span className="text-[#2E395B] text-sm lg:text-base">
                  {item}
                </span>
              </div>
            ))}
          </div>

          <div>
            <p className="text-[#2E395B] text-xs sm:text-sm text-center lg:text-left">
              Please note: Zephyr Technology is not responsible for any data
              left on devices. Ensure all personal information is removed before
              sending.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default BeforeSendingSection;
