import { useState, useEffect } from "react";
import {
  DollarSign,
  ShoppingCart,
  Smartphone,
  Package,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Swal from "sweetalert2";
import Stats from "./component/Stats";
import RecentOrder from "./component/RecentOrder";
import RevenueChart from "./component/RevenueChart";
import AdminDashboardTitle from "../../../components/dashboards/AdminDashboardTitle";

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api-zephyr-techno.maktechgroup.tech';

const AdminOverview = () => {
  const [overviewData, setOverviewData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(2026);

  useEffect(() => {
    fetchOverviewData();
    fetchRevenueData(selectedYear);
  }, [selectedYear]);

  const fetchOverviewData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin/dashboard/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const payload = await res.json();

      if (!res.ok || payload.success === false) {
        throw new Error(payload.message || 'Failed to fetch overview');
      }

      setOverviewData(payload.data.cards);

      // Map recent orders
      const mappedOrders = payload.data.recentOrders.map(order => ({
        name: order.customer?.email
          ? `${order.customer.email}${order.customer?.isGuest ? ' (Guest)' : ''}`
          : 'Guest',
        product: order.product?.title ?? '—',
        amount: `$${order.totalPrice.toLocaleString()}`,
        status: order.status.charAt(0) + order.status.slice(1).toLowerCase(),
        statusColor: getStatusColor(order.status)
      }));
      setRecentOrders(mappedOrders);

    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message,
        confirmButtonColor: '#0891b2'
      });
    }
  };

  const fetchRevenueData = async (year) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin/dashboard/revenue-overview?year=${year}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const payload = await res.json();

      if (!res.ok || payload.success === false) {
        throw new Error(payload.message || 'Failed to fetch revenue data');
      }

      // Combine labels with monthly data
      const mapped = payload.data.labels.map((label, index) => ({
        month: label,
        revenue: payload.data.year.monthly[index]
      }));
      setChartData(mapped);
      setLoading(false);

    } catch (err) {
      setLoading(false);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message,
        confirmButtonColor: '#0891b2'
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'text-yellow-500',
      SHIPPED: 'text-purple-500',
      DELIVERED: 'text-green-500',
      CANCELLED: 'text-red-500',
    };
    return colors[status] || 'text-gray-500';
  };

  // Build stats array from overviewData
  const stats = overviewData ? [
    {
      label: "Total Sales",
      value: `$${overviewData.totalSales.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      label: "Active Orders",
      value: overviewData.activeOrders.toString(),
      icon: ShoppingCart,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      label: "New Phones",
      value: overviewData.newPhones.toString(),
      icon: Smartphone,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Used Phones",
      value: overviewData.usedPhones.toString(),
      icon: Package,
      color: "text-yellow-500",
      bg: "bg-yellow-50",
    },
    {
      label: "Processing Orders",
      value: overviewData.processingOrders.toString(),
      icon: Clock,
      color: "text-cyan-500",
      bg: "bg-cyan-50",
    },
    {
      label: "Completed",
      value: overviewData.completedOrders.toString(),
      icon: CheckCircle,
      color: "text-yellow-500",
      bg: "bg-yellow-50",
    },
    {
      label: "Cancelled",
      value: overviewData.cancelledOrders.toString(),
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-50",
    },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-gray-400">
        Loading overview...
      </div>
    );
  }
  return (
    <div>
      <AdminDashboardTitle
        title="Overview"
        subtitle="Welcome back, here is the summary of your store's performance."
      />

      {/* Stats Grid */}
      <Stats stats={stats} />

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Revenue Overview - 3/5 width */}
        <div className="lg:col-span-3">
          <RevenueChart 
            chartData={chartData} 
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        </div>

        {/* Recent Orders - 2/5 width */}
        <div className="lg:col-span-2">
          <RecentOrder recentOrders={recentOrders} />
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
