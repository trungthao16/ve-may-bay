import { useEffect, useMemo, useRef, useState } from "react";
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

  const [selectedOutbound, setSelectedOutbound] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);

  const [airports, setAirports] = useState([]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const fromRef = useRef(null);
  const toRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fromRef.current && !fromRef.current.contains(event.target)) {
        setShowFromDropdown(false);
      }

      if (toRef.current && !toRef.current.contains(event.target)) {
        setShowToDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const res = await API.get("/flights/airports");
        setAirports(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Lỗi lấy danh sách sân bay:", error);
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
        const nextOutboundFlights = Array.isArray(resGo.data) ? resGo.data : [];

        let nextReturnFlights = [];
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
          nextReturnFlights = Array.isArray(resBack.data) ? resBack.data : [];
        }

        setOutboundFlights(nextOutboundFlights);
        setReturnFlights(nextReturnFlights);
        setSearchFrom(initialFrom);
        setSearchTo(initialTo);
        setSearchDate(initialDate);
        setSearchTripType(initialTripType);
        setSearchReturnDate(initialReturnDate);
        setSearchGroupSize(initialGroupSize);
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
  }, [initialDate, initialFrom, initialGroupSize, initialReturnDate, initialTo, initialTripType]);

  const filteredFromAirports = useMemo(
    () => airports.filter((airport) => airport.toLowerCase().includes(searchFrom.toLowerCase())),
    [airports, searchFrom]
  );

  const filteredToAirports = useMemo(
    () => airports.filter((airport) => airport.toLowerCase().includes(searchTo.toLowerCase())),
    [airports, searchTo]
  );

  const handleSearch = (event) => {
    event.preventDefault();

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

    navigate(`/flights?${new URLSearchParams(params).toString()}`);
  };

  const handleTripTypeChange = (value) => {
    setSearchTripType(value);

    const params = {
      from: searchFrom,
      to: searchTo,
      date: searchDate,
      tripType: value,
    };

    if (value === "roundtrip") {
      params.returnDate = searchReturnDate;
    }

    if (value === "group") {
      params.groupSize = searchGroupSize;
    }

    navigate(`/flights?${new URLSearchParams(params).toString()}`);
  };

  const swapStations = () => {
    setSearchFrom(searchTo);
    setSearchTo(searchFrom);
  };

  const sortFlights = (flightList) =>
    [...flightList].sort((a, b) => {
      const dateA = new Date(a.departureDate || 0);
      const dateB = new Date(b.departureDate || 0);

      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }

      if (sortBy === "price-asc") return (a.price || 0) - (b.price || 0);
      if (sortBy === "price-desc") return (b.price || 0) - (a.price || 0);
      if (sortBy === "time-asc") return (a.departureTime || "").localeCompare(b.departureTime || "");
      if (sortBy === "time-desc") return (b.departureTime || "").localeCompare(a.departureTime || "");
      return 0;
    });

  const renderAirportDropdown = (items, onSelect) => (
    <div className="airport-dropdown">
      {items.length > 0 ? (
        items.map((airport) => (
          <button
            key={airport}
            type="button"
            className="airport-dropdown__item"
            onClick={() => onSelect(airport)}
          >
            {airport}
          </button>
        ))
      ) : (
        <div className="airport-dropdown__empty">Không tìm thấy sân bay phù hợp</div>
      )}
    </div>
  );

  const renderFlightCard = (flight, isReturn = false) => {
    const total = flight.totalSeats || flight.seats || 0;
    const available = flight.availableSeats !== undefined ? flight.availableSeats : total;
    const isSelected = isReturn ? selectedReturn === flight._id : selectedOutbound === flight._id;

    let badgeText = "Còn chỗ";
    let badgeClass = "flight-badge";

    if (available <= 0) {
      badgeText = "Hết chỗ";
      badgeClass = "flight-badge flight-badge--soldout";
    } else if (available <= 10) {
      badgeText = "Sắp đầy";
      badgeClass = "flight-badge flight-badge--limited";
    }

    return (
      <div className={`flight-card ${isSelected ? "flight-card--selected" : ""}`} key={flight._id}>
        <div className="flight-top">
          <div>
            <span className={badgeClass}>{badgeText}</span>
            <h3>{flight.flightNumber || flight.name || "Chuyến bay"}</h3>
          </div>
          <div className="flight-price">{Number(flight.price || 0).toLocaleString("vi-VN")}đ</div>
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
            <strong>
              {available} / {total}
            </strong>
          </div>
        </div>

        {initialTripType === "roundtrip" ? (
          <button
            className={`book-btn ${isSelected ? "book-btn--selected" : ""}`}
            disabled={available <= 0}
            onClick={() => {
              if (isReturn) {
                setSelectedReturn(flight._id);
              } else {
                setSelectedOutbound(flight._id);
              }
            }}
          >
            {available <= 0
              ? "Đã bán hết"
              : isSelected
                ? "Đã chọn"
                : isReturn
                  ? "Chọn chiều về"
                  : "Chọn chiều đi"}
          </button>
        ) : (
          <button
            className="book-btn"
            disabled={available <= 0}
            onClick={() => navigate(`/booking/${flight._id}`)}
          >
            {available <= 0 ? "Đã bán hết" : "Đặt chỗ ngay"}
          </button>
        )}
      </div>
    );
  };

  const chosenOutbound = outboundFlights.find((item) => item._id === selectedOutbound);

  const filteredReturnFlights = useMemo(() => {
    if (!chosenOutbound) {
      return [];
    }

    let earliestReturnTime = null;

    if (chosenOutbound.departureDate) {
      const outboundDate = new Date(chosenOutbound.departureDate);
      const [arriveHour, arriveMinute] = (chosenOutbound.arrivalTime || "23:59")
        .split(":")
        .map(Number);
      earliestReturnTime = new Date(outboundDate);
      earliestReturnTime.setHours(arriveHour + 3, arriveMinute, 0, 0);
    }

    return returnFlights.filter((flight) => {
      const matchRoute =
        flight.from === (chosenOutbound.to || initialTo) &&
        flight.to === (chosenOutbound.from || initialFrom);

      if (!matchRoute) {
        return false;
      }

      if (!earliestReturnTime || !flight.departureDate) {
        return true;
      }

      const returnDate = new Date(flight.departureDate);
      const [returnHour, returnMinute] = (flight.departureTime || "00:00").split(":").map(Number);
      returnDate.setHours(returnHour, returnMinute, 0, 0);

      return returnDate >= earliestReturnTime;
    });
  }, [chosenOutbound, initialFrom, initialTo, returnFlights]);

  return (
    <div className="flightlist-page">
      <div className="rv-container flightlist-wrap">
        <div className="search-box search-box--spaced">
          <form className="flightlist-search-form" onSubmit={handleSearch}>
            <div className="field">
              <label>Loại vé</label>
              <select value={searchTripType} onChange={(e) => handleTripTypeChange(e.target.value)}>
                <option value="oneway">Một chiều</option>
                <option value="roundtrip">Khứ hồi</option>
                <option value="group">Đoàn</option>
              </select>
            </div>

            <div className="field field--relative" ref={fromRef}>
              <label>Sân bay đi</label>
              <input
                type="text"
                value={searchFrom}
                onChange={(e) => {
                  setSearchFrom(e.target.value);
                  setShowFromDropdown(true);
                }}
                onFocus={() => setShowFromDropdown(true)}
                placeholder="Nhập hoặc chọn sân bay đi..."
                autoComplete="off"
              />
              {showFromDropdown &&
                renderAirportDropdown(filteredFromAirports, (airport) => {
                  setSearchFrom(airport);
                  setShowFromDropdown(false);
                })}
            </div>

            <button
              type="button"
              className="swap-btn"
              onClick={swapStations}
              aria-label="Đổi sân bay đi và sân bay đến"
            >
              ⇄
            </button>

            <div className="field field--relative" ref={toRef}>
              <label>Sân bay đến</label>
              <input
                type="text"
                value={searchTo}
                onChange={(e) => {
                  setSearchTo(e.target.value);
                  setShowToDropdown(true);
                }}
                onFocus={() => setShowToDropdown(true)}
                placeholder="Nhập hoặc chọn sân bay đến..."
                autoComplete="off"
              />
              {showToDropdown &&
                renderAirportDropdown(filteredToAirports, (airport) => {
                  setSearchTo(airport);
                  setShowToDropdown(false);
                })}
            </div>

            <div className="field">
              <label>Ngày đi</label>
              <input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} />
            </div>

            {searchTripType === "roundtrip" && (
              <div className="field">
                <label>Ngày về</label>
                <input
                  type="date"
                  value={searchReturnDate}
                  onChange={(e) => setSearchReturnDate(e.target.value)}
                />
              </div>
            )}

            {searchTripType === "group" && (
              <div className="field">
                <label>Số người</label>
                <input
                  type="number"
                  value={searchGroupSize}
                  onChange={(e) => setSearchGroupSize(e.target.value)}
                  placeholder="VD: 20"
                />
              </div>
            )}

            <button type="submit" className="search-btn">
              Tìm kiếm
            </button>
          </form>
        </div>

        <div className="flightlist-header flightlist-header--split">
          <div>
            <p className="section-label">Kết quả tìm kiếm</p>
            <h1 className="flightlist-title">Danh sách chuyến bay</h1>
          </div>
          <div className="field flightlist-sort-field">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="time-asc">Giờ đi sớm nhất</option>
              <option value="time-desc">Giờ đi muộn nhất</option>
              <option value="price-asc">Giá từ thấp đến cao</option>
              <option value="price-desc">Giá từ cao đến thấp</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="empty-box empty-box--loading">
            <div className="loading-spinner"></div>
            <p>Đang tải dữ liệu chuyến bay...</p>
          </div>
        ) : (
          <>
            {(!initialTripType || initialTripType !== "roundtrip" || !selectedOutbound) && (
              <>
                <h2 className="flightlist-step-title">
                  {initialTripType === "roundtrip" ? "Bước 1: " : ""}
                  Chuyến đi ({initialFrom || "Tất cả"} → {initialTo || "Tất cả"})
                </h2>

                {outboundFlights.length === 0 ? (
                  <div className="empty-box">Không có chuyến đi phù hợp.</div>
                ) : (
                  <div className="flight-grid">
                    {sortFlights(outboundFlights).map((flight) => renderFlightCard(flight))}
                  </div>
                )}
              </>
            )}

            {initialTripType === "roundtrip" && selectedOutbound && (
              <>
                <div className="flightlist-step-toolbar">
                  <button
                    type="button"
                    className="flightlist-step-back"
                    onClick={() => {
                      setSelectedOutbound(null);
                      setSelectedReturn(null);
                      window.scrollTo({ top: 300, behavior: "smooth" });
                    }}
                  >
                    ← Quay lại chọn chiều đi
                  </button>
                  <div className="flightlist-selected-summary">
                    Chiều đi: {chosenOutbound?.flightNumber} ({chosenOutbound?.from} → {chosenOutbound?.to}) -{" "}
                    {chosenOutbound?.departureTime}
                  </div>
                </div>

                <h2 className="flightlist-step-title">
                  Bước 2: Chuyến về ({chosenOutbound?.to || "Tất cả"} → {chosenOutbound?.from || "Tất cả"})
                </h2>

                {filteredReturnFlights.length === 0 ? (
                  <div className="empty-box">
                    Không có chuyến về phù hợp từ {chosenOutbound?.to} về {chosenOutbound?.from}.
                  </div>
                ) : (
                  <div className="flight-grid">
                    {sortFlights(filteredReturnFlights).map((flight) => renderFlightCard(flight, true))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {initialTripType === "roundtrip" && (selectedOutbound || selectedReturn) && (
        <div className="booking-progress-bar">
          <div>
            <p className="booking-progress-bar__title">Tiến trình đặt vé khứ hồi</p>
            <p className="booking-progress-bar__text">
              Chiều đi: {selectedOutbound ? "Đã chọn" : "Chưa chọn"} | Chiều về:{" "}
              {selectedReturn ? "Đã chọn" : "Chưa chọn"}
            </p>
          </div>
          <button
            className="book-btn booking-progress-bar__button"
            disabled={!selectedOutbound || !selectedReturn}
            onClick={() => {
              if (selectedOutbound && selectedReturn) {
                navigate(`/booking/${selectedOutbound}?returnFlightId=${selectedReturn}`);
              }
            }}
          >
            Đến trang đặt vé
          </button>
        </div>
      )}
    </div>
  );
}

export default FlightList;
