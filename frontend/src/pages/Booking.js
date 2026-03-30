// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import API from "../api/axios";

// function Booking() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [train, setTrain] = useState(null);
//   const [seatNumber, setSeatNumber] = useState("");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const fetchTrain = async () => {
//       try {
//         const res = await API.get(`/trains/${id}`);
//         setTrain(res.data);
//       } catch (error) {
//         console.error("Lỗi lấy chi tiết tàu:", error);
//         alert("Không tải được thông tin chuyến tàu");
//       }
//     };

//     fetchTrain();
//   }, [id]);

//   const handleBooking = async (e) => {
//     e.preventDefault();

//     if (!seatNumber) {
//       alert("Vui lòng nhập số ghế");
//       return;
//     }

//     try {
//       setLoading(true);

//       const payload = {
//         trainId: id,
//         seatNumber: seatNumber,
//       };

//       console.log("BOOKING PAYLOAD:", payload);

//       const res = await API.post("/tickets", payload);

//       console.log("BOOKING SUCCESS:", res.data);
//       alert("Đặt vé thành công");
//       navigate("/my-tickets");
//     } catch (error) {
//       console.error("BOOKING ERROR:", error);
//       console.error("BOOKING ERROR RESPONSE:", error.response?.data);

//       alert(error.response?.data?.message || "Đặt vé thất bại");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!train) return <div className="rv-container">Đang tải...</div>;

//   return (
//     <div className="booking-page">
//       <div className="rv-container">
//         <div className="booking-card">
//           <div className="booking-left">
//             <h1 className="booking-title">{train.name}</h1>
//             <div className="booking-route">
//               {train.from} → {train.to}
//             </div>

//             <div className="booking-info-grid">
//               <div className="info-item">
//                 <span>Khởi hành</span>
//                 <strong>{train.departureTime}</strong>
//               </div>

//               <div className="info-item">
//                 <span>Đến nơi</span>
//                 <strong>{train.arrivalTime}</strong>
//               </div>

//               <div className="info-item">
//                 <span>Giá vé</span>
//                 <strong>{Number(train.price).toLocaleString("vi-VN")}đ</strong>
//               </div>

//               <div className="info-item">
//                 <span>Tổng ghế</span>
//                 <strong>{train.seats}</strong>
//               </div>
//             </div>
//           </div>

//           <div className="booking-right">
//             <h3>Thông tin đặt vé</h3>

//             <form onSubmit={handleBooking}>
//               <label>Số ghế</label>
//               <input
//                 type="text"
//                 value={seatNumber}
//                 onChange={(e) => setSeatNumber(e.target.value)}
//                 placeholder="Ví dụ: 12"
//               />

//               <button
//                 type="submit"
//                 className="confirm-booking-btn"
//                 disabled={loading}
//               >
//                 {loading ? "Đang đặt vé..." : "Xác nhận đặt vé"}
//               </button>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Booking;

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";

function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [train, setTrain] = useState(null);
  const [seatNumber, setSeatNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoError, setPromoError] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedPromotion, setAppliedPromotion] = useState(null);

  useEffect(() => {
    const fetchTrain = async () => {
      try {
        const res = await API.get(`/trains/${id}`);
        setTrain(res.data);
      } catch (error) {
        console.error("Lỗi lấy chi tiết tàu:", error);
        alert("Không tải được thông tin chuyến tàu");
      }
    };

    fetchTrain();
  }, [id]);

  const originalPrice = train ? Number(train.price) : 0;
  const finalPrice = Math.max(originalPrice - discountAmount, 0);

  const handleApplyPromotion = async () => {
    if (!promoCode.trim()) {
      setPromoMessage("");
      setPromoError("Vui lòng nhập mã khuyến mãi");
      setDiscountAmount(0);
      setAppliedPromotion(null);
      return;
    }

    try {
      setPromoLoading(true);
      setPromoMessage("");
      setPromoError("");

      const res = await API.post("/promotions/validate", {
        code: promoCode,
        orderValue: originalPrice,
      });

      setDiscountAmount(res.data.discountAmount || 0);
      setAppliedPromotion(res.data.promotion);
      setPromoMessage(res.data.message || "Áp mã thành công");
      setPromoError("");
    } catch (error) {
      setDiscountAmount(0);
      setAppliedPromotion(null);
      setPromoMessage("");
      setPromoError(error.response?.data?.message || "Áp mã thất bại");
    } finally {
      setPromoLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!seatNumber) {
      alert("Vui lòng nhập số ghế");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        trainId: id,
        seatNumber: seatNumber,
        promotionCode: appliedPromotion?.code || "",
        discountAmount: discountAmount,
        finalPrice: finalPrice,
      };

      console.log("BOOKING PAYLOAD:", payload);

      const res = await API.post("/tickets", payload);

      console.log("BOOKING SUCCESS:", res.data);
      alert("Đặt vé thành công");
      navigate("/my-tickets");
    } catch (error) {
      console.error("BOOKING ERROR:", error);
      console.error("BOOKING ERROR RESPONSE:", error.response?.data);

      alert(error.response?.data?.message || "Đặt vé thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (!train) return <div className="rv-container">Đang tải...</div>;

  return (
    <div className="booking-page">
      <div className="rv-container">
        <div className="booking-card">
          <div className="booking-left">
            <h1 className="booking-title">{train.name}</h1>
            <div className="booking-route">
              {train.from} → {train.to}
            </div>

            <div className="booking-info-grid">
              <div className="info-item">
                <span>Khởi hành</span>
                <strong>{train.departureTime}</strong>
              </div>

              <div className="info-item">
                <span>Đến nơi</span>
                <strong>{train.arrivalTime}</strong>
              </div>

              <div className="info-item">
                <span>Giá vé</span>
                <strong>{Number(train.price).toLocaleString("vi-VN")}đ</strong>
              </div>

              <div className="info-item">
                <span>Tổng ghế</span>
                <strong>{train.seats}</strong>
              </div>
            </div>
          </div>

          <div className="booking-right">
            <h3>Thông tin đặt vé</h3>

            <form onSubmit={handleBooking}>
              <label>Số ghế</label>
              <input
                type="text"
                value={seatNumber}
                onChange={(e) => setSeatNumber(e.target.value)}
                placeholder="Ví dụ: 12"
              />

              <label>Mã khuyến mãi</label>
              <div className="promo-box">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Nhập mã khuyến mãi"
                />
                <button
                  type="button"
                  className="apply-promo-btn"
                  onClick={handleApplyPromotion}
                  disabled={promoLoading}
                >
                  {promoLoading ? "Đang áp mã..." : "Áp mã"}
                </button>
              </div>

              {promoMessage && (
                <div className="promo-success">{promoMessage}</div>
              )}

              {promoError && <div className="promo-error">{promoError}</div>}

              <div className="booking-price-box">
                <div className="price-row">
                  <span>Giá gốc:</span>
                  <strong>{originalPrice.toLocaleString("vi-VN")}đ</strong>
                </div>

                <div className="price-row">
                  <span>Giảm giá:</span>
                  <strong>- {discountAmount.toLocaleString("vi-VN")}đ</strong>
                </div>

                <div className="price-row total">
                  <span>Thành tiền:</span>
                  <strong>{finalPrice.toLocaleString("vi-VN")}đ</strong>
                </div>
              </div>

              <button
                type="submit"
                className="confirm-booking-btn"
                disabled={loading}
              >
                {loading ? "Đang đặt vé..." : "Xác nhận đặt vé"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Booking;