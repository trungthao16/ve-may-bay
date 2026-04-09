const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

// Load Environment Variables
dotenv.config();

const Train = require("./models/Train");
const Ticket = require("./models/Ticket");

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

const ROUTE_PAIRS = [
  { city1: "Hà Nội", city2: "TP Hồ Chí Minh", price: 1200000 },
  { city1: "Hà Nội", city2: "Đà Nẵng", price: 800000 },
  { city1: "Hà Nội", city2: "Vinh", price: 300000 },
  { city1: "Hà Nội", city2: "Huế", price: 650000 },
  { city1: "Hà Nội", city2: "Lào Cai", price: 400000 },
  { city1: "Hà Nội", city2: "Hải Phòng", price: 150000 },
  { city1: "Hà Nội", city2: "Nha Trang", price: 950000 },
  { city1: "TP Hồ Chí Minh", city2: "Đà Nẵng", price: 850000 },
  { city1: "TP Hồ Chí Minh", city2: "Nha Trang", price: 500000 },
  { city1: "TP Hồ Chí Minh", city2: "Bình Thuận", price: 350000 },
  { city1: "Đà Nẵng", city2: "Huế", price: 120000 },
  { city1: "Đà Nẵng", city2: "Nha Trang", price: 450000 },
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

    // Từ 10/4/2026 đến 10/8/2026 = 122 ngày
    const startDate = new Date("2026-04-10T00:00:00");
    const endDate = new Date("2026-08-10T00:00:00");

    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    console.log(`Generating trains from 10/4/2026 to 10/8/2026 (${totalDays} days)...`);

    const totalSeats = COACH_TEMPLATES.reduce((sum, c) => sum + c.capacity, 0);
    let trainCount = 0;

    // Mỗi ngày sinh 2 chuyến cho mỗi tuyến (chiều đi + chiều về) = 24 chuyến/ngày
    // 122 ngày x 24 = ~2928 chuyến → quá nhiều
    // Để đạt ~500-600 chuyến: mỗi ngày chỉ chọn random 2-3 tuyến để sinh
    for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
      const departureDate = new Date(startDate);
      departureDate.setDate(departureDate.getDate() + dayOffset);

      // Chọn random 2-3 tuyến mỗi ngày để đạt ~500-600 chuyến
      const numRoutes = Math.random() < 0.5 ? 2 : 3;
      const shuffled = [...ROUTE_PAIRS].sort(() => Math.random() - 0.5);
      const selectedRoutes = shuffled.slice(0, numRoutes);

      for (const route of selectedRoutes) {
        // --- CHIỀU ĐI (City 1 -> City 2) ---
        const outName = TRAIN_NAMES[Math.floor(Math.random() * TRAIN_NAMES.length)];
        const outDepH = (Math.floor(Math.random() * 8) + 5).toString().padStart(2, "0"); // 05:00 - 12:00
        const outDepM = (Math.floor(Math.random() * 4) * 15).toString().padStart(2, "0");
        const outArrH = (Math.floor(Math.random() * 6) + 16).toString().padStart(2, "0"); // 16:00 - 21:00
        const outArrM = (Math.floor(Math.random() * 4) * 15).toString().padStart(2, "0");

        newTrains.push({
          trainName: outName,
          from: route.city1,
          to: route.city2,
          departureDate: new Date(departureDate),
          departureTime: `${outDepH}:${outDepM}`,
          arrivalTime: `${outArrH}:${outArrM}`,
          price: route.price,
          totalSeats,
          coaches: COACH_TEMPLATES.map(c => ({ ...c }))
        });
        trainCount++;

        // --- CHIỀU VỀ (City 2 -> City 1) ---
        const retName = TRAIN_NAMES[Math.floor(Math.random() * TRAIN_NAMES.length)];
        const retDepH = (Math.floor(Math.random() * 6) + 13).toString().padStart(2, "0"); // 13:00 - 18:00
        const retDepM = (Math.floor(Math.random() * 4) * 15).toString().padStart(2, "0");
        const retArrH = (Math.floor(Math.random() * 4) + 4).toString().padStart(2, "0"); // 04:00 - 07:00 (ngày sau)
        const retArrM = (Math.floor(Math.random() * 4) * 15).toString().padStart(2, "0");

        newTrains.push({
          trainName: retName,
          from: route.city2,
          to: route.city1,
          departureDate: new Date(departureDate),
          departureTime: `${retDepH}:${retDepM}`,
          arrivalTime: `${retArrH}:${retArrM}`,
          price: route.price,
          totalSeats,
          coaches: COACH_TEMPLATES.map(c => ({ ...c }))
        });
        trainCount++;
      }
    }

    // Convert to CSV rows
    for (const t of newTrains) {
      csvRows.push([
        t.trainName, t.from, t.to,
        t.departureDate.toISOString().split("T")[0],
        t.departureTime, t.arrivalTime,
        t.price, t.totalSeats
      ]);
    }

    // 2. Insert into DB
    console.log(`Inserting ${trainCount} trains into database...`);
    await Train.insertMany(newTrains);
    console.log(`Database seeded successfully with ${trainCount} trains!`);

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
