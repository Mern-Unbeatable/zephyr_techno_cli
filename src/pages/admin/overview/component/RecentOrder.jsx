import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Smartphone } from 'lucide-react';

const RecentOrder = ({ recentOrders }) => {
  return (
    <div>
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg text-[#191B1C]">Recent Orders</h2>
          <Link to="/dashboard/admin/order" className="text-sm text-[#1B63FF] cursor-pointer hover:underline">
            View All
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {recentOrders.map((order, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#EFEFEF] rounded-lg flex items-center justify-center shrink-0">
                
                <ShoppingBag size={16} className="text-[#2D3036]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-[#191B1C] truncate">
                  {order.name}
                </p>
                <p className="text-sm text-[#545454] truncate">
                  {order.product}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-base font-bold text-[#191B1C]">
                  {order.amount}
                </p>
                <p className={`text-xs font-medium ${order.statusColor}`}>
                  {order.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentOrder;
