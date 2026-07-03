// import React, { useState, useEffect, useCallback, useRef } from "react";

// const API_BASE_URL =
//   import.meta.env.VITE_BASE_URL ||
//   "https://api-zephyr-techno.maktechgroup.tech";

// const SaleNotification = () => {
//   const [phase, setPhase] = useState("hidden"); // hidden | in | show | out
//   const [current, setCurrent] = useState(null);
//   const timers = useRef([]);

//   const clearTimers = () => {
//     timers.current.forEach(clearTimeout);
//     timers.current = [];
//   };

//   const addTimer = (fn, delay) => {
//     const id = setTimeout(fn, delay);
//     timers.current.push(id);
//     return id;
//   };

//   const dismiss = useCallback(() => {
//     setPhase("out");
//     addTimer(() => setPhase("hidden"), 350);
//   }, []);

//   // ── show() now receives data from the backend instead of picking randomly ──
//   const show = useCallback(
//     (data) => {
//       clearTimers();
//       setCurrent(data);
//       setPhase("in");
//       addTimer(() => setPhase("show"), 50);
//       addTimer(dismiss, 6000);
//     },
//     [dismiss],
//   );

//   // ── Single SSE connection — backend handles all timing ────────────────────
//   useEffect(() => {
//     const es = new EventSource(`${API_BASE_URL}/api/sell/activity-stream`);

//     es.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       show(data); // { name, action, phone } — same shape as before
//     };

//     es.onerror = () => {
//       // EventSource auto-reconnects by itself — no manual retry needed
//     };

//     return () => {
//       es.close();
//       clearTimers();
//     };
//   }, [show]);

//   if (phase === "hidden" || !current) return null;

//   const hidden = phase === "in" || phase === "out";

//   return (
//     <div
//       className="fixed z-50 top-20 right-4 transition-all duration-350 ease-out"
//       style={{
//         width: 288,
//         opacity: hidden ? 0 : 1,
//         transform: hidden ? "translateX(20px)" : "translateX(0)",
//       }}
//     >
//       {/* Card */}
//       <div
//         className="relative bg-white rounded-2xl border border-gray-100 px-4 pt-3.5 pb-5"
//         style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.13)" }}
//       >
//         {/* Dismiss button */}
//         <button
//           onClick={dismiss}
//           aria-label="Dismiss"
//           className="absolute top-2.5 right-3 text-gray-300 hover:text-gray-500 text-[11px] leading-none transition-colors"
//         >
//           ✕
//         </button>

//         {/* Header row */}
//         <div className="flex items-center gap-1.5 mb-3">
//           <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
//           <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
//             Recent Activity
//           </span>
//         </div>

//         {/* Body */}
//         <div className="flex items-center gap-3">
//           {/* Avatar */}
//           <div
//             className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0 select-none"
//             style={{
//               background: "linear-gradient(135deg, #3DB4CC 0%, #2a8fa8 100%)",
//             }}
//           >
//             {current.name.charAt(0)}
//           </div>

//           <div className="flex-1 min-w-0">
//             <p className="text-sm font-bold text-gray-800 truncate">
//               {current.name}
//             </p>
//             <p className="text-xs text-gray-500 mt-0.5 leading-snug">
//               <span
//                 className="font-semibold"
//                 style={{
//                   color: current.action === "bought" ? "#10b981" : "#3DB4CC",
//                 }}
//               >
//                 {current.action === "bought" ? "Just bought" : "Just sold"}
//               </span>{" "}
//               a{" "}
//               <span className="font-semibold text-gray-700">
//                 {current.phone}
//               </span>
//             </p>
//             <p className="text-[11px] text-gray-400 mt-1">just now</p>
//           </div>
//         </div>

//         {/* Speech-bubble tail — bottom-left */}
//         <div
//           className="absolute bg-white"
//           style={{
//             bottom: -9,
//             left: 26,
//             width: 16,
//             height: 16,
//             borderRight: "1px solid #f3f4f6",
//             borderBottom: "1px solid #f3f4f6",
//             transform: "rotate(45deg)",
//             boxShadow: "3px 3px 5px rgba(0,0,0,0.04)",
//           }}
//         />
//       </div>
//     </div>
//   );
// };

