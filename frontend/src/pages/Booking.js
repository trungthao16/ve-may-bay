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
import SeatMap from "../components/SeatMap";

function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [train, setTrain] = useState(null);
  const [seatNumber, setSeatNumber] = useState("");
  const [coachNumber, setCoachNumber] = useState(null);
  const [extraPrice, setExtraPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoError, setPromoError] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const [activePromotions, setActivePromotions] = useState([]);
  const [showPromos, setShowPromos] = useState(false);

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

    const fetchPromotions = async () => {
      try {
        const res = await API.get("/promotions");
        setActivePromotions(res.data);
      } catch (error) {
        console.error("Lỗi lấy khuyến mãi:", error);
      }
    };

    fetchTrain();
    fetchPromotions();
  }, [id]);

  const originalPrice = train ? Number(train.price) + extraPrice : 0;
  const finalPrice = Math.max(originalPrice - discountAmount, 0);

  const handleSeatSelect = (cNumber, sNumber, addedPrice) => {
    setCoachNumber(cNumber);
    setSeatNumber(sNumber);
    setExtraPrice(addedPrice);
    setDiscountAmount(0); // reset discount when price changes
    setAppliedPromotion(null);
  };

  const handleApplyPromotion = async (codeToApply = null) => {
    const code = typeof codeToApply === "string" ? codeToApply : promoCode;

    if (!code.trim()) {
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
        code: code,
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

    if (!seatNumber || !coachNumber) {
      alert("Vui lòng chọn ghế trên sơ đồ");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        trainId: id,
        seatNumber: seatNumber.toString(),
        coachNumber: coachNumber,
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
            <h1 className="booking-title">{train.trainName || "Chuyến tàu"}</h1>
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
                <strong>{train.totalSeats}</strong>
              </div>
            </div>
          </div>

          <div className="booking-right">
            <h3>Thông tin đặt vé</h3>

            <div style={{ marginBottom: "20px" }}>
              <SeatMap train={train} onSeatSelect={handleSeatSelect} />
            </div>

            <form onSubmit={handleBooking}>
              <label>Ghế đã chọn</label>
              <div 
                style={{ 
                  padding: "12px", 
                  background: "#eaf5ef", 
                  border: "1px solid #4ca37d", 
                  borderRadius: "8px", 
                  fontWeight: "bold", 
                  color: "#2a6948",
                  marginBottom: "20px" 
                }}
              >
                {coachNumber && seatNumber 
                  ? `Toa số ${coachNumber} - Ghế số ${seatNumber}` 
                  : "Chưa chọn ghế (Vui lòng click vào sơ đồ)"}
              </div>

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

              {activePromotions.length > 0 && (
                <div className="active-promotions-list">
                  <p 
                    onClick={() => setShowPromos(!showPromos)}
                    style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    Xem mã có thể áp dụng 
                    <span style={{ fontSize: '10px' }}>{showPromos ? '▲' : '▼'}</span>
                  </p>
                  
                  {showPromos && (
                    <div className="promo-chips" style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      flexWrap: 'nowrap',
                      gap: '10px',
                      maxHeight: '260px',
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      padding: '4px',
                      marginTop: '8px'
                    }}>
                      {activePromotions.map((promo) => {
                        const isPercent = promo.discountType === 'percent';
                        const valText = isPercent 
                          ? `Giảm ${promo.discountValue}%` 
                          : `Giảm ${(promo.discountValue / 1000).toLocaleString('vi-VN')}k`;
                        const maxText = isPercent && promo.maxDiscount > 0 
                          ? ` tối đa ${(promo.maxDiscount / 1000).toLocaleString('vi-VN')}k` 
                          : '';
                        const minText = promo.minOrderValue > 0 
                          ? `Đơn tối thiểu ${(promo.minOrderValue / 1000).toLocaleString('vi-VN')}k` 
                          : 'Mọi đơn hàng';
                          
                        const isApplied = appliedPromotion && appliedPromotion.code === promo.code;
                          
                        return (
                          <div 
                            key={promo._id} 
                            className="promo-chip-shopee"
                            onClick={() => {
                               if (!isApplied) {
                                 setPromoCode(promo.code);
                                 handleApplyPromotion(promo.code);
                                 setShowPromos(false);
                               }
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: isApplied ? '#f0f9f0' : '#fffdf9',
                              border: `1px solid ${isApplied ? '#28a745' : '#eadfce'}`,
                              borderRadius: '10px',
                              padding: '12px',
                              cursor: isApplied ? 'default' : 'pointer',
                              boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                              transition: '0.2s'
                            }}
                            onMouseEnter={(e) => {
                              if (!isApplied) e.currentTarget.style.borderColor = '#c9503a';
                            }}
                            onMouseLeave={(e) => {
                              if (!isApplied) e.currentTarget.style.borderColor = '#eadfce';
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <strong style={{ color: isApplied ? '#28a745' : '#c9503a', fontSize: '15px' }}>{valText}{maxText}</strong>
                              </div>
                              <div style={{ fontSize: '13px', color: '#6b6156' }}>{minText}</div>
                            </div>
                            <div style={{ 
                              background: isApplied ? '#e1f5e6' : '#ffece8', 
                              color: isApplied ? '#28a745' : '#b64431', 
                              padding: '6px 12px', 
                              borderRadius: '8px', 
                              fontSize: '12px', 
                              fontWeight: '700' 
                            }}>
                              {isApplied ? '✔ Đang dùng' : 'Dùng ngay'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

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