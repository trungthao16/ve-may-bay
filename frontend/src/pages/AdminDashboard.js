import { useEffect, useState } from "react";
import API from "../api/axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const PIE_COLORS = ["#4ca37d", "#c9503a", "#f59e0b", "#6366f1"];

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return percent > 0 ? (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

const formatVND = (val) => {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}tr`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
  return val;
};

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFlights: 0,
    totalTickets: 0,
    totalRevenue: 0,
    passengerTypes: [],
    dailyRevenue: [],
    topFlights: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/admin/stats");
        setStats(res.data);
      } catch (error) {
        console.error("Lỗi lấy thống kê:", error);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Tổng người dùng",
      value: stats.totalUsers,
      icon: "👥",
      note: "Tài khoản đã đăng ký",
      className: "users",
    },
    {
      title: "Tổng chuyến bay",
      value: stats.totalFlights,
      icon: "✈️",
      note: "Chuyến đang quản lý",
      className: "trains",
    },
    {
      title: "Tổng vé",
      value: stats.totalTickets,
      icon: "🎫",
      note: "Vé đã được đặt",
      className: "tickets",
    },
    {
      title: "Tổng doanh thu",
      value: `${Number(stats.totalRevenue || 0).toLocaleString("vi-VN")} VNĐ`,
      icon: "💰",
      note: "Doanh thu từ vé đã thanh toán",
      className: "revenue",
    },
  ];

  // Short date for X-axis label
  const formattedDailyRevenue = (stats.dailyRevenue || []).map(day => ({
    ...day,
    label: day.date ? day.date.slice(5) : day.date, // "MM-DD"
  }));

  return (
    <div className="admin-dashboard-page">
      <div className="rv-container">
        {/* Hero Banner */}
        <div className="admin-dashboard-hero">
          <div className="admin-dashboard-hero-content">
            <p className="admin-dashboard-label">TRUNG TÂM QUẢN TRỊ</p>
            <h1 className="admin-dashboard-title">Dashboard Admin</h1>
            <p className="admin-dashboard-sub">
              Theo dõi nhanh tình trạng hệ thống, số lượng người dùng, vé máy bay,
              chuyến bay và doanh thu trên một giao diện trực quan hơn.
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="admin-dashboard-grid">
          {statCards.map((item, index) => (
            <div className={`admin-dashboard-card ${item.className}`} key={index}>
              <div className="admin-dashboard-card-top">
                <div className="admin-dashboard-icon">{item.icon}</div>
                <span className="admin-dashboard-mini-badge">Live</span>
              </div>
              <div className="admin-dashboard-card-body">
                <p>{item.title}</p>
                <h3>{item.value}</h3>
                <span>{item.note}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="admin-charts-section">
          {/* Bar Chart: Doanh thu 7 ngày */}
          <div className="admin-chart-card">
            <div className="admin-chart-header">
              <h3>📈 Doanh thu 7 ngày gần nhất</h3>
              <span className="chart-subtitle">Chỉ tính vé đã thanh toán thành công</span>
            </div>
            {formattedDailyRevenue.every(d => d.revenue === 0) ? (
              <div className="chart-empty">Chưa có doanh thu trong 7 ngày qua.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={formattedDailyRevenue} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={formatVND} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(val) => [`${Number(val).toLocaleString("vi-VN")} đ`, "Doanh thu"]}
                    labelFormatter={(label) => `Ngày: ${label}`}
                  />
                  <Bar dataKey="revenue" fill="#4ca37d" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie Chart: Loại hành khách */}
          <div className="admin-chart-card">
            <div className="admin-chart-header">
              <h3>🥧 Phân phối loại hành khách</h3>
              <span className="chart-subtitle">Tỷ lệ vé theo đối tượng</span>
            </div>
            {(stats.passengerTypes || []).every(p => p.value === 0) ? (
              <div className="chart-empty">Chưa có dữ liệu hành khách.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={stats.passengerTypes || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    dataKey="value"
                    nameKey="name"
                    labelLine={false}
                    label={renderCustomLabel}
                  >
                    {(stats.passengerTypes || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend
                    formatter={(value) => <span style={{ fontSize: 13 }}>{value}</span>}
                  />
                  <Tooltip formatter={(val) => [`${val} vé`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top 5 Popular Routes Section */}
        <div className="admin-charts-section full-width">
          <div className="admin-chart-card">
            <div className="admin-chart-header">
              <h3>🏆 Top 5 Tuyến bay phổ biến nhất</h3>
              <span className="chart-subtitle">Dựa trên số lượng vé đã thanh toán</span>
            </div>
            {(!stats.topFlights || stats.topFlights.length === 0) ? (
              <div className="chart-empty">Chưa có dữ liệu tuyến bay.</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  layout="vertical"
                  data={stats.topFlights}
                  margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 12, fontWeight: "bold" }}
                    width={100}
                  />
                  <Tooltip
                    formatter={(val) => [`${val} vé`, "Số lượng"]}
                    contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#6366f1"
                    radius={[0, 6, 6, 0]}
                    barSize={30}
                    label={{ position: "right", fontSize: 12, fontWeight: "bold" }}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
