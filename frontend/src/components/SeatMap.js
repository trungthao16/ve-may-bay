import { useState, useEffect } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

function SeatMap({ flight, onSeatSelect }) {
  const [activeCabin, setActiveCabin] = useState(0);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]); // Array: [{ cabinNumber, seatNumber, extraPrice }]
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookedSeats = async () => {
      if (!flight || !flight._id) return;
      try {
        setLoading(true);
        const res = await API.get(`/flights/${flight._id}/booked-seats`);
        setBookedSeats(res.data);
      } catch (err) {
        console.error("Lỗi tải thông tin ghế:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookedSeats();
  }, [flight]);

  if (!flight || !flight.cabins || flight.cabins.length === 0) {
    return <div className="seat-map-empty">Chuyến bay này chưa được thiết lập khoang.</div>;
  }

  const currentCabin = flight.cabins[activeCabin];

  const userString = localStorage.getItem("user");
  const currentUser = userString ? JSON.parse(userString) : null;

  // Helper function to check if a seat is booked (red)
  const isSeatBooked = (seatNum) => {
    return bookedSeats.some(
      (s) => 
        s.cabinNumber === currentCabin.cabinNumber && 
        s.seatNumber === seatNum.toString() &&
        !s.isLocked
    );
  };

  // Helper function to check if a seat is locked (yellow)
  const isSeatLocked = (seatNum) => {
    return bookedSeats.some(
      (s) => 
        s.cabinNumber === currentCabin.cabinNumber && 
        s.seatNumber === seatNum.toString() &&
        s.isLocked &&
        s.lockedBy !== currentUser?._id
    );
  };

  const isSeatSelected = (seatNum) => {
    return selectedSeats.some(
      (s) => s.cabinNumber === currentCabin.cabinNumber && s.seatNumber === seatNum.toString()
    );
  };

  const handleSeatClick = async (seatNum) => {
    if (isSeatBooked(seatNum) || isSeatLocked(seatNum)) return;
    
    const seatStr = seatNum.toString();
    const isAlreadySelected = isSeatSelected(seatNum);

    if (isAlreadySelected) {
      // Bỏ chọn
      const newSelected = selectedSeats.filter(
        (s) => !(s.cabinNumber === currentCabin.cabinNumber && s.seatNumber === seatStr)
      );
      setSelectedSeats(newSelected);
      onSeatSelect(newSelected);
      
      // Optional: Unlock on server if you want
      // await API.post(`/flights/${flight._id}/unlock-seat`, { cabinNumber: currentCabin.cabinNumber, seatNumber: seatStr });
    } else {
      // Chọn mới
      try {
        await API.post(`/flights/${flight._id}/lock-seat`, { 
          cabinNumber: currentCabin.cabinNumber, 
          seatNumber: seatStr 
        });
        
        const extraPrice = Number(flight.price) * (currentCabin.priceMultiplier - 1);
        const newSeat = {
          cabinNumber: currentCabin.cabinNumber,
          seatNumber: seatStr,
          extraPrice: extraPrice,
          cabinType: currentCabin.cabinType
        };
        
        const newSelected = [...selectedSeats, newSeat];
        setSelectedSeats(newSelected);
        onSeatSelect(newSelected);
      } catch (err) {
        toast.error(err.response?.data?.message || "Không thể giữ chỗ");
        // Reload seat map
        try {
          const res = await API.get(`/flights/${flight._id}/booked-seats`);
          setBookedSeats(res.data);
        } catch (e) {}
      }
    }
  };

  const renderSeats = () => {
    const seats = [];
    const capacity = currentCabin.capacity;
    
    if (currentCabin.cabinType === "economy") {
      for (let i = 1; i <= capacity; i++) {
        const booked = isSeatBooked(i);
        const locked = isSeatLocked(i);
        const selected = isSeatSelected(i);
        
        seats.push(
          <div 
            key={i} 
            className={`seat-item ${booked ? 'booked' : ''} ${locked ? 'locked' : ''} ${selected ? 'selected' : ''}`}
            onClick={() => handleSeatClick(i)}
            title={booked ? "Ghế đã đặt" : locked ? "Đang có người thanh toán" : `Ghế số ${i}`}
          >
            {i}
          </div>
        );
      }
      return <div className="seat-grid soft-seat">{seats}</div>;
    } else if (currentCabin.cabinType === "business") {
      const bedsPerCabin = capacity > 30 ? 6 : 4;
      const totalCabins = Math.ceil(capacity / bedsPerCabin);
      
      const cabins = [];
      for (let c = 0; c < totalCabins; c++) {
        const cabinSeats = [];
        for (let b = 1; b <= bedsPerCabin; b++) {
          const seatNum = c * bedsPerCabin + b;
          if (seatNum > capacity) break;
          
          const booked = isSeatBooked(seatNum);
          const locked = isSeatLocked(seatNum);
          const selected = isSeatSelected(seatNum);
          
          cabinSeats.push(
            <div 
              key={seatNum} 
              className={`seat-item sleeper ${booked ? 'booked' : ''} ${locked ? 'locked' : ''} ${selected ? 'selected' : ''}`}
              onClick={() => handleSeatClick(seatNum)}
              title={booked ? "Đã đặt" : locked ? "Đang thanh toán" : `Chỗ ${seatNum}`}
            >
              {seatNum}
            </div>
          );
        }
        
        cabins.push(
          <div key={c} className="cabin-box">
            <div className="cabin-title">Khoang {c + 1}</div>
            <div className={`cabin-beds beds-${bedsPerCabin}`}>
              {cabinSeats}
            </div>
          </div>
        );
      }
      return <div className="seat-grid sleeper-cabins">{cabins}</div>;
    }
  };

  return (
    <div className="seat-map-container">
      <h3>Chọn Khoang & Chỗ (Bạn có thể chọn nhiều chỗ)</h3>
      
      <div className="coach-selector">
        {flight.cabins.map((cabin, index) => (
          <button 
            key={cabin._id || index}
            type="button"
            className={`coach-btn ${activeCabin === index ? 'active' : ''}`}
            onClick={() => setActiveCabin(index)}
          >
            Khoang {cabin.cabinNumber} <br/>
            <small>{cabin.cabinType === "economy" ? "Hạng Phổ Thông" : "Hạng Thương Gia"}</small>
          </button>
        ))}
      </div>

      <div className="seat-legend">
        <div className="legend-item"><span className="legend-color avail"></span> Còn trống</div>
        <div className="legend-item"><span className="legend-color booked"></span> Đã đặt</div>
        <div className="legend-item"><span className="legend-color locked" style={{backgroundColor: "#f59e0b"}}></span> Đang giữ chỗ</div>
        <div className="legend-item"><span className="legend-color selected"></span> Đang chọn</div>
      </div>

      {loading ? (
        <div className="seat-loading">Đang tải sơ đồ khoang...</div>
      ) : (
        <div className="seat-map-view">
          <div className="train-head-placeholder">Phần đầu máy bay ✈</div>
          {renderSeats()}
        </div>
      )}
    </div>
  );
}

export default SeatMap;
