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
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import API from "../api/axios";
import SeatMap from "../components/SeatMap";
import toast from "react-hot-toast";

function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTrainId = searchParams.get("returnTrainId");

  const [train, setTrain] = useState(null);
  const [returnTrain, setReturnTrain] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [returnPassengers, setReturnPassengers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); // 1 = outbound, 2 = return

  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoError, setPromoError] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const [activePromotions, setActivePromotions] = useState([]);
  const [showPromos, setShowPromos] = useState(false);

  const isRoundTrip = !!returnTrainId;

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchTrain = async () => {
      try {
        const res = await API.get(`/trains/${id}`);
        setTrain(res.data);
      } catch (error) {
        console.error("Lỗi lấy chi tiết tàu:", error);
        toast.error("Định tuyến không tải được, vui lòng thử lại");
      }
    };

    const fetchReturnTrain = async () => {
      if (!returnTrainId) return;
      try {
        const res = await API.get(`/trains/${returnTrainId}`);
        setReturnTrain(res.data);
      } catch (error) {
        console.error("Lỗi lấy chi tiết tàu chiều về:", error);
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
    fetchReturnTrain();
    fetchPromotions();
  }, [id, returnTrainId]);

  const handleSeatSelect = (selectedSeats) => {
    setPassengers((prev) => {
      const newPassengers = selectedSeats.map((seat) => {
        const existing = prev.find(
          (p) => p.coachNumber === seat.coachNumber && p.seatNumber === seat.seatNumber
        );
        if (existing) return existing;
        const isFirstAndEmpty = prev.length === 0 && user?.name;
        return {
          coachNumber: seat.coachNumber,
          seatNumber: seat.seatNumber,
          extraPrice: seat.extraPrice,
          passengerName: isFirstAndEmpty ? user.name : "",
          cccd: "",
          passengerType: "adult",
        };
      });
      return newPassengers;
    });
    setDiscountAmount(0);
    setAppliedPromotion(null);
  };

  const handleReturnSeatSelect = (selectedSeats) => {
    setReturnPassengers((prev) => {
      const newPassengers = selectedSeats.map((seat) => {
        const existing = prev.find(
          (p) => p.coachNumber === seat.coachNumber && p.seatNumber === seat.seatNumber
        );
        if (existing) return existing;
        // Auto-fill from outbound passengers if same index exists
        const idx = selectedSeats.indexOf(seat);
        const outP = passengers[idx];
        return {
          coachNumber: seat.coachNumber,
          seatNumber: seat.seatNumber,
          extraPrice: seat.extraPrice,
          passengerName: outP?.passengerName || "",
          cccd: outP?.cccd || "",
          passengerType: outP?.passengerType || "adult",
        };
      });
      return newPassengers;
    });
  };

  const updateReturnPassengerInfo = (index, field, value) => {
    const updated = [...returnPassengers];
    updated[index][field] = value;
    setReturnPassengers(updated);
  };

  const updatePassengerInfo = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  // Calculate total price
  const calculatePassengerPrice = (p) => {
    const base = Number(train.price) + p.extraPrice;
    let rate = 0;
    if (p.passengerType === "child") rate = 0.25;
    else if (p.passengerType === "student") rate = 0.10;
    else if (p.passengerType === "senior") rate = 0.15;
    return base * (1 - rate);
  };

  const totalPriceBeforeVoucher = passengers.reduce((sum, p) => sum + calculatePassengerPrice(p), 0);
  const finalPrice = Math.max(totalPriceBeforeVoucher - discountAmount, 0);

  const handleApplyPromotion = async (codeToApply = null) => {
    const code = typeof codeToApply === "string" ? codeToApply : promoCode;

    if (!code.trim()) {
      setPromoError("Vui lòng nhập mã khuyến mãi");
      return;
    }

    try {
      setPromoLoading(true);
      setPromoMessage("");
      setPromoError("");

      const res = await API.post("/promotions/validate", {
        code: code,
        orderValue: totalPriceBeforeVoucher,
      });

      setDiscountAmount(res.data.discountAmount || 0);
      setAppliedPromotion(res.data.promotion);
      setPromoMessage(res.data.message || "Áp mã thành công");
    } catch (error) {
      setDiscountAmount(0);
      setAppliedPromotion(null);
      setPromoError(error.response?.data?.message || "Áp mã thất bại");
    } finally {
      setPromoLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    // If roundtrip and still at step 1, go to step 2
    if (isRoundTrip && bookingStep === 1) {
      if (passengers.length === 0) {
        toast.error("Vui lòng chọn ghế chiều đi");
        return;
      }
      const invalid = passengers.find(p => !p.passengerName.trim() || !p.cccd.trim());
      if (invalid) {
        toast.error("Vui lòng nhập đầy đủ Họ tên và Số CCCD cho tất cả hành khách chiều đi");
        return;
      }
      setBookingStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Validate current step passengers
    const currentPassengers = isRoundTrip && bookingStep === 2 ? returnPassengers : passengers;
    if (currentPassengers.length === 0) {
      toast.error(isRoundTrip ? "Vui lòng chọn ghế chiều về" : "Vui lòng chọn ghế trên sơ đồ");
      return;
    }
    const invalid = currentPassengers.find(p => !p.passengerName.trim() || !p.cccd.trim());
    if (invalid) {
      toast.error("Vui lòng nhập đầy đủ Họ tên và Số CCCD cho tất cả hành khách");
      return;
    }

    try {
      setLoading(true);

      // Book outbound
      const payloadGo = {
        trainId: id,
        passengers: passengers.map(p => ({
          name: p.passengerName,
          cccd: p.cccd,
          type: p.passengerType,
          coachNumber: p.coachNumber,
          seatNumber: p.seatNumber
        })),
        promotionCode: appliedPromotion?.code || "",
      };

      if (!isRoundTrip) {
        // One-way: just book outbound
        const res = await API.post("/tickets", payloadGo);
        toast.success(res.data.message || "Đặt vé thành công!");
      } else {
        // Round-trip: book outbound + return
        const resGo = await API.post("/tickets", payloadGo);
        toast.success(`Chiều đi: ${resGo.data.message}`);

        const payloadReturn = {
          trainId: returnTrainId,
          passengers: returnPassengers.map(p => ({
            name: p.passengerName,
            cccd: p.cccd,
            type: p.passengerType,
            coachNumber: p.coachNumber,
            seatNumber: p.seatNumber
          })),
          promotionCode: appliedPromotion?.code || "",
        };
        const resBack = await API.post("/tickets", payloadReturn);
        toast.success(`Chiều về: ${resBack.data.message}`);
      }

      navigate("/my-tickets");
    } catch (error) {
      console.error("BOOKING ERROR:", error);
      toast.error(error.response?.data?.message || "Đặt vé thất bại, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  if (!train) return <div className="rv-container">Đang tải...</div>;

  const activeTrain = isRoundTrip && bookingStep === 2 && returnTrain ? returnTrain : train;
  const activePassengers = isRoundTrip && bookingStep === 2 ? returnPassengers : passengers;
  const activeHandleSeatSelect = isRoundTrip && bookingStep === 2 ? handleReturnSeatSelect : handleSeatSelect;
  const activeUpdatePassenger = isRoundTrip && bookingStep === 2 ? updateReturnPassengerInfo : updatePassengerInfo;

  return (
    <div className="booking-page">
      <div className="rv-container">

        {isRoundTrip && (
          <div style={{ display: 'flex', gap: '0', marginBottom: '25px', borderBottom: '3px solid #eaeaea' }}>
            <button
              onClick={() => setBookingStep(1)}
              style={{ flex: 1, background: 'transparent', border: 'none', padding: '14px 20px', fontSize: '17px', fontWeight: 'bold', cursor: 'pointer', borderBottom: bookingStep === 1 ? '3px solid #c9503a' : '3px solid transparent', color: bookingStep === 1 ? '#c9503a' : '#888', transition: '0.2s' }}
            >
              Bước 1: Chiều đi ({train.from} → {train.to})
              {passengers.length > 0 && <span style={{ marginLeft: '8px', background: '#dff4e3', color: '#247046', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>✓ {passengers.length} ghế</span>}
            </button>
            <button
              onClick={() => { if (passengers.length > 0) setBookingStep(2); else toast.error('Vui lòng chọn ghế chiều đi trước'); }}
              style={{ flex: 1, background: 'transparent', border: 'none', padding: '14px 20px', fontSize: '17px', fontWeight: 'bold', cursor: 'pointer', borderBottom: bookingStep === 2 ? '3px solid #c9503a' : '3px solid transparent', color: bookingStep === 2 ? '#c9503a' : '#888', transition: '0.2s' }}
            >
              Bước 2: Chiều về ({returnTrain?.from || '...'} → {returnTrain?.to || '...'})
              {returnPassengers.length > 0 && <span style={{ marginLeft: '8px', background: '#dff4e3', color: '#247046', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>✓ {returnPassengers.length} ghế</span>}
            </button>
          </div>
        )}

        <div className="booking-card">
          <div className="booking-left">
            <h1 className="booking-title">{activeTrain.trainName || "Chuyến tàu"}</h1>
            <div className="booking-route">
              {activeTrain.from} → {activeTrain.to}
            </div>

            <div className="booking-info-grid">
              <div className="info-item">
                <span>Khởi hành</span>
                <strong>{activeTrain.departureTime}</strong>
              </div>

              <div className="info-item">
                <span>Đến nơi</span>
                <strong>{activeTrain.arrivalTime}</strong>
              </div>

              <div className="info-item">
                <span>Giá vé</span>
                <strong>{Number(activeTrain.price).toLocaleString("vi-VN")}đ</strong>
              </div>

              <div className="info-item">
                <span>Tổng ghế</span>
                <strong>{activeTrain.totalSeats}</strong>
              </div>
            </div>
          </div>

          <div className="booking-right">
            <h3>Thông tin đặt vé</h3>

            <div style={{ marginBottom: "20px" }}>
              <SeatMap train={activeTrain} onSeatSelect={activeHandleSeatSelect} key={activeTrain._id} />
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
                {activePassengers.length > 0 
                  ? activePassengers.map(p => `Toa số ${p.coachNumber} - Ghế số ${p.seatNumber}`).join(" | ")
                  : "Chưa chọn ghế (Vui lòng click vào sơ đồ)"}
              </div>

              {activePassengers.length > 0 && (
                <div style={{ maxHeight: "600px", overflowY: "auto", paddingRight: "10px", marginBottom: "20px" }}>
                  {activePassengers.map((p, index) => {
                    const base = Number(activeTrain.price) + p.extraPrice;
                    let rate = 0;
                    if (p.passengerType === "child") rate = 0.25;
                    else if (p.passengerType === "student") rate = 0.10;
                    else if (p.passengerType === "senior") rate = 0.15;
                    const pDiscount = Math.round(base * rate);
                    
                    return (
                      <div key={`${p.coachNumber}-${p.seatNumber}`} className="passenger-info-section" style={{ background: "#f8f9fa", padding: "15px", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "20px" }}>
                        <h4 style={{ margin: "0 0 15px 0", color: "#333", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                          👤 Hành khách #{index + 1} - Toa {p.coachNumber} Ghế {p.seatNumber}
                          <span style={{ fontSize: '13px', color: '#666', marginLeft: '10px', fontWeight: 'normal' }}>
                            ({p.extraPrice > 0 ? `+${p.extraPrice.toLocaleString()}đ phí toa` : 'Giá gốc'})
                          </span>
                        </h4>

                        <label>Họ và tên</label>
                        <input
                          type="text"
                          value={p.passengerName}
                          onChange={(e) => activeUpdatePassenger(index, "passengerName", e.target.value)}
                          placeholder="Nhập họ và tên người đi (Ví dụ: Nguyễn Văn A)"
                          required
                        />

                        <label>Số CCCD / Hộ chiếu</label>
                        <input
                          type="text"
                          value={p.cccd}
                          onChange={(e) => activeUpdatePassenger(index, "cccd", e.target.value)}
                          placeholder="Nhập số Căn cước / Hộ chiếu"
                          required
                        />

                        <label>Đối tượng đi tàu</label>
                        <select
                          value={p.passengerType}
                          onChange={(e) => {
                            activeUpdatePassenger(index, "passengerType", e.target.value);
                            setDiscountAmount(0);
                            setAppliedPromotion(null);
                          }}
                          style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc", marginBottom: "10px" }}
                        >
                          <option value="adult">Người lớn (Giá gốc)</option>
                          <option value="child">Trẻ em (Giảm 25%)</option>
                          <option value="student">Sinh viên (Giảm 10%)</option>
                          <option value="senior">Người cao tuổi (Giảm 15%)</option>
                        </select>

                        {pDiscount > 0 && (
                          <div style={{ color: "#c9503a", fontSize: "14px", fontWeight: "bold", marginTop: "5px" }}>
                            ⭐ Đối tượng này được giảm: -{pDiscount.toLocaleString("vi-VN")}đ
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

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
                  onClick={() => handleApplyPromotion()}
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
                  <strong>{totalPriceBeforeVoucher.toLocaleString("vi-VN")}đ</strong>
                </div>

                <div className="price-row">
                  <span>Giảm giá:</span>
                  <strong>- {discountAmount.toLocaleString("vi-VN")}đ</strong>
                </div>

                <div className="total-box price-row total">
                  <span>Thành tiền:</span>
                  <strong>{finalPrice.toLocaleString("vi-VN")}đ</strong>
                </div>
              </div>

              <div style={{ background: '#fff3cd', color: '#856404', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '15px', border: '1px solid #ffeeba' }}>
                ⏳ <strong>Lưu ý:</strong> Ghế bạn chọn sẽ được giữ trong <strong>10 phút</strong>. Vui lòng hoàn tất đặt vé và thanh toán trong thời gian này.
              </div>

              <button
                type="submit"
                className="confirm-booking-btn"
                disabled={loading || activePassengers.length === 0}
              >
                {loading ? "Đang đặt vé..." : (isRoundTrip && bookingStep === 1 ? "Tiếp tục → Chọn ghế chiều về" : "Xác nhận đặt vé")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Booking;