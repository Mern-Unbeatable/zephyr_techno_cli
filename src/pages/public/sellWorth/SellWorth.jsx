// import React, { useEffect, useRef, useState } from "react";
// import { ChevronDown } from "lucide-react";
// import Container from "../../../layout/Container";
// import { Link } from "react-router";

// const STORAGE_KEY = "sellFlow";

// const SellWorth = () => {
//   const [series, setSeries] = useState([]);
//   const [models, setModels] = useState([]);
//   const [selectedSeries, setSelectedSeries] = useState(null);
//   const [selectedModel, setSelectedModel] = useState(null);
//   const [loadingSeries, setLoadingSeries] = useState(false);
//   const [loadingModels, setLoadingModels] = useState(false);
//   const [showModels, setShowModels] = useState(false);
//   const modelsRef = useRef(null);

//   useEffect(() => {
//     // clear previous flow
//     try {
//       localStorage.removeItem(STORAGE_KEY);
//     } catch (e) {}

//     const fetchSeries = async () => {
//       setLoadingSeries(true);
//       try {
//         const base = import.meta.env.VITE_BASE_URL || "";
//         const res = await fetch(`${base}/api/sell/series`);
//         const json = await res.json();
//         if (json?.success && Array.isArray(json.data)) setSeries(json.data);
//       } catch (e) {}
//       setLoadingSeries(false);
//     };

//     fetchSeries();
//   }, []);

//   const handleSelectSeries = async (s) => {
//     setSelectedSeries(s);
//     setSelectedModel(null);
//     setModels([]);
//     setLoadingModels(true);
//     try {
//       const base = import.meta.env.VITE_BASE_URL || "";
//       const res = await fetch(`${base}/api/sell/models?seriesId=${s.id}`);
//       const json = await res.json();
//       if (json?.success && Array.isArray(json.data)) setModels(json.data);
//     } catch (e) {}
//     setLoadingModels(false);
//   };

//   const onRevealPrice = () => {
//     if (!selectedModel || !selectedSeries) return;
//     const payload = {
//       seriesId: selectedSeries.id,
//       seriesName: selectedSeries.name,
//       deviceModelId: selectedModel.id,
//       deviceName: selectedModel.name,
//     };
//     try {
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
//     } catch (e) {}
//   };

//   // close model list when clicking outside
//   useEffect(() => {
//     const onDocClick = (e) => {
//       if (modelsRef.current && !modelsRef.current.contains(e.target))
//         setShowModels(false);
//     };
//     document.addEventListener("click", onDocClick);
//     return () => document.removeEventListener("click", onDocClick);
//   }, []);

//   return (
//     <div className="bg-[#FBFDFF] min-h-screen py-10 lg:py-16">
//       <Container>
//         {/* Step Indicator */}
//         <div className="flex items-center justify-center mb-12 overflow-x-auto pb-4 sm:pb-0">
//           <div className="flex items-center gap-2 sm:gap-4 whitespace-nowrap">
//             {/* Step 1 */}
//             <div className="flex items-center gap-2">
//               <div className="w-8 h-8 rounded-full bg-[#006878] text-white flex items-center justify-center text-sm font-bold">
//                 1
//               </div>
//               <span className="text-[#171C1E] text-sm font-semibold">
//                 Device Details
//               </span>
//             </div>
//             <div className="w-8 sm:w-12 h-px bg-[#BDC9CC] mx-1 sm:mx-2"></div>
//             {/* Step 2 */}
//             <div className="flex items-center gap-2">
//               <div className="w-8 h-8 rounded-full bg-[#DFE3E5] text-[#3D494C] flex items-center justify-center text-sm font-bold">
//                 2
//               </div>
//               <span className="text-[#8D9A9D] text-sm">Condition</span>
//             </div>
//             <div className="w-8 sm:w-12 h-px bg-[#BDC9CC] mx-1 sm:mx-2"></div>
//             {/* Step 3 */}
//             <div className="flex items-center gap-2">
//               <div className="w-8 h-8 rounded-full bg-[#DFE3E5] text-[#3D494C] flex items-center justify-center text-sm font-bold">
//                 3
//               </div>
//               <span className="text-[#8D9A9D] text-sm">Summary</span>
//             </div>
//           </div>
//         </div>

//         {/* Header Content */}
//         <div className="text-center max-w-3xl mx-auto mb-12">
//           <h1 className="text-3xl md:text-5xl lg:text-[56px] font-bold text-[#171C1E] mb-6 leading-tight">
//             How much is your device worth?
//           </h1>
//           <p className="text-[#3D494C] text-base md:text-lg">
//             Select your category to begin. We offer the UK's most competitive
//             rates for premium consumer electronics.
//           </p>
//         </div>

