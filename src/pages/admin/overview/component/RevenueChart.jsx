import React from "react";
import { Area, AreaChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

const RevenueChart = ({ chartData, selectedYear, onYearChange }) => {
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;

  return (
    <div>
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-lg text-[#191B1C]">Revenue Overview</h2>
            <p className="text-sm text-gray-400">
              Revenue and order volume analysis for the current year
            </p>
          </div>
          <select 
            value={selectedYear}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-500 cursor-pointer"
          >
            <option value={currentYear}>This year</option>
            <option value={lastYear}>Last year</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#999" style={{ fontSize: "12px" }} />
            <YAxis stroke="#999" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
              formatter={(value) => `$${value.toLocaleString()}`}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#06b6d4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
