
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

import Navbar from "./components/Navbar";
import AdminNavbar from "./components/AdminNavbar";
import AdminRoute from "./components/AdminRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TrainList from "./pages/TrainList";
import MyTickets from "./pages/MyTickets";
import Booking from "./pages/Booking";

import AdminDashboard from "./pages/AdminDashboard";
import AdminTrains from "./pages/AdminTrains";
import AdminTickets from "./pages/AdminTickets";
import AdminUsers from "./pages/AdminUsers";

import Promotions from "./pages/Promotions";
import Support from "./pages/Support";
import AdminPromotions from "./pages/AdminPromotions";
import AdminSupport from "./pages/AdminSupport";

import Profile from "./pages/Profile";

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <>
      {isAdminPage ? <AdminNavbar /> : <Navbar />}

      <Routes>
        {/* USER */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/trains" element={<TrainList />} />
        <Route path="/booking/:id" element={<Booking />} />

        {/* hỗ trợ cả 2 route */}
        <Route path="/mytickets" element={<MyTickets />} />
        <Route path="/my-tickets" element={<MyTickets />} />

        <Route path="/promotions" element={<Promotions />} />
        <Route path="/support" element={<Support />} />

        <Route path="/profile" element={<Profile />} />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/trains"
          element={
            <AdminRoute>
              <AdminTrains />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/tickets"
          element={
            <AdminRoute>
              <AdminTickets />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/promotions"
          element={
            <AdminRoute>
              <AdminPromotions />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/support"
          element={
            <AdminRoute>
              <AdminSupport />
            </AdminRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;