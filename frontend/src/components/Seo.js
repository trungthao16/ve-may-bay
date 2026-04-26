import { useEffect } from "react";

const DEFAULT_TITLE = "Vé máy bay giá rẻ, đặt vé nhanh chóng | Vemaybay";
const DEFAULT_DESCRIPTION =
  "Đặt vé máy bay trực tuyến nhanh chóng, an toàn, so sánh chuyến bay thuận tiện và nhận nhiều ưu đãi cho hành trình trong nước, quốc tế.";

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

function upsertLink(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

function absolutizeStructuredData(value, origin) {
  if (Array.isArray(value)) {
    return value.map((item) => absolutizeStructuredData(item, origin));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => {
        if (
          typeof item === "string" &&
          (key === "url" || key === "logo" || key === "image" || key === "target") &&
          item.startsWith("/")
        ) {
          return [key, `${origin}${item}`];
        }

        return [key, absolutizeStructuredData(item, origin)];
      })
    );
  }

  return value;
}

function Seo({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  robots = "index, follow",
  type = "website",
  image = "/logo512.png",
  structuredData,
}) {
  useEffect(() => {
    const url = `${window.location.origin}${window.location.pathname}`;
    const imageUrl = image.startsWith("http")
      ? image
      : `${window.location.origin}${image}`;

    document.title = title;

    upsertMeta('meta[name="description"]', {
      name: "description",
      content: description,
    });
    upsertMeta('meta[name="robots"]', { name: "robots", content: robots });
    upsertMeta('meta[property="og:title"]', {
      property: "og:title",
      content: title,
    });
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: description,
    });
    upsertMeta('meta[property="og:type"]', {
      property: "og:type",
      content: type,
    });
    upsertMeta('meta[property="og:url"]', {
      property: "og:url",
      content: url,
    });
    upsertMeta('meta[property="og:image"]', {
      property: "og:image",
      content: imageUrl,
    });
    upsertMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    });
    upsertMeta('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: title,
    });
    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: description,
    });
    upsertMeta('meta[name="twitter:image"]', {
      name: "twitter:image",
      content: imageUrl,
    });
    upsertLink('link[rel="canonical"]', { rel: "canonical", href: url });

    let script = document.getElementById("seo-structured-data");

    if (structuredData) {
      if (!script) {
        script = document.createElement("script");
        script.id = "seo-structured-data";
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }

      script.textContent = JSON.stringify(
        absolutizeStructuredData(structuredData, window.location.origin)
      );
    } else if (script) {
      script.remove();
    }
  }, [description, image, robots, structuredData, title, type]);

  return null;
}

export default Seo;