//         {/* Series */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
//           {loadingSeries && (
//             <div className="col-span-3 text-center">Loading series...</div>
//           )}
//           {!loadingSeries &&
//             series.map((s) => (
//               <button
//                 key={s.id}
//                 onClick={() => handleSelectSeries(s)}
//                 className={`flex flex-col items-center justify-center py-8 rounded-xl border-2 transition-all duration-300 ${
//                   selectedSeries?.id === s.id
//                     ? "border-custom bg-[#F0F4F6] shadow-sm"
//                     : "border-transparent bg-[#F0F4F6] hover:border-gray-300"
//                 }`}
//               >
//                 <div className=" w-20 h-20 flex items-center justify-center mb-4  overflow-hidden">
//                   {s.image ? (
//                     <img
//                       src={s.image}
//                       alt={s.name}
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <span className="text-sm font-semibold">
//                       {s.name?.[0] ?? "?"}
//                     </span>
//                   )}
//                 </div>
//                 <span className="text-[#2E395B] text-xl font-medium">
//                   {s.name}
//                 </span>
//               </button>
//             ))}
//         </div>

//         {/* Model Selection */}
//         <div className="max-w-2xl mx-auto mb-10">
//           <label className="block text-xs font-bold text-[#3D494C] mb-3 uppercase tracking-wide">
//             SELECT YOUR MODEL
//           </label>
//           <div className="relative" ref={modelsRef}>
//             <button
//               type="button"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setShowModels((s) => !s);
//               }}
//               className="w-full text-left bg-white border border-[#BDC9CC] rounded-lg py-4 px-6 text-[#171C1E] text-base outline-none hover:border-custom transition-colors flex items-center justify-between"
//             >
//               <span>{selectedModel?.name || "Select a device"}</span>
//               <ChevronDown
//                 className={`w-6 h-6 text-gray-400 transition-transform ${showModels ? "rotate-180" : ""}`}
//               />
//             </button>

//             {showModels && (
//               <div
//                 className="absolute z-30 left-0 right-0 mt-2 rounded-2xl shadow-2xl overflow-hidden max-w-[70%] mx-auto"
//                 style={{ background: "#464644" }}
//               >
//                 <div className="max-h-80 overflow-y-auto">
//                   {loadingModels && (
//                     <div className="px-5 py-4 text-center text-gray-300 text-[15px]">
//                       Loading models...
//                     </div>
//                   )}
//                   {!loadingModels && models.length === 0 && (
//                     <div className="px-5 py-4 text-center text-gray-400 text-[15px]">
//                       No models found
//                     </div>
//                   )}
//                   {!loadingModels &&
//                     models.map((m, index) => (
//                       <button
//                         key={m.id}
//                         onClick={() => {
//                           setSelectedModel(m);
//                           setShowModels(false);
//                         }}
//                         className="w-full text-left px-5 py-[14px] flex items-center gap-3 transition-colors duration-150"
//                         style={{
//                           borderBottom:
//                             index < models.length - 1
//                               ? "0.5px solid rgba(255,255,255,0.08)"
//                               : "none",
//                         }}
//                       >
//                         <span
//                           className="text-[15px]"
//                           style={{
//                             color:
//                               selectedModel?.id === m.id
//                                 ? "#ffffff"
//                                 : "rgba(255,255,255,0.55)",
//                             minWidth: "16px",
//                             display: "inline-block",
//                           }}
//                         >
//                           {selectedModel?.id === m.id ? "✓" : ""}
//                         </span>
//                         <span
//                           className="text-[15px] font-normal"
//                           style={{
//                             color:
//                               selectedModel?.id === m.id
//                                 ? "#ffffff"
//                                 : "#d1d5db",
//                           }}
//                         >
//                           {m.name}
//                         </span>
//                       </button>
//                     ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Reveal Price Button */}
//         <div className="flex flex-col items-center mb-20">
//           <Link
//             to={"/confirm-sale"}
//             onClick={onRevealPrice}
//             className="w-full sm:w-auto bg-custom text-white text-lg md:text-xl font-semibold py-4 px-12 md:px-32 rounded-lg hover:brightness-110 transition-all duration-300 mb-4 shadow-md cursor-pointer"
//           >
//             Reveal Price
//           </Link>
//           <div className="flex items-center gap-2">
//             <img
//               src="https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/b29d6407-9548-4b2b-9525-128bce1da365"
//               alt="Guarantee"
//               className="w-3 object-contain"
//             />
//             <span className="text-[#3D494C] text-sm">
//               Highest price guarantee within the UK
//             </span>
//           </div>
//         </div>

