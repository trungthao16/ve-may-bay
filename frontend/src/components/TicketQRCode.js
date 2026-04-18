import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

function TicketQRCode({ ticket, onClose }) {
  const [downloading, setDownloading] = useState(false);

  if (!ticket) return null;

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const captureElem = document.getElementById(`ticket-${ticket._id}`);
      if (!captureElem) return;

      const canvas = await html2canvas(captureElem, {
        scale: 2, // Tăng độ nét
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      const imgProps = pdf.getImageProperties(imgData);
      const paramWidth = pdfWidth - 20; // lề 10mm mỗi bên
      const paramHeight = (imgProps.height * paramWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 10, 10, paramWidth, paramHeight);
      pdf.save(`VeMayBay_${ticket._id.slice(-6)}.pdf`);
    } catch (err) {
      console.error("Lỗi xuất PDF:", err);
    } finally {
      setDownloading(false);
    }
  };

  // Render QR content logic
  const qrValue = JSON.stringify({
    id: ticket._id,
    flight: ticket.train?.flightNumber || ticket.train?.name || "N/A",
    seat: ticket.seatNumber,
    cabin: ticket.coachNumber,
    name: ticket.passengerName || "N/A",
    cccd: ticket.cccd || "N/A"
  });

  return (
    <div className="modal-overlay" style={styles.overlay}>
      <div className="ticket-modal-content" style={styles.modal}>
        <div className="printable-ticket" id={`ticket-${ticket._id}`} style={styles.ticketBody}>
          {/* Header */}
          <div style={styles.header}>
            <h2 style={{ margin: 0, fontSize: "22px" }}>THẺ LÊN MÁY BAY</h2>
            <div style={{ fontSize: "12px", opacity: 0.8 }}>Electronic Boarding Pass</div>
          </div>
          
          <div style={styles.infoContainer}>
            {/* Left Info */}
            <div style={{ flex: 1 }}>
              <div style={styles.row}>
                <span style={styles.label}>Hành khách / Passenger</span>
                <div style={styles.value}>{ticket.passengerName || "Khách hàng"}</div>
              </div>
              
              <div style={styles.row}>
                <span style={styles.label}>CCCD / Passport</span>
                <div style={styles.value}>{ticket.cccd || "Không có"}</div>
              </div>

              <div style={styles.row}>
                <span style={styles.label}>Chuyến bay / Flight</span>
                <div style={styles.value}>{ticket.train?.flightNumber || ticket.train?.name || "Máy bay"}</div>
              </div>

              <div style={styles.row}>
                <span style={styles.label}>Hành trình / Route</span>
                <div style={styles.value}>{ticket.train?.from} ➔ {ticket.train?.to}</div>
              </div>

              <div style={styles.rowGrid}>
                <div>
                  <span style={styles.label}>Khoang / Cabin</span>
                  <div style={styles.valueLarge}>{ticket.coachNumber || "N/A"}</div>
                </div>
                <div>
                  <span style={styles.label}>Ghế / Seat</span>
                  <div style={styles.valueLarge}>{ticket.seatNumber}</div>
                </div>
              </div>
            </div>

            {/* Right QR */}
            <div style={styles.qrContainer}>
              <QRCodeSVG value={qrValue} size={110} level={"H"} />
              <div style={{ fontSize: "10px", marginTop: "8px", color: "#666" }}>
                MÃ VÉ: #{String(ticket._id).slice(-6).toUpperCase()}
              </div>
            </div>
          </div>

          <div style={styles.footer}>
            Xin quý khách vui lòng có mặt tại sân bay trước 90 phút để làm thủ tục.
          </div>
        </div>

        {/* Action Buttons (Not printed) */}
        <div style={styles.actions} className="no-print">
          <button 
            onClick={downloading ? null : handleDownloadPDF} 
            style={{ ...styles.btn, background: downloading ? "#ccc" : "#4ca37d", color: "#fff", cursor: downloading ? "not-allowed" : "pointer" }}
          >
            {downloading ? "⏳ Đang tạo PDF..." : "🖨️ Tải vé PDF"}
          </button>
          <button onClick={onClose} style={{ ...styles.btn, background: "#e2e8f0", color: "#333" }}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    padding: "20px"
  },
  modal: {
    background: "#fff",
    borderRadius: "12px",
    maxWidth: "500px",
    width: "100%",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    overflow: "hidden"
  },
  ticketBody: {
    background: "#fff",
  },
  header: {
    background: "#c9503a",
    color: "#fff",
    padding: "20px",
    textAlign: "center",
  },
  infoContainer: {
    padding: "24px",
    display: "flex",
    gap: "20px",
    borderBottom: "2px dashed #eee"
  },
  row: {
    marginBottom: "12px"
  },
  rowGrid: {
    display: "flex",
    gap: "30px",
    marginTop: "16px"
  },
  label: {
    display: "block",
    fontSize: "11px",
    color: "#888",
    textTransform: "uppercase",
    marginBottom: "4px"
  },
  value: {
    fontSize: "16px",
    color: "#333",
    fontWeight: "600"
  },
  valueLarge: {
    fontSize: "24px",
    color: "#c9503a",
    fontWeight: "bold"
  },
  qrContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderLeft: "2px dashed #eee",
    paddingLeft: "20px",
    minWidth: "120px"
  },
  footer: {
    padding: "16px",
    fontSize: "12px",
    color: "#666",
    textAlign: "center",
    background: "#fafafa"
  },
  actions: {
    display: "flex",
    gap: "10px",
    padding: "16px",
    background: "#f1f5f9",
    justifyContent: "center"
  },
  btn: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px"
  }
};

export default TicketQRCode;
