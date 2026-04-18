import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

function Home() {
  const navigate = useNavigate();

  const [tripType, setTripType] = useState("oneway");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [returnDate, setReturnDate] = useState("2026-03-16");
  const [passengers, setPassengers] = useState("1 người lớn");
  const [groupSize, setGroupSize] = useState("");

  const [airports, setAirports] = useState([]);

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

  const swapStations = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  // const handleSearch = () => {
  //   const params = {
  //     from,
  //     to,
  //     date,
  //     passengers,
  //     tripType,
  //   };

  //   if (tripType === "roundtrip") {
  //     params.returnDate = returnDate;
  //   }

  //   if (tripType === "group") {
  //     params.groupSize = groupSize;
  //   }

  //   const query = new URLSearchParams(params).toString();
  //   navigate(`/flights?${query}`);
  // };

  const handleSearch = () => {
    if (!from.trim() || !to.trim()) {
      toast.error("Vui lòng nhập sân bay đi và sân bay đến");
      return;
    }

    if (from.trim().toLowerCase() === to.trim().toLowerCase()) {
      toast.error("Sân bay đi và sân bay đến không được trùng nhau");
      return;
    }

    if (!date) {
      toast.error("Vui lòng chọn ngày đi");
      return;
    }

    if (tripType === "roundtrip") {
      if (!returnDate) {
        toast.error("Vui lòng chọn ngày về");
        return;
      }

      if (new Date(returnDate) < new Date(date)) {
        toast.error("Ngày về phải lớn hơn hoặc bằng ngày đi");
        return;
      }
    }

    if (tripType === "group") {
      if (!groupSize.trim()) {
        toast.error("Vui lòng nhập số lượng đoàn");
        return;
      }
    }

    const params = {
      from,
      to,
      date,
      passengers,
      tripType,
    };

    if (tripType === "roundtrip") {
      params.returnDate = returnDate;
    }

    if (tripType === "group") {
      params.groupSize = groupSize;
    }

    const query = new URLSearchParams(params).toString();

    // đổi đúng route trang danh sách chuyến bay của bạn
    navigate(`/flights?${query}`);
  };

  const handlePopularRouteClick = (title) => {
    const parts = title.split("→").map(s => s.trim());
    if (parts.length === 2) {
      let f = parts[0];
      let t = parts[1];
      if (f === "HCM" || f === "TP. Hồ Chí Minh" || f === "TP. Hồ chí minh") f = "Sài Gòn";
      if (t === "HCM" || t === "TP. Hồ Chí Minh" || t === "TP. Hồ chí minh") t = "Sài Gòn";

      const params = {
        from: f,
        to: t,
        date,
        passengers,
        tripType,
      };

      const query = new URLSearchParams(params).toString();
      navigate(`/flights?${query}`);
    }
  };

  const popularRoutes = [
    {
      title: "Hà Nội → TP. Hồ Chí Minh",
      time: "2 giờ 10 phút • Vietnam Airlines / Vietjet",
      price: "Từ 1.250.000đ →",
      large: true,
      badge: "Phổ biến nhất",
      className: "route-card blue-red",
    },
    {
      title: "Hà Nội → Đà Nẵng",
      time: "1 giờ 20 phút",
      className: "route-card green-blue",
    },
    {
      title: "Đà Nẵng → Sài Gòn",
      time: "1 giờ 30 phút",
      badge: "Mới",
      className: "route-card purple-gold",
    },
    {
      title: "Hà Nội → Phú Quốc",
      time: "2 giờ 15 phút",
      className: "route-card blue-green",
    },
    {
      title: "Sài Gòn → Nha Trang",
      time: "1 giờ",
      className: "route-card green-lime",
    },
    {
      title: "Cần Thơ → Hà Nội",
      time: "2 giờ 10 phút",
      className: "route-card red-orange",
    },
  ];

  const features = [
    {
      icon: "⚡",
      title: "Đặt vé siêu tốc",
      desc: "Hoàn tất đặt vé trong vòng 60 giây. Thủ tục nhanh gọn, tiết kiệm thời gian.",
    },
    {
      icon: "🔐",
      title: "Thanh toán an toàn",
      desc: "Mã hóa SSL 256-bit. Hỗ trợ VNPAY, MoMo, thẻ ngân hàng và ví điện tử.",
    },
    {
      icon: "🧾",
      title: "Vé điện tử tiện lợi",
      desc: "Nhận vé qua email & SMS. Check-in trực tuyến dễ dàng, đơn giản và nhanh gọn.",
    },
    {
      icon: "🔄",
      title: "Đổi/Hoàn vé linh hoạt",
      desc: "Hỗ trợ thay đổi lịch trình linh hoạt. Quy trình hoàn tiền nhanh chóng và minh bạch.",
    },
  ];

  const seatTypes = [
    {
      icon: "💺",
      title: "Hạng Phổ Thông (Economy)",
      desc: "Lựa chọn tiết kiệm tối ưu. Ghế ngồi thoải mái với đầy đủ tiện nghi cơ bản cho mọi hành trình.",
    },
    {
      icon: "🌟",
      title: "Hạng Thương Gia (Business)",
      desc: "Trải nghiệm đẳng cấp với ghế ngồi rộng rãi, suất ăn cao cấp và ưu tiên check-in tại quầy riêng.",
    },
    {
      icon: "💎",
      title: "Hạng Nhất (First Class)",
      desc: "Đỉnh cao của sự sang trọng. Không gian riêng tư tuyệt đối, dịch vụ cá nhân hóa và các tiện ích xa hoa nhất.",
    },
  ];

  return (
    <div className="railviet-page">
      <datalist id="home-airport-list">
        {airports.map((s) => <option key={s} value={s} />)}
      </datalist>

      <section className="hero-section">
        <div className="rv-container">
          <div className="hero-content">
            <div className="hero-badge">Hơn 2 triệu vé đã được đặt</div>

            <h1 className="hero-title">
              Cùng bạn <br />
              <span>khám phá</span> <br />
              <strong>bầu trời</strong>
            </h1>

            <p className="hero-desc">
              Tìm kiếm và đặt vé máy bay giá rẻ nhanh chóng. Trải nghiệm dịch vụ hàng không đẳng cấp từ các đối tác hàng đầu thế giới.
            </p>

            <div className="search-box">
              <div className="trip-tabs">
                <button
                  type="button"
                  className={tripType === "oneway" ? "active" : ""}
                  onClick={() => setTripType("oneway")}
                >
                  Một chiều
                </button>

                <button
                  type="button"
                  className={tripType === "roundtrip" ? "active" : ""}
                  onClick={() => setTripType("roundtrip")}
                >
                  Khứ hồi
                </button>

                <button
                  type="button"
                  className={tripType === "group" ? "active" : ""}
                  onClick={() => setTripType("group")}
                >
                  Đoàn
                </button>
              </div>

              <div className="search-form">
                <div className="field">
                  <label>Sân bay đi</label>
                  <input
                    type="text"
                    list="home-airport-list"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    placeholder="Nhập sân bay đi..."
                  />
                </div>

                <button
                  type="button"
                  className="swap-btn"
                  onClick={swapStations}
                  aria-label="Đổi nơi đi và nơi đến"
                >
                  ⇄
                </button>

                <div className="field">
                  <label>Sân bay đến</label>
                  <input
                    type="text"
                    list="home-airport-list"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="Nhập sân bay đến..."
                  />
                </div>

                <div className="field">
                  <label>Ngày đi</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label>Hành khách</label>
                  <select
                    value={passengers}
                    onChange={(e) => setPassengers(e.target.value)}
                  >
                    <option>1 người lớn</option>
                    <option>2 người lớn</option>
                    <option>3 người lớn</option>
                    <option>4 người lớn</option>
                  </select>
                </div>
              </div>

              {tripType === "roundtrip" && (
                <div className="field" style={{ marginTop: "14px" }}>
                  <label>Ngày về</label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                  />
                </div>
              )}

              {tripType === "group" && (
                <div className="field" style={{ marginTop: "14px" }}>
                  <label>Số lượng đoàn</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 20 người"
                    value={groupSize}
                    onChange={(e) => setGroupSize(e.target.value)}
                  />
                </div>
              )}

              <button className="search-btn" onClick={handleSearch}>
                🔍 Tìm vé
              </button>

              <div className="hero-stats">
                <div>
                  <h3>42</h3>
                  <p>Điểm đến trong & ngoài nước</p>
                </div>
                <div>
                  <h3>2.4M+</h3>
                  <p>Vé đã đặt</p>
                </div>
                <div>
                  <h3>4.8★</h3>
                  <p>Đánh giá người dùng</p>
                </div>
                <div>
                  <h3>24/7</h3>
                  <p>Hỗ trợ khách hàng</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="routes-section">
        <div className="rv-container">
          <p className="section-label">Tuyến đường phổ biến</p>
          <h2 className="section-title">
            Những hành trình <br />
            <span>được yêu thích nhất</span>
          </h2>

          <div className="routes-grid">
            {popularRoutes.map((route, index) => (
              <div
                key={index}
                className={`${route.className} ${route.large ? "large" : ""}`}
                onClick={() => handlePopularRouteClick(route.title)}
                style={{ cursor: "pointer" }}
              >
                {route.badge && <div className="route-badge">{route.badge}</div>}
                <div className="route-overlay">
                  <h3>{route.title}</h3>
                  <p>{route.time}</p>
                  {route.price && <span>{route.price}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="rv-container">
          <p className="section-label gold">Tại sao chọn chúng tôi</p>
          <h2 className="section-title light">
            Trải nghiệm đặt vé <br />
            <span>hoàn toàn mới</span>
          </h2>

          <div className="features-grid">
            {features.map((item, index) => (
              <div className="feature-card" key={index}>
                <div className="feature-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="promo-card">
            <div>
              <p className="promo-label">Ưu đãi đặc biệt</p>
              <h3>
                Giảm <span>30%</span> <br />
                vé máy bay hè 2026
              </h3>
              <p className="promo-desc">
                Áp dụng cho các chuyến đi từ 01/06 đến 31/08/2026.
                <br />
                Đặt ngay để nhận giá tốt nhất!
              </p>
            </div>

            <button className="promo-btn">Đặt vé ngay →</button>
          </div>
        </div>
      </section>

      <section className="seats-section">
        <div className="rv-container">
          <p className="section-label">Hạng ghế & Dịch vụ</p>
          <h2 className="section-title">
            Chọn hạng ghế <br />
            <span>phù hợp với bạn</span>
          </h2>

          <div className="seat-grid">
            {seatTypes.map((seat, index) => (
              <div className="seat-card" key={index}>
                <div className="seat-icon">{seat.icon}</div>
                <h3>{seat.title}</h3>
                <p>{seat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
