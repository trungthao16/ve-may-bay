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

  const [stations, setStations] = useState([]);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await API.get("/trains/stations");
        setStations(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Lỗi lấy danh sách ga:", err);
      }
    };
    fetchStations();
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
  //   navigate(`/trains?${query}`);
  // };

  const handleSearch = () => {
    if (!from.trim() || !to.trim()) {
      toast.error("Vui lòng nhập ga đi và ga đến");
      return;
    }

    if (from.trim().toLowerCase() === to.trim().toLowerCase()) {
      toast.error("Ga đi và ga đến không được trùng nhau");
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

    // đổi đúng route trang danh sách tàu của bạn
    navigate(`/trains?${query}`);
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
      navigate(`/trains?${query}`);
    }
  };

  const popularRoutes = [
    {
      title: "Hà Nội → TP. Hồ Chí Minh",
      time: "30 giờ • Tàu SE1/SE2",
      price: "Từ 750.000đ →",
      large: true,
      badge: "Phổ biến nhất",
      className: "route-card blue-red",
    },
    {
      title: "Hà Nội → Đà Nẵng",
      time: "16 giờ",
      className: "route-card green-blue",
    },
    {
      title: "Đà Nẵng → Huế",
      time: "2.5 giờ",
      badge: "Mới",
      className: "route-card purple-gold",
    },
    {
      title: "HCM → Nha Trang",
      time: "7 giờ",
      className: "route-card blue-green",
    },
    {
      title: "Sài Gòn → Phan Thiết",
      time: "4 giờ",
      className: "route-card green-lime",
    },
    {
      title: "HCM → Đà Nẵng",
      time: "18 giờ",
      className: "route-card red-orange",
    },
  ];

  const features = [
    {
      icon: "⚡",
      title: "Đặt vé siêu tốc",
      desc: "Hoàn tất đặt vé trong vòng 60 giây. Không cần xếp hàng, không cần chờ đợi.",
    },
    {
      icon: "🔐",
      title: "Thanh toán an toàn",
      desc: "Mã hóa SSL 256-bit. Hỗ trợ VNPAY, MoMo, thẻ ngân hàng và ví điện tử.",
    },
    {
      icon: "🧾",
      title: "Vé điện tử tiện lợi",
      desc: "Nhận vé qua email & SMS. Xuất trình mã QR khi lên tàu, đơn giản và nhanh gọn.",
    },
    {
      icon: "🔄",
      title: "Đổi/Hoàn vé dễ dàng",
      desc: "Hỗ trợ hoàn vé trước 24 giờ. Quy trình hoàn tiền trong 3–5 ngày làm việc.",
    },
  ];

  const seatTypes = [
    {
      icon: "🪑",
      title: "Ghế ngồi cứng",
      desc: "Lựa chọn tiết kiệm nhất. Phù hợp cho hành trình ngắn dưới 5 giờ, 6 chỗ/khoang.",
    },
    {
      icon: "💺",
      title: "Ghế ngồi mềm",
      desc: "Thoải mái hơn với ghế đệm êm ái. Lý tưởng cho chuyến đi 5–10 giờ, 4 chỗ/khoang.",
    },
    {
      icon: "🛏️",
      title: "Giường nằm VIP",
      desc: "Hạng sang nhất trên tàu. Khoang 2 giường, nệm dày, điều hòa riêng. Lý tưởng cho hành trình xuyên đêm.",
    },
  ];

  return (
    <div className="railviet-page">
      <datalist id="home-station-list">
        {stations.map((s) => <option key={s} value={s} />)}
      </datalist>

      <section className="hero-section">
        <div className="rv-container">
          <div className="hero-content">
            <div className="hero-badge">Hơn 2 triệu vé đã được đặt</div>

            <h1 className="hero-title">
              Hành trình <br />
              <span>dáng nhớ</span> <br />
              <strong>xuyên Việt</strong>
            </h1>

            <p className="hero-desc">
              Đặt vé tàu nhanh chóng, tiện lợi. Khám phá vẻ đẹp dọc theo tuyến
              đường sắt Bắc - Nam huyền thoại.
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
                  <label>Ga đi</label>
                  <input
                    type="text"
                    list="home-station-list"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    placeholder="Nhập ga đi..."
                  />
                </div>

                <button
                  type="button"
                  className="swap-btn"
                  onClick={swapStations}
                  aria-label="Đổi ga đi và ga đến"
                >
                  ⇄
                </button>

                <div className="field">
                  <label>Ga đến</label>
                  <input
                    type="text"
                    list="home-station-list"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="Nhập ga đến..."
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
                  <h3>58</h3>
                  <p>Ga trên toàn quốc</p>
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
                vé tàu hè 2026
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
          <p className="section-label">Hạng vé & toa tàu</p>
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