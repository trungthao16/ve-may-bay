import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css";

import Navbar from "./components/Navbar";
import AdminNavbar from "./components/AdminNavbar";
import AdminRoute from "./components/AdminRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import FlightList from "./pages/FlightList";
import MyTickets from "./pages/MyTickets";
import Booking from "./pages/Booking";

import AdminDashboard from "./pages/AdminDashboard";
import AdminFlights from "./pages/AdminFlights";
import AdminTickets from "./pages/AdminTickets";
import AdminUsers from "./pages/AdminUsers";

import Promotions from "./pages/Promotions";
import Support from "./pages/Support";
import AdminPromotions from "./pages/AdminPromotions";
import AdminSupport from "./pages/AdminSupport";

import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <>
      {isAdminPage ? <AdminNavbar /> : <Navbar />}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: "10px",
            background: "#1f1712",
            color: "#fff",
            fontSize: "14px",
            fontFamily: "Inter, sans-serif",
          },
          success: { iconTheme: { primary: "#4ca37d", secondary: "#fff" } },
          error: { iconTheme: { primary: "#c9503a", secondary: "#fff" } },
        }}
      />

      <Routes>
        {/* USER */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/flights" element={<FlightList />} />
        <Route path="/booking/:id" element={<Booking />} />

        <Route path="/mytickets" element={<MyTickets />} />
        <Route path="/my-tickets" element={<MyTickets />} />

        <Route path="/promotions" element={<Promotions />} />
        <Route path="/support" element={<Support />} />

        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />

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
          path="/admin/flights"
          element={
            <AdminRoute>
              <AdminFlights />
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
