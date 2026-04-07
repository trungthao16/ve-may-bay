const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

// Load Environment Variables
dotenv.config();

const Train = require("./models/Train");
const Ticket = require("./models/Ticket");

const STATIONS = [
  "Hà Nội", "TP Hồ Chí Minh", "Phủ Lý", "Nam Định", "Ninh Bình", "Bỉm Sơn", "Thanh Hóa", "Minh Khôi",
  "Chợ Sy", "Vinh", "Yên Trung", "Hương Phố", "Đồng Lê", "Đồng Hới", "Đông Hà",
  "Huế", "Lăng Cô", "Đà Nẵng", "Trà Kiệu", "Phú Cang", "Tam Kỳ", "Núi Thành",
  "Quảng Ngãi", "Đức Phổ", "Bồng Sơn", "Diêu Trì", "Tuy Hòa", "Giã", "Ninh Hòa",
  "Nha Trang", "Ngã Ba", "Tháp Chàm", "Sông Mao", "Ma Lâm", "Bình Thuận",
  "Suối Kiết", "Long Khánh", "Biên Hòa", "Dĩ An", "Lào Cai", "Hải Phòng", "Hạ Long"
];

const TRAIN_NAMES = [
  "SE1", "SE2", "SE3", "SE4", "SE5", "SE6", "SE7", "SE8", "SE9", "SE10",
  "TN1", "TN2", "SPT1", "SPT2", "NA1", "NA2", "VĐ1", "VĐ2", "HP1", "HP2"
];

const COACH_TEMPLATES = [
  { coachNumber: 1, coachType: "soft_seat", capacity: 64, priceMultiplier: 1 },
  { coachNumber: 2, coachType: "soft_seat", capacity: 64, priceMultiplier: 1 },
  { coachNumber: 3, coachType: "soft_seat", capacity: 64, priceMultiplier: 1 },
  { coachNumber: 4, coachType: "sleeper", capacity: 28, priceMultiplier: 1.5 },
  { coachNumber: 5, coachType: "sleeper", capacity: 28, priceMultiplier: 1.5 },
];

async function seedData() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully.");

    // 1. Delete all existing Trains and Tickets
    console.log("Cleaning up old data...");
    await Train.deleteMany({});
    await Ticket.deleteMany({});
    console.log("Old data deleted.");

    const newTrains = [];
    const csvRows = [["Train Name", "From", "To", "Departure Date", "Departure Time", "Arrival Time", "Base Price", "Total Seats"]];

    const startDate = new Date(); // Today
    const endDate = new Date("2026-07-31");

    console.log(`Generating 300 train schedules from ${startDate.toDateString()} to ${endDate.toDateString()}...`);

    for (let i = 0; i < 300; i++) {
      const trainName = TRAIN_NAMES[Math.floor(Math.random() * TRAIN_NAMES.length)];
      
      let from = STATIONS[Math.floor(Math.random() * STATIONS.length)];
      let to = STATIONS[Math.floor(Math.random() * STATIONS.length)];
      while (from === to) {
        to = STATIONS[Math.floor(Math.random() * STATIONS.length)];
      }

      // Random date between now and end of July 2026
      const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
      const departureDate = new Date(randomTime);
      departureDate.setHours(0, 0, 0, 0);

      const depH = Math.floor(Math.random() * 24).toString().padStart(2, "0");
      const depM = (Math.floor(Math.random() * 4) * 15).toString().padStart(2, "0");
      const departureTime = `${depH}:${depM}`;

      const arrH = Math.floor(Math.random() * 24).toString().padStart(2, "0");
      const arrM = (Math.floor(Math.random() * 4) * 15).toString().padStart(2, "0");
      const arrivalTime = `${arrH}:${arrM}`;

      const price = Math.floor(Math.random() * (1500000 - 300000) + 300000);
      const totalSeats = COACH_TEMPLATES.reduce((sum, c) => sum + c.capacity, 0);

      const trainDoc = {
        trainName,
        from,
        to,
        departureDate,
        departureTime,
        arrivalTime,
        price, // Base price
        totalSeats,
        coaches: COACH_TEMPLATES.map(c => ({ ...c }))
      };

      newTrains.push(trainDoc);

      // CSV row
      csvRows.push([
        trainName,
        from,
        to,
        departureDate.toISOString().split("T")[0],
        departureTime,
        arrivalTime,
        price,
        totalSeats
      ]);
    }

    // 2. Insert into DB
    console.log("Inserting new trains into database...");
    await Train.insertMany(newTrains);
    console.log("Database seeded successfully!");

    // 3. Save CSV file
    const csvContent = csvRows.map(row => row.join(",")).join("\n");
    const csvPath = path.join(__dirname, "trains_data.csv");
    fs.writeFileSync(csvPath, csvContent, "utf8");
    console.log(`CSV file generated at: ${csvPath}`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

seedData();
