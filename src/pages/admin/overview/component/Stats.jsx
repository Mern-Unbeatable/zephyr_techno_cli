import React from "react";

const Stats = ({ stats }) => {
  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
          >
            <div
              className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}
            >
              <stat.icon size={18} className={stat.color} />
            </div>
            <p className="text-sm text-[#373737] font-normal">{stat.label}</p>
            <p className="text-2xl font-semibold text-[#0C0C0C] mt-0.5 wrap-break-word">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stats;
