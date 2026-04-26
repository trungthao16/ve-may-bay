const routeSeo = {
  "/": {
    title: "Vé máy bay giá rẻ, đặt vé nhanh chóng | Vemaybay",
    description:
      "Tìm kiếm và đặt vé máy bay giá rẻ trực tuyến, so sánh hành trình thuận tiện và nhận nhiều ưu đãi cho chuyến đi trong nước, quốc tế.",
    robots: "index, follow",
    structuredData: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          name: "Vemaybay",
          url: "/",
          inLanguage: "vi-VN",
          potentialAction: {
            "@type": "SearchAction",
            target: "/flights?from={from}&to={to}&date={date}",
            "query-input": [
              "required name=from",
              "required name=to",
              "required name=date"
            ]
          }
        },
        {
          "@type": "Organization",
          name: "Vemaybay",
          url: "/",
          logo: "/logo512.png"
        }
      ]
    }
  },
  "/flights": {
    title: "Danh sách chuyến bay và giá vé | Vemaybay",
    description:
      "Xem danh sách chuyến bay, so sánh giờ bay, giá vé và lựa chọn hành trình phù hợp cho chuyến đi của bạn.",
    robots: "index, follow"
  },
  "/promotions": {
    title: "Khuyến mãi vé máy bay mới nhất | Vemaybay",
    description:
      "Cập nhật ưu đãi, mã giảm giá và chương trình khuyến mãi vé máy bay mới nhất để tiết kiệm chi phí cho hành trình của bạn.",
    robots: "index, follow"
  },
  "/support": {
    title: "Hỗ trợ đặt vé máy bay | Vemaybay",
    description:
      "Liên hệ hỗ trợ đặt vé máy bay, đổi lịch bay, hoàn vé và giải đáp các câu hỏi thường gặp nhanh chóng, rõ ràng.",
    robots: "index, follow"
  },
  "/login": {
    title: "Đăng nhập tài khoản | Vemaybay",
    description:
      "Đăng nhập để quản lý vé máy bay, thông tin cá nhân và lịch sử đặt chỗ của bạn.",
    robots: "noindex, nofollow"
  },
  "/register": {
    title: "Đăng ký tài khoản | Vemaybay",
    description:
      "Tạo tài khoản để đặt vé máy bay nhanh hơn và theo dõi hành trình thuận tiện hơn.",
    robots: "noindex, nofollow"
  },
  "/forgot-password": {
    title: "Quên mật khẩu | Vemaybay",
    description:
      "Khôi phục mật khẩu để tiếp tục truy cập tài khoản đặt vé máy bay của bạn.",
    robots: "noindex, nofollow"
  },
  "/mytickets": {
    title: "Vé của tôi | Vemaybay",
    description:
      "Quản lý vé máy bay đã đặt, xem mã vé và thông tin hành trình của bạn.",
    robots: "noindex, nofollow"
  },
  "/my-tickets": {
    title: "Vé của tôi | Vemaybay",
    description:
      "Quản lý vé máy bay đã đặt, xem mã vé và thông tin hành trình của bạn.",
    robots: "noindex, nofollow"
  },
  "/profile": {
    title: "Hồ sơ tài khoản | Vemaybay",
    description:
      "Cập nhật hồ sơ cá nhân và thông tin liên hệ cho tài khoản đặt vé máy bay của bạn.",
    robots: "noindex, nofollow"
  },
  "/profile/edit": {
    title: "Chỉnh sửa hồ sơ | Vemaybay",
    description: "Chỉnh sửa hồ sơ tài khoản và thông tin cá nhân của bạn.",
    robots: "noindex, nofollow"
  }
};

export function getSeoConfig(pathname) {
  if (pathname.startsWith("/booking/")) {
    return {
      title: "Đặt vé chuyến bay | Vemaybay",
      description:
        "Hoàn tất đặt vé chuyến bay nhanh chóng, an toàn và thuận tiện chỉ trong vài bước.",
      robots: "noindex, nofollow"
    };
  }

  if (pathname.startsWith("/admin")) {
    return {
      title: "Trang quản trị | Vemaybay",
      description: "Khu vực quản trị hệ thống đặt vé máy bay.",
      robots: "noindex, nofollow"
    };
  }

  return routeSeo[pathname] || routeSeo["/"];
}
