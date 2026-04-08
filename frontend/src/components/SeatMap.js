import { useState, useEffect } from "react";
import API from "../api/axios";

function SeatMap({ train, onSeatSelect }) {
  const [activeCoach, setActiveCoach] = useState(0);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookedSeats = async () => {
      if (!train || !train._id) return;
      try {
        setLoading(true);
        const res = await API.get(`/trains/${train._id}/booked-seats`);
        setBookedSeats(res.data);
      } catch (err) {
        console.error("Lỗi tải thông tin ghế:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookedSeats();
  }, [train]);

  if (!train || !train.coaches || train.coaches.length === 0) {
    return <div className="seat-map-empty">Chuyến tàu này chưa được thiết lập toa.</div>;
  }

  const currentCoach = train.coaches[activeCoach];

  const userString = localStorage.getItem("user");
  const currentUser = userString ? JSON.parse(userString) : null;

  // Helper function to check if a seat is booked (red)
  const isSeatBooked = (seatNum) => {
    return bookedSeats.some(
      (s) => 
        s.coachNumber === currentCoach.coachNumber && 
        s.seatNumber === seatNum.toString() &&
        !s.isLocked
    );
  };

  // Helper function to check if a seat is locked (yellow)
  const isSeatLocked = (seatNum) => {
    return bookedSeats.some(
      (s) => 
        s.coachNumber === currentCoach.coachNumber && 
        s.seatNumber === seatNum.toString() &&
        s.isLocked &&
        s.lockedBy !== currentUser?._id
    );
  };

  const handleSeatClick = async (seatNum) => {
    if (isSeatBooked(seatNum) || isSeatLocked(seatNum)) return;
    
    // Toggle selection
    if (selectedSeat === seatNum) {
      setSelectedSeat(null);
      onSeatSelect(null, null, 0); // clear
    } else {
      try {
        await API.post(`/trains/${train._id}/lock-seat`, { 
          coachNumber: currentCoach.coachNumber, 
          seatNumber: seatNum 
        });
        
        setSelectedSeat(seatNum);
        const extraPrice = Number(train.price) * (currentCoach.priceMultiplier - 1);
        onSeatSelect(currentCoach.coachNumber, seatNum, extraPrice);
      } catch (err) {
        alert(err.response?.data?.message || "Không thể giữ chỗ");
        // Reload seat map if someone else locked it
        try {
          const res = await API.get(`/trains/${train._id}/booked-seats`);
          setBookedSeats(res.data);
        } catch (e) {}
      }
    }
  };

  const renderSeats = () => {
    const seats = [];
    const capacity = currentCoach.capacity;
    
    // Hiển thị tuỳ theo loại toa
    if (currentCoach.coachType === "soft_seat") {
      for (let i = 1; i <= capacity; i++) {
        const booked = isSeatBooked(i);
        const locked = isSeatLocked(i);
        const selected = selectedSeat === i;
        
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
    } else if (currentCoach.coachType === "sleeper") {
      // Chia theo khoang (mỗi khoang 4 giường hoặc 6 giường tuỳ capacity)
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
          const selected = selectedSeat === seatNum;
          
          cabinSeats.push(
            <div 
              key={seatNum} 
              className={`seat-item sleeper ${booked ? 'booked' : ''} ${locked ? 'locked' : ''} ${selected ? 'selected' : ''}`}
              onClick={() => handleSeatClick(seatNum)}
              title={booked ? "Đã đặt" : locked ? "Đang thanh toán" : `Giường ${seatNum}`}
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
      <h3>Chọn Toa & Ghế</h3>
      
      <div className="coach-selector">
        {train.coaches.map((coach, index) => (
          <button 
            key={coach._id || index}
            type="button"
            className={`coach-btn ${activeCoach === index ? 'active' : ''}`}
            onClick={() => {
              setActiveCoach(index);
              setSelectedSeat(null); // clear selection when change coach
              onSeatSelect(null, null, 0); 
            }}
          >
            Toa {coach.coachNumber} <br/>
            <small>{coach.coachType === "soft_seat" ? "Ngồi mềm" : "Giường nằm"}</small>
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
        <div className="seat-loading">Đang tải sơ đồ toa...</div>
      ) : (
        <div className="seat-map-view">
          <div className="train-head-placeholder">Phần đầu tàu ⮜</div>
          {renderSeats()}
        </div>
      )}
    </div>
  );
}

export default SeatMap;