// export default SaleNotification;





import React, { useState, useEffect, useCallback, useRef } from "react";

const NOTIFICATIONS = [
  // Original filtered iPhones
  { name: "Emily R.", action: "sold", phone: "iPhone 13 Pro" },
  { name: "Aisha B.", action: "sold", phone: "iPhone 12 Mini" },
  { name: "Priya S.", action: "sold", phone: "iPhone 15 Pro" },
  { name: "Sofia B.", action: "sold", phone: "iPhone 11 Pro Max" },
  { name: "Zara N.", action: "sold", phone: "iPhone 14" },
  { name: "Mia D.", action: "sold", phone: "iPhone 16" },
  { name: "Layla S.", action: "sold", phone: "iPhone 15 Pro Max" },
  { name: "Hana R.", action: "sold", phone: "iPhone 14 Pro Max" },
  { name: "Grace L.", action: "sold", phone: "iPhone 13 Mini" },
  { name: "Ella C.", action: "sold", phone: "iPhone 16 Pro Max" },
  { name: "Iris D.", action: "sold", phone: "iPhone 14 Plus" },
  { name: "Luna W.", action: "sold", phone: "iPhone 13 Pro" },
  { name: "Sana M.", action: "sold", phone: "iPhone 11" },
  { name: "Lila F.", action: "sold", phone: "iPhone 15 Plus" },
  { name: "Mila P.", action: "sold", phone: "iPhone 16 Plus" },
  { name: "Anya K.", action: "sold", phone: "iPhone 12 Mini" },
  { name: "Zoe H.", action: "sold", phone: "iPhone 13" },
  { name: "Isla O.", action: "sold", phone: "iPhone 15" },
  { name: "Jana L.", action: "sold", phone: "iPhone 14 Pro Max" },
  { name: "Tara C.", action: "sold", phone: "iPhone 13 Mini" },
  { name: "Hana K.", action: "sold", phone: "iPhone 16" },
  { name: "Nia A.", action: "sold", phone: "iPhone 14 Plus" },
  { name: "Alma O.", action: "sold", phone: "iPhone 12 Pro" },
  { name: "Cora M.", action: "sold", phone: "iPhone 16 Pro" },
  { name: "Dina P.", action: "sold", phone: "iPhone 15 Pro Max" },
  { name: "Mara T.", action: "sold", phone: "iPhone 12 Mini" },
  { name: "Jade D.", action: "sold", phone: "iPhone 13" },
  { name: "Nora W.", action: "sold", phone: "iPhone 15" },
  { name: "Faye M.", action: "sold", phone: "iPhone 14 Plus" },
  { name: "Lara F.", action: "sold", phone: "iPhone 15 Pro" },
  { name: "Rina T.", action: "sold", phone: "iPhone 16" },
  { name: "Ada R.", action: "sold", phone: "iPhone 14 Pro" },
  { name: "Tom H.", action: "sold", phone: "iPhone 15" },
  { name: "Lucy V.", action: "sold", phone: "iPhone 14 Pro" },
  { name: "Mark D.", action: "sold", phone: "iPhone 16 Pro Max" },
  { name: "Sophie G.", action: "sold", phone: "iPhone 13" },
  { name: "Oliver P.", action: "sold", phone: "iPhone 12" },
  { name: "Emma W.", action: "sold", phone: "iPhone 11" },
  { name: "Jack S.", action: "sold", phone: "iPhone SE 2022" },
  { name: "Chloe T.", action: "sold", phone: "iPhone 15 Plus" },
  { name: "Noah B.", action: "sold", phone: "iPhone 14 Plus" },
  { name: "Ava L.", action: "sold", phone: "iPhone 13 Mini" },
  { name: "Liam K.", action: "sold", phone: "iPhone 16" },
  { name: "Mia C.", action: "sold", phone: "iPhone 15 Pro" },
  { name: "Ethan M.", action: "sold", phone: "iPhone 12 Pro Max" },
  { name: "Isabella R.", action: "sold", phone: "iPhone 11 Pro" },
  { name: "Mason F.", action: "sold", phone: "iPhone 13 Pro Max" },
  { name: "Harper N.", action: "sold", phone: "iPhone XR" },
  { name: "Logan A.", action: "sold", phone: "iPhone 14 Pro Max" },
  { name: "Evelyn J.", action: "sold", phone: "iPhone 12 Pro" },
  { name: "Lucas E.", action: "sold", phone: "iPhone 16 Plus" },
  { name: "Aria O.", action: "sold", phone: "iPhone 15 Pro Max" }
];

