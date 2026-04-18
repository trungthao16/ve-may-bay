import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";

function FlightList() {
  const location = useLocation();
  const navigate = useNavigate();

  const query = new URLSearchParams(location.search);
  const initialFrom = query.get("from") || "";
  const initialTo = query.get("to") || "";
  const initialDate = query.get("date") || "";
  const initialTripType = query.get("tripType") || "oneway";
  const initialReturnDate = query.get("returnDate") || "";
  const initialGroupSize = query.get("groupSize") || "";

  const [searchFrom, setSearchFrom] = useState(initialFrom);
  const [searchTo, setSearchTo] = useState(initialTo);
  const [searchDate, setSearchDate] = useState(initialDate);
  const [searchTripType, setSearchTripType] = useState(initialTripType);
  const [searchReturnDate, setSearchReturnDate] = useState(initialReturnDate);
  const [searchGroupSize, setSearchGroupSize] = useState(initialGroupSize);

  const [outboundFlights, setOutboundFlights] = useState([]);
  const [returnFlights, setReturnFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("time-asc");

  // State for roundtrip selection
  const [selectedOutbound, setSelectedOutbound] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);

  const [airports, setAirports] = useState([]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const fromRef = useRef(null);
  const toRef = useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (fromRef.current && !fromRef.current.contains(e.target)) setShowFromDropdown(false);
      if (toRef.current && !toRef.current.contains(e.target)) setShowToDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch danh sách sân bay từ DB
  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const res = await API.get("/flights/airports");
        setAirports(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Lỗi lấy danh sách sân bay:", err);
      }
    };
    fetchAirports();
  }, []);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        setLoading(true);

        const paramsGo = {
          from: initialFrom,
          to: initialTo,
          date: initialDate,
          tripType: initialTripType,
          groupSize: initialGroupSize,
        };

        const resGo = await API.get("/flights/search", { params: paramsGo });
        let finalGoTrips = Array.isArray(resGo.data) ? resGo.data : [];

        let backTrips = [];
        if (initialTripType === "roundtrip") {
          const paramsBack = {
            from: initialTo,
            to: initialFrom,
            tripType: initialTripType,
            groupSize: initialGroupSize,
          };
          if (initialReturnDate) {
            paramsBack.date = initialReturnDate;
          }
          const resBack = await API.get("/flights/search", { params: paramsBack });
          backTrips = Array.isArray(resBack.data) ? resBack.data : [];
        }

        setOutboundFlights(finalGoTrips);
        setReturnFlights(backTrips);

        setSearchFrom(initialFrom);
        setSearchTo(initialTo);
        setSearchDate(initialDate);
        setSearchTripType(initialTripType);
        setSearchReturnDate(initialReturnDate);
        setSearchGroupSize(initialGroupSize);

        // Reset selection when search changes
        setSelectedOutbound(null);
        setSelectedReturn(null);

      } catch (error) {
        console.error("Lỗi lấy danh sách chuyến bay:", error);
        setOutboundFlights([]);
        setReturnFlights([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [initialFrom, initialTo, initialDate, initialReturnDate, initialTripType, initialGroupSize]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {
      from: searchFrom,
      to: searchTo,
      date: searchDate,
      tripType: searchTripType,
    };

    if (searchTripType === "roundtrip") {
      params.returnDate = searchReturnDate;
    }
    if (searchTripType === "group") {
      params.groupSize = searchGroupSize;
    }

    const queryString = new URLSearchParams(params).toString();
    navigate(`/flights?${queryString}`);
  };

  const swapStations = () => {
    const temp = searchFrom;
    setSearchFrom(searchTo);
    setSearchTo(temp);
  };

  const sortFlights = (flightList) => {
    return [...flightList].sort((a, b) => {
      // Luôn sắp xếp theo ngày khởi hành trước (ngày gần nhất lên đầu)
      const dateA = new Date(a.departureDate || 0);
      const dateB = new Date(b.departureDate || 0);
      if (dateA.getTime() !== dateB.getTime()) return dateA - dateB;

      // Cùng ngày thì sắp theo tiêu chí người dùng chọn
      if (sortBy === "price-asc") return (a.price || 0) - (b.price || 0);
      if (sortBy === "price-desc") return (b.price || 0) - (a.price || 0);
      if (sortBy === "time-asc") return (a.departureTime || "").localeCompare(b.departureTime || "");
      if (sortBy === "time-desc") return (b.departureTime || "").localeCompare(a.departureTime || "");
      return 0;
    });
  };

  const renderFlightCard = (flight, isReturn = false) => {
    const total = flight.totalSeats || flight.seats || 0;
    const avail = flight.availableSeats !== undefined ? flight.availableSeats : total;

    let badgeText = "Còn chỗ";
    let badgeColor = "#28a745"; // xanh lá

    if (avail <= 0) {
      badgeText = "Hết chỗ";
      badgeColor = "#dc3545"; // đỏ
    } else if (avail <= 10) {
      badgeText = "Sắp đầy";
      badgeColor = "#fd7e14"; // cam
    }

    const isSelected = isReturn ? selectedReturn === flight._id : selectedOutbound === flight._id;

    return (
      <div className="flight-card" key={flight._id} style={isSelected ? { border: '2px solid #4ca37d', background: '#f5fff9', boxShadow: '0 4px 15px rgba(76, 163, 125, 0.2)' } : {}}>
        <div className="flight-top">
          <div>
            <span className="flight-badge" style={{ backgroundColor: badgeColor }}>
              {badgeText}
            </span>
            <h3>{flight.flightNumber || flight.name || "Chuyến bay"}</h3>
          </div>
          <div className="flight-price">
            {Number(flight.price || 0).toLocaleString("vi-VN")}đ
          </div>
        </div>

        <div className="flight-route">
          <div>
            <p>Sân bay đi</p>
            <h4>{flight.from || "Chưa có"}</h4>
          </div>
          <div className="route-arrow">→</div>
          <div>
            <p>Sân bay đến</p>
            <h4>{flight.to || "Chưa có"}</h4>
          </div>
        </div>

        <div className="flight-meta">
          <div>
            <span>Khởi hành</span>
            <strong>
              {flight.departureDate
                ? new Date(flight.departureDate).toLocaleDateString("vi-VN")
                : "Chưa có"}
            </strong>
          </div>

          <div>
            <span>Giờ bay</span>
            <strong>{flight.departureTime || "Chưa có"}</strong>
          </div>

          <div>
            <span>Hạ cánh</span>
            <strong>{flight.arrivalTime || "Chưa có"}</strong>
          </div>

          <div>
            <span>Ghế trống</span>
            <strong>{avail} / {total}</strong>
          </div>
        </div>

        {initialTripType === "roundtrip" ? (
          <button
            className="book-btn"
            disabled={avail <= 0}
            style={{
              opacity: avail <= 0 ? 0.6 : 1,
              cursor: avail <= 0 ? "not-allowed" : "pointer",
              background: isSelected ? '#fff' : '',
              color: isSelected ? '#4ca37d' : '',
              border: isSelected ? '1px solid #4ca37d' : ''
            }}
            onClick={() => {
              if (isReturn) setSelectedReturn(flight._id);
              else setSelectedOutbound(flight._id);
            }}
          >
            {avail <= 0 ? "Đã bán hết" : isSelected ? "Đã Chọn" : (isReturn ? "Chọn Chiều Về" : "Chọn Chiều Đi")}
          </button>
        ) : (
          <button
            className="book-btn"
            disabled={avail <= 0}
            style={{ opacity: avail <= 0 ? 0.6 : 1, cursor: avail <= 0 ? "not-allowed" : "pointer" }}
            onClick={() => navigate(`/booking/${flight._id}`)}
          >
            {avail <= 0 ? "Đã bán hết" : "Đặt chỗ ngay"}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="FlightList-page">

      <div className="rv-container FlightList-wrap">
        <div className="search-box" style={{ marginBottom: "40px" }}>
          <form className="flightlist-search-form" onSubmit={handleSearch}>
            <div className="field">
              <label>Loại vé</label>
              <select value={searchTripType} onChange={(e) => {
                 const newType = e.target.value;
                 setSearchTripType(newType);
                 
                 const params = {
                   from: searchFrom,
                   to: searchTo,
                   date: searchDate,
                   tripType: newType,
                 };
                 if (newType === "roundtrip") params.returnDate = searchReturnDate;
                 if (newType === "group") params.groupSize = searchGroupSize;
                 navigate(`/flights?${new URLSearchParams(params).toString()}`);
              }}>
                <option value="oneway">Một chiều</option>
                <option value="roundtrip">Khứ hồi</option>
                <option value="group">Đoàn</option>
              </select>
            </div>

            <div className="field" ref={fromRef} style={{ position: 'relative' }}>
              <label>Sân bay đi</label>
              <input
                type="text"
                value={searchFrom}
                onChange={(e) => { setSearchFrom(e.target.value); setShowFromDropdown(true); }}
                onFocus={() => setShowFromDropdown(true)}
                placeholder="Nhập hoặc chọn sân bay đi..."
                autoComplete="off"
              />
              {showFromDropdown && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: '0 0 8px 8px', maxHeight: '200px', overflowY: 'auto', zIndex: 999, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  {airports.filter(s => s.toLowerCase().includes(searchFrom.toLowerCase())).map(s => (
                    <div
                      key={s}
                      onClick={() => { setSearchFrom(s); setShowFromDropdown(false); }}
                      style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '14px', borderBottom: '1px solid #f0f0f0' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f5f0eb'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                    >
                      {s}
                    </div>
                  ))}
                  {airports.filter(s => s.toLowerCase().includes(searchFrom.toLowerCase())).length === 0 && (
                    <div style={{ padding: '10px 14px', color: '#999', fontSize: '13px' }}>Không tìm thấy sân bay phù hợp</div>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              className="swap-btn"
              onClick={swapStations}
              aria-label="Đổi sân bay đi và sân bay đến"
            >
              ⇄
            </button>

            <div className="field" ref={toRef} style={{ position: 'relative' }}>
              <label>Sân bay đến</label>
              <input
                type="text"
                value={searchTo}
                onChange={(e) => { setSearchTo(e.target.value); setShowToDropdown(true); }}
                onFocus={() => setShowToDropdown(true)}
                placeholder="Nhập hoặc chọn sân bay đến..."
                autoComplete="off"
              />
              {showToDropdown && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: '0 0 8px 8px', maxHeight: '200px', overflowY: 'auto', zIndex: 999, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  {airports.filter(s => s.toLowerCase().includes(searchTo.toLowerCase())).map(s => (
                    <div
                      key={s}
                      onClick={() => { setSearchTo(s); setShowToDropdown(false); }}
                      style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '14px', borderBottom: '1px solid #f0f0f0' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f5f0eb'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                    >
                      {s}
                    </div>
                  ))}
                  {airports.filter(s => s.toLowerCase().includes(searchTo.toLowerCase())).length === 0 && (
                    <div style={{ padding: '10px 14px', color: '#999', fontSize: '13px' }}>Không tìm thấy sân bay phù hợp</div>
                  )}
                </div>
              )}
            </div>

            <div className="field">
              <label>Ngày đi</label>
              <input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} />
            </div>

            {searchTripType === "roundtrip" && (
              <div className="field">
                <label>Ngày về</label>
                <input type="date" value={searchReturnDate} onChange={(e) => setSearchReturnDate(e.target.value)} />
              </div>
            )}

            {searchTripType === "group" && (
              <div className="field">
                <label>Số người</label>
                <input type="number" value={searchGroupSize} onChange={(e) => setSearchGroupSize(e.target.value)} placeholder="VD: 20" />
              </div>
            )}

            <button type="submit" className="search-btn">
              Tìm Kiếm
            </button>
          </form>
        </div>

        <div className="FlightList-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <p className="section-label">Kết quả tìm kiếm</p>
            <h1 className="FlightList-title">Danh sách chuyến bay</h1>
          </div>
          <div className="field" style={{ minWidth: "220px", marginBottom: "0" }}>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="time-asc">Giờ đi sớm nhất</option>
              <option value="time-desc">Giờ đi muộn nhất</option>
              <option value="price-asc">Giá từ thấp đến cao</option>
              <option value="price-desc">Giá từ cao đến thấp</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="empty-box">
            <div className="loading-spinner"></div>
            <p>Đang tải dữ liệu chuyến bay...</p>
          </div>
        ) : (
          <>
            {/* BƯỚC 1: Hiển thị chuyến đi (khi chưa chọn hoặc không phải roundtrip) */}
            {(!initialTripType || initialTripType !== "roundtrip" || !selectedOutbound) && (
              <>
                <h2 style={{ marginBottom: "12px" }}>
                  {initialTripType === "roundtrip" ? "Bước 1: " : ""}Chuyến đi ({initialFrom || "Tất cả"} → {initialTo || "Tất cả"})
                </h2>

                {outboundFlights.length === 0 ? (
                  <div className="empty-box">Không có chuyến đi phù hợp.</div>
                ) : (
                  <div className="flight-grid">
                    {sortFlights(outboundFlights).map((flight) => renderFlightCard(flight, false))}
                  </div>
                )}
              </>
            )}

            {/* BƯỚC 2: Hiển thị chuyến về (khi đã chọn chuyến đi trong roundtrip) */}
            {initialTripType === "roundtrip" && selectedOutbound && (() => {
              const chosenOutbound = outboundFlights.find(t => t._id === selectedOutbound);
              
              // Tính thời điểm sớm nhất có thể về = ngày đi + giờ đến + 3 tiếng
              let earliestReturnTime = null;
              if (chosenOutbound?.departureDate) {
                const outDate = new Date(chosenOutbound.departureDate);
                const [arrH, arrM] = (chosenOutbound.arrivalTime || "23:59").split(":").map(Number);
                earliestReturnTime = new Date(outDate);
                earliestReturnTime.setHours(arrH + 3, arrM, 0, 0); // +3 tiếng sau giờ đến
              }

              const filteredReturn = returnFlights.filter(t => {
                const matchRoute = t.from === (chosenOutbound?.to || initialTo) && 
                                   t.to === (chosenOutbound?.from || initialFrom);
                if (!matchRoute) return false;
                if (!earliestReturnTime || !t.departureDate) return true;

                const retDate = new Date(t.departureDate);
                const [retH, retM] = (t.departureTime || "00:00").split(":").map(Number);
                const retDateTime = new Date(retDate);
                retDateTime.setHours(retH, retM, 0, 0);

                return retDateTime >= earliestReturnTime;
              });

              return (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => { setSelectedOutbound(null); setSelectedReturn(null); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                      style={{ background: '#fff', border: '1px solid #c9503a', color: '#c9503a', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      ← Quay lại chọn chiều đi
                    </button>
                    <div style={{ background: '#dff4e3', color: '#247046', padding: '8px 14px', borderRadius: '10px', fontSize: '14px', fontWeight: '600' }}>
                      ✓ Chiều đi: {chosenOutbound?.flightNumber} ({chosenOutbound?.from} → {chosenOutbound?.to}) - {chosenOutbound?.departureTime}
                    </div>
                  </div>

                  <h2 style={{ marginBottom: "12px" }}>
                    Bước 2: Chuyến về ({chosenOutbound?.to || "Tất cả"} → {chosenOutbound?.from || "Tất cả"})
                  </h2>

                  {filteredReturn.length === 0 ? (
                    <div className="empty-box">Không có chuyến về phù hợp từ {chosenOutbound?.to} về {chosenOutbound?.from}.</div>
                  ) : (
                    <div className="train-grid">
                      {sortFlights(filteredReturn).map((flight) => renderFlightCard(flight, true))}
                    </div>
                  )}
                </>
              );
            })()}
          </>
        )}
      </div>

      {initialTripType === "roundtrip" && (selectedOutbound || selectedReturn) && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fff',
          padding: '15px 30px',
          boxShadow: '0 -4px 15px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Tiến trình Đặt vé Khứ hồi</p>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
              Chiều đi: {selectedOutbound ? "Đã chọn" : "Chưa chọn"} | Chiều về: {selectedReturn ? "Đã chọn" : "Chưa chọn"}
            </p>
          </div>
          <button
            className="book-btn"
            disabled={!selectedOutbound || !selectedReturn}
            style={{ opacity: (!selectedOutbound || !selectedReturn) ? 0.6 : 1, padding: '12px 30px', fontSize: '16px' }}
            onClick={() => {
              if (selectedOutbound && selectedReturn) {
                navigate(`/booking/${selectedOutbound}?returnTrainId=${selectedReturn}`);
              }
            }}
          >
            Đến trang Đặt Vé
          </button>
        </div>
      )}
    </div>
  );
}

export default FlightList;