//         {/* Banner */}
//         <div className="relative w-full rounded-2xl overflow-hidden min-h-75 md:min-h-100 flex items-center shadow-lg">
//           <img
//             src="https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/ceb5a280-2880-4976-b709-8da7578e1a6f"
//             alt="Sustainable Tech"
//             className="absolute inset-0 w-full h-full object-cover"
//           />
//           <div className="absolute inset-0 bg-linear-to-b from-[#171C1E]/60 to-transparent"></div>

//           <div className="relative z-10 p-8 md:p-16 max-w-xl">
//             <h2 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
//               Sustainable Tech Cycle
//             </h2>
//             <p className="text-white/90 text-base md:text-lg leading-relaxed">
//               Every device recycled with us helps reduce global e-waste while
//               putting value back in your pocket.
//             </p>
//           </div>
//         </div>
//       </Container>
//     </div>
//   );
// };

// export default SellWorth;

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, ShieldCheck } from "lucide-react";
import Container from "../../../layout/Container";
import { Link } from "react-router";

const STORAGE_KEY = "sellFlow";

const SellWorth = () => {
  const [series, setSeries] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [loadingSeries, setLoadingSeries] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [showModels, setShowModels] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const modelsRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}

    const fetchSeries = async () => {
      setLoadingSeries(true);
      try {
        const base = import.meta.env.VITE_BASE_URL || "";
        const res = await fetch(`${base}/api/sell/series`);
        const json = await res.json();
        if (json?.success && Array.isArray(json.data)) setSeries(json.data);
      } catch (e) {}
      setLoadingSeries(false);
    };

    fetchSeries();
  }, []);

  const handleSelectSeries = async (s) => {
    setSelectedSeries(s);
    setSelectedModel(null);
    setModels([]);
    setLoadingModels(true);
    try {
      const base = import.meta.env.VITE_BASE_URL || "";
      const res = await fetch(`${base}/api/sell/models?seriesId=${s.id}`);
      const json = await res.json();
      if (json?.success && Array.isArray(json.data)) setModels(json.data);
    } catch (e) {}
    setLoadingModels(false);
  };

  const onRevealPrice = () => {
    if (!selectedModel || !selectedSeries) return;
    const payload = {
      seriesId: selectedSeries.id,
      seriesName: selectedSeries.name,
      deviceModelId: selectedModel.id,
      deviceName: selectedModel.name,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {}
  };

  useEffect(() => {
    const onDocClick = (e) => {
      if (modelsRef.current && !modelsRef.current.contains(e.target))
        setShowModels(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div className="bg-[#FBFDFF] min-h-screen py-10 lg:py-16">
      <Container>
        <div className="mb-12 w-full max-w-xl sm:max-w-none mx-auto px-1 sm:px-0">
          <div className="flex items-center justify-between sm:justify-center gap-1 sm:gap-4">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full bg-[#006878] text-white flex items-center justify-center text-xs sm:text-sm font-bold">
                1
              </div>
              <span className="text-[11px] sm:text-sm font-semibold text-[#171C1E] leading-tight">
                Device Details
              </span>
            </div>

            <div className="h-px flex-1 min-w-2 max-w-6 sm:flex-none sm:w-12 bg-[#BDC9CC] mx-0.5 sm:mx-2" />

            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full bg-[#DFE3E5] text-[#3D494C] flex items-center justify-center text-xs sm:text-sm font-bold">
                2
              </div>
              <span className="text-[11px] sm:text-sm text-[#8D9A9D] leading-tight">
                Condition
              </span>
            </div>

            <div className="h-px flex-1 min-w-2 max-w-6 sm:flex-none sm:w-12 bg-[#BDC9CC] mx-0.5 sm:mx-2" />

            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full bg-[#DFE3E5] text-[#3D494C] flex items-center justify-center text-xs sm:text-sm font-bold">
                3
              </div>
              <span className="text-[11px] sm:text-sm text-[#8D9A9D] leading-tight">
                Summary
              </span>
            </div>
          </div>
        </div>

        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl md:text-5xl lg:text-[56px] font-bold text-[#171C1E] mb-6 leading-tight">
            How much is your device worth?
          </h1>
          <p className="text-[#3D494C] text-base md:text-lg">
            Select your category to begin. We offer the UK's most competitive
            rates for premium consumer electronics.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
          {loadingSeries && (
            <div className="col-span-3 text-center">Loading series...</div>
          )}
          {!loadingSeries &&
            series.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectSeries(s)}
                className={`flex flex-col items-center justify-center py-8 rounded-xl border-2 transition-all duration-300 ${
                  selectedSeries?.id === s.id
                    ? "border-custom bg-[#F0F4F6] shadow-sm"
                    : "border-transparent bg-[#F0F4F6] hover:border-gray-300"
                }`}
              >
                <div className="w-20 h-20 flex items-center justify-center mb-4 overflow-hidden">
                  {s.image ? (
                    <img
                      src={s.image}
                      alt={s.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold">
                      {s.name?.[0] ?? "?"}
                    </span>
                  )}
                </div>
                <span className="text-[#2E395B] text-xl font-medium">
                  {s.name}
                </span>
              </button>
            ))}
        </div>

        <div className="max-w-2xl mx-auto mb-10">
          <label className="block text-xs font-bold text-[#3D494C] mb-3 uppercase tracking-wide">
            SELECT YOUR MODEL
          </label>
          <div className="relative" ref={modelsRef}>
            <button
              ref={triggerRef}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!showModels) {
                  const rect = triggerRef.current.getBoundingClientRect();
                  const spaceBelow = window.innerHeight - rect.bottom;
                  setDropUp(spaceBelow < 320);
                }
                setShowModels((s) => !s);
              }}
              className="w-full text-left bg-white border border-[#BDC9CC] rounded-lg py-4 px-6 text-[#171C1E] text-base outline-none hover:border-custom transition-colors flex items-center justify-between"
            >
              <span>{selectedModel?.name || "Select a device"}</span>
              <ChevronDown
                className={`w-6 h-6 text-gray-400 transition-transform ${showModels ? "rotate-180" : ""}`}
              />
            </button>

            {showModels && (
              <div
                className="absolute z-30 left-0 right-0 rounded-2xl shadow-2xl overflow-hidden max-w-[70%] mx-auto"
                style={{
                  background: "rgba(50, 50, 48, 0.82)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  ...(dropUp
                    ? { bottom: "calc(100% + 8px)", top: "auto" }
                    : { top: "calc(100% + 8px)", bottom: "auto" }),
                }}
              >
                <div className="max-h-80 overflow-y-auto">
                  {loadingModels && (
                    <div className="px-5 py-4 text-center text-gray-300 text-[15px]">
                      Loading models...
                    </div>
                  )}
                  {!loadingModels && models.length === 0 && (
                    <div className="px-5 py-4 text-center text-gray-400 text-[15px]">
                      No models found
                    </div>
                  )}
                  {!loadingModels &&
                    models.map((m, index) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedModel(m);
                          setShowModels(false);
                        }}
                        className="w-full text-left px-5 py-[14px] flex items-center gap-3 transition-colors duration-150"
                        style={{
                          borderBottom:
                            index < models.length - 1
                              ? "0.5px solid rgba(255,255,255,0.08)"
                              : "none",
                        }}
                      >
                        <span
                          className="text-[15px]"
                          style={{
                            color:
                              selectedModel?.id === m.id
                                ? "#ffffff"
                                : "rgba(255,255,255,0.55)",
                            minWidth: "16px",
                            display: "inline-block",
                          }}
                        >
                          {selectedModel?.id === m.id ? "✓" : ""}
                        </span>
                        <span
                          className="text-[15px] font-normal"
                          style={{
                            color:
                              selectedModel?.id === m.id
                                ? "#ffffff"
                                : "#d1d5db",
                          }}
                        >
                          {m.name}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center mb-20">
          <Link
            to={"/confirm-sale"}
            onClick={onRevealPrice}
            className="w-full sm:w-auto bg-custom text-white text-lg md:text-xl font-semibold py-4 px-12 md:px-32 rounded-lg hover:brightness-110 transition-all duration-300 mb-4 shadow-md cursor-pointer"
          >
            Reveal Price
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#3D494C] shrink-0" aria-hidden="true" />
            <span className="text-[#3D494C] text-sm">
              Highest price guarantee within the UK
            </span>
          </div>
        </div>

        <div className="relative w-full rounded-2xl overflow-hidden min-h-75 md:min-h-100 flex items-center shadow-lg">
          <img
            src="/Premium-electronics-close-up.webp"
            alt="Sustainable Tech" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-[#171C1E]/60 to-transparent"></div>
          <div className="relative z-10 p-8 md:p-16 max-w-xl">
            <h2 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Sustainable Tech Cycle
            </h2>
            <p className="text-white/90 text-base md:text-lg leading-relaxed">
              Every device recycled with us helps reduce global e-waste while
              putting value back in your pocket.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default SellWorth;