const SaleNotification = () => {
  const [phase, setPhase] = useState("hidden"); // hidden | in | show | out
  const [current, setCurrent] = useState(null);
  const timers = useRef([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const addTimer = (fn, delay) => {
    const id = setTimeout(fn, delay);
    timers.current.push(id);
    return id;
  };

  const dismiss = useCallback(() => {
    setPhase("out");
    addTimer(() => setPhase("hidden"), 350);
  }, []);

  const show = useCallback(() => {
    clearTimers();
    const pick =
      NOTIFICATIONS[Math.floor(Math.random() * NOTIFICATIONS.length)];
    setCurrent(pick);

    // Trigger enter animation
    setPhase("in");
    addTimer(() => setPhase("show"), 50);

    // Auto-dismiss after 6 seconds
    addTimer(dismiss, 6000);
  }, [dismiss]);

  useEffect(() => {
    // First popup after 3 seconds, then every 30 seconds
    const boot = setTimeout(() => {
      show();
      const interval = setInterval(show, 30000);
      timers.current.push(interval);
    }, 3000);

    return () => {
      clearTimeout(boot);
      clearTimers();
    };
  }, [show]);

  if (phase === "hidden" || !current) return null;

  const hidden = phase === "in" || phase === "out";

  return (
    <div
      className="fixed z-50 top-20 right-4 transition-all duration-350 ease-out"
      style={{
        width: 288,
        opacity: hidden ? 0 : 1,
        transform: hidden ? "translateX(20px)" : "translateX(0)",
      }}
    >
      {/* Card */}
      <div
        className="relative bg-white rounded-2xl border border-gray-100 px-4 pt-3.5 pb-5"
        style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.13)" }}
      >
        {/* Dismiss button */}
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute top-2.5 right-3 text-gray-300 hover:text-gray-500 text-[11px] leading-none transition-colors"
        >
          ✕
        </button>

        {/* Header row */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Recent Activity
          </span>
        </div>

        {/* Body */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0 select-none"
            style={{
              background: "linear-gradient(135deg, #3DB4CC 0%, #2a8fa8 100%)",
            }}
          >
            {current.name.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800 truncate">
              {current.name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 leading-snug">
              <span
                className="font-semibold"
                style={{
                  color: current.action === "bought" ? "#10b981" : "#3DB4CC",
                }}
              >
                {current.action === "bought" ? "Just bought" : "Just sold"}
              </span>{" "}
              a{" "}
              <span className="font-semibold text-gray-700">
                {current.phone}
              </span>
            </p>
            <p className="text-[11px] text-gray-400 mt-1">just now</p>
          </div>
        </div>

        {/* Speech-bubble tail — bottom-left */}
        <div
          className="absolute bg-white"
          style={{
            bottom: -9,
            left: 26,
            width: 16,
            height: 16,
            borderRight: "1px solid #f3f4f6",
            borderBottom: "1px solid #f3f4f6",
            transform: "rotate(45deg)",
            boxShadow: "3px 3px 5px rgba(0,0,0,0.04)",
          }}
        />
      </div>
    </div>
  );
};

export default SaleNotification;