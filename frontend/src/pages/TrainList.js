import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";

function TrainList() {
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

  const [outboundTrains, setOutboundTrains] = useState([]);
  const [returnTrains, setReturnTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("time-asc");

  const stations = [
    // Tuyến đường sắt Thống Nhất (Bắc - Nam)
    "Hà Nội", "TP Hồ Chí Minh", "Phủ Lý", "Nam Định", "Ninh Bình", "Bỉm Sơn", "Thanh Hóa", "Minh Khôi",
    "Chợ Sy", "Vinh", "Yên Trung", "Hương Phố", "Đồng Lê", "Đồng Hới", "Đông Hà",
    "Huế", "Lăng Cô", "Đà Nẵng", "Trà Kiệu", "Phú Cang", "Tam Kỳ", "Núi Thành",
    "Quảng Ngãi", "Đức Phổ", "Bồng Sơn", "Diêu Trì", "Tuy Hòa", "Giã", "Ninh Hòa",
    "Nha Trang", "Ngã Ba", "Tháp Chàm", "Sông Mao", "Ma Lâm", "Bình Thuận",
    "Suối Kiết", "Long Khánh", "Biên Hòa", "Dĩ An",

    // Tuyến phía Bắc (Hà Nội - Lào Cai)
    "Phủ Đức", "Việt Trì", "Vĩnh Yên", "Yên Bái", "Lào Cai",

    // Tuyến phía Bắc (Hà Nội - Lạng Sơn)
    "Bắc Giang", "Lạng Sơn", "Đồng Đăng",

    // Tuyến phía Đông (Hà Nội - Hải Phòng)
    "Gia Lâm", "Cẩm Giàng", "Hải Dương", "Phú Thái", "Hải Phòng",

    // Tuyến phía Đông Bắc (Hà Nội - Thái Nguyên - Hạ Long)
    "Thái Nguyên", "Uông Bí", "Hạ Long"
  ];

  useEffect(() => {
    const fetchTrains = async () => {
      try {
        setLoading(true);

        const paramsGo = {
          from: initialFrom,
          to: initialTo,
          date: initialDate,
          tripType: initialTripType,
          groupSize: initialGroupSize,
        };

        const resGo = await API.get("/trains/search", { params: paramsGo });
        let finalGoTrips = Array.isArray(resGo.data) ? resGo.data : [];

        let backTrips = [];
        if (initialTripType === "roundtrip" && initialReturnDate) {
          const paramsBack = {
            from: initialTo,
            to: initialFrom,
            date: initialReturnDate,
            tripType: initialTripType,
            groupSize: initialGroupSize,
          };
          const resBack = await API.get("/trains/search", { params: paramsBack });
          backTrips = Array.isArray(resBack.data) ? resBack.data : [];
        }

        setOutboundTrains(finalGoTrips);
        setReturnTrains(backTrips);

        // Sync state with URL params
        setSearchFrom(initialFrom);
        setSearchTo(initialTo);
        setSearchDate(initialDate);
        setSearchTripType(initialTripType);
        setSearchReturnDate(initialReturnDate);
        setSearchGroupSize(initialGroupSize);

      } catch (error) {
        console.error("Lỗi lấy danh sách tàu:", error);
        setOutboundTrains([]);
        setReturnTrains([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrains();
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
    navigate(`/trains?${queryString}`);
  };

  const swapStations = () => {
    const temp = searchFrom;
    setSearchFrom(searchTo);
    setSearchTo(temp);
  };

  const sortTrains = (trainList) => {
    return [...trainList].sort((a, b) => {
      if (sortBy === "price-asc") return (a.price || 0) - (b.price || 0);
      if (sortBy === "price-desc") return (b.price || 0) - (a.price || 0);
      if (sortBy === "time-asc") return (a.departureTime || "").localeCompare(b.departureTime || "");
      if (sortBy === "time-desc") return (b.departureTime || "").localeCompare(a.departureTime || "");
      return 0;
    });
  };

  const renderTrainCard = (train) => {
    const total = train.totalSeats || train.seats || 0;
    const avail = train.availableSeats !== undefined ? train.availableSeats : total;

    let badgeText = "Còn chỗ";
    let badgeColor = "#28a745"; // xanh lá

    if (avail <= 0) {
      badgeText = "Hết chỗ";
      badgeColor = "#dc3545"; // đỏ
    } else if (avail <= 10) {
      badgeText = "Sắp đầy";
      badgeColor = "#fd7e14"; // cam
    }

    return (
      <div className="train-card" key={train._id}>
        <div className="train-top">
          <div>
            <span className="train-badge" style={{ backgroundColor: badgeColor }}>
              {badgeText}
            </span>
            <h3>{train.trainName || train.name || "Chuyến tàu"}</h3>
          </div>
          <div className="train-price">
            {Number(train.price || 0).toLocaleString("vi-VN")}đ
          </div>
        </div>

        <div className="train-route">
          <div>
            <p>Ga đi</p>
            <h4>{train.from || "Chưa có"}</h4>
          </div>
          <div className="route-arrow">→</div>
          <div>
            <p>Ga đến</p>
            <h4>{train.to || "Chưa có"}</h4>
          </div>
        </div>

        <div className="train-meta">
          <div>
            <span>Khởi hành</span>
            <strong>
              {train.departureDate
                ? new Date(train.departureDate).toLocaleDateString("vi-VN")
                : "Chưa có"}
            </strong>
          </div>

          <div>
            <span>Giờ đi</span>
            <strong>{train.departureTime || "Chưa có"}</strong>
          </div>

          <div>
            <span>Giờ đến</span>
            <strong>{train.arrivalTime || "Chưa có"}</strong>
          </div>

          <div>
            <span>Ghế trống</span>
            <strong>{avail} / {total}</strong>
          </div>
        </div>

        <button
          className="book-btn"
          disabled={avail <= 0}
          style={{ opacity: avail <= 0 ? 0.6 : 1, cursor: avail <= 0 ? "not-allowed" : "pointer" }}
          onClick={() => navigate(`/booking/${train._id}`)}
        >
          {avail <= 0 ? "Đã bán hết" : "Đặt vé ngay"}
        </button>
      </div>
    );
  };

  return (
    <div className="trainlist-page">
      <datalist id="station-list">
        {stations.map((s) => <option key={s} value={s} />)}
      </datalist>

      <div className="rv-container trainlist-wrap">
        {/* Bộ Lọc Tìm Kiếm Trên Trang */}
        <div className="search-box" style={{ marginBottom: "40px" }}>
          <form className="trainlist-search-form" onSubmit={handleSearch}>
            <div className="field">
              <label>Loại vé</label>
              <select value={searchTripType} onChange={(e) => setSearchTripType(e.target.value)}>
                <option value="oneway">Một chiều</option>
                <option value="roundtrip">Khứ hồi</option>
                <option value="group">Đoàn</option>
              </select>
            </div>

            <div className="field">
              <label>Ga đi</label>
              <input type="text" list="station-list" value={searchFrom} onChange={(e) => setSearchFrom(e.target.value)} placeholder="Nhập ga đi..." />
            </div>

            <button
              type="button"
              className="swap-btn"
              onClick={swapStations}
              aria-label="Đổi ga đi và ga đến"
              style={{ alignSelf: 'flex-end', marginBottom: '3px' }}
            >
              ⇄
            </button>

            <div className="field">
              <label>Ga đến</label>
              <input type="text" list="station-list" value={searchTo} onChange={(e) => setSearchTo(e.target.value)} placeholder="Nhập ga đến..." />
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

        <div className="trainlist-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <p className="section-label">Kết quả tìm kiếm</p>
            <h1 className="trainlist-title">Danh sách chuyến tàu</h1>
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
            <p>Đang tải dữ liệu chuyến tàu...</p>
          </div>
        ) : (
          <>
            <h2 style={{ marginBottom: "12px" }}>
              Chuyến đi ({initialFrom || "Tất cả"} → {initialTo || "Tất cả"})
            </h2>

            {outboundTrains.length === 0 ? (
              <div className="empty-box">Không có chuyến đi phù hợp.</div>
            ) : (
              <div className="train-grid">
                {sortTrains(outboundTrains).map((train) => renderTrainCard(train))}
              </div>
            )}

            {initialTripType === "roundtrip" && (
              <>
                <h2 style={{ marginTop: "30px", marginBottom: "12px" }}>
                  Chuyến về ({initialTo || "Tất cả"} → {initialFrom || "Tất cả"})
                </h2>

                {returnTrains.length === 0 ? (
                  <div className="empty-box">Không có chuyến về phù hợp.</div>
                ) : (
                  <div className="train-grid">
                    {sortTrains(returnTrains).map((train) => renderTrainCard(train))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default TrainList;