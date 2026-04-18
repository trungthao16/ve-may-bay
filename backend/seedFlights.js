const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

// Load Environment Variables
dotenv.config();

const Flight = require("./models/Flight");
const Ticket = require("./models/Ticket");

const FLIGHT_NAMES = [
  "VN101", "VN102", "VJ103", "VJ104", "QH105", "QH106", "VU107", "VU108", "VN201", "VJ202",
  "VN111", "VJ112", "QH113", "QH114", "VN301", "VJ302", "VN401", "VJ402", "VU201", "VU202"
];

const CABIN_TEMPLATES = [
  { cabinNumber: 1, cabinType: "business", capacity: 16, priceMultiplier: 2.5 },
  { cabinNumber: 2, cabinType: "economy", capacity: 50, priceMultiplier: 1 },
  { cabinNumber: 3, cabinType: "economy", capacity: 50, priceMultiplier: 1 },
  { cabinNumber: 4, cabinType: "economy", capacity: 50, priceMultiplier: 1 },
  { cabinNumber: 5, cabinType: "economy", capacity: 50, priceMultiplier: 1 },
];

const ROUTE_PAIRS = [
  { city1: "HAN (Hà Nội)", city2: "SGN (TP Hồ Chí Minh)", price: 1800000 },
  { city1: "HAN (Hà Nội)", city2: "DAD (Đà Nẵng)", price: 1200000 },
  { city1: "HAN (Hà Nội)", city2: "VII (Vinh)", price: 800000 },
  { city1: "HAN (Hà Nội)", city2: "HUI (Huế)", price: 1100000 },
  { city1: "HAN (Hà Nội)", city2: "PQC (Phú Quốc)", price: 2100000 },
  { city1: "HAN (Hà Nội)", city2: "CXR (Nha Trang)", price: 1500000 },
  { city1: "SGN (TP Hồ Chí Minh)", city2: "DAD (Đà Nẵng)", price: 1250000 },
  { city1: "SGN (TP Hồ Chí Minh)", city2: "CXR (Nha Trang)", price: 900000 },
  { city1: "SGN (TP Hồ Chí Minh)", city2: "PQC (Phú Quốc)", price: 1000000 },
  { city1: "DAD (Đà Nẵng)", city2: "HUI (Huế)", price: 600000 },
  { city1: "DAD (Đà Nẵng)", city2: "CXR (Nha Trang)", price: 850000 },
];

async function seedData() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully.");

    // 1. Delete all existing Flights and Tickets
    console.log("Cleaning up old data...");
    await Flight.deleteMany({});
    await Ticket.deleteMany({});
    console.log("Old data deleted.");

    const newFlights = [];
    const csvRows = [["Flight Number", "From", "To", "Departure Date", "Departure Time", "Arrival Time", "Base Price", "Total Seats"]];

    // Từ 10/4/2026 đến 10/8/2026 = 122 ngày
    const startDate = new Date("2026-04-10T00:00:00");
    const endDate = new Date("2026-08-10T00:00:00");

    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    console.log(`Generating flights from 10/4/2026 to 10/8/2026 (${totalDays} days)...`);

    const totalSeats = CABIN_TEMPLATES.reduce((sum, c) => sum + c.capacity, 0);
    let flightCount = 0;

    for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
      const departureDate = new Date(startDate);
      departureDate.setDate(departureDate.getDate() + dayOffset);

      const selectedRoutes = ROUTE_PAIRS;

      for (const route of selectedRoutes) {
        // --- CHIỀU ĐI (City 1 -> City 2) ---
        const outName = FLIGHT_NAMES[Math.floor(Math.random() * FLIGHT_NAMES.length)];
        const outDepH = (Math.floor(Math.random() * 8) + 5).toString().padStart(2, "0"); // 05:00 - 12:00
        const outDepM = (Math.floor(Math.random() * 4) * 15).toString().padStart(2, "0");
        const outArrH = (Math.floor(Math.random() * 6) + 13).toString().padStart(2, "0"); // 13:00 - 18:00 (assume 2-4 hr flight)
        const outArrM = (Math.floor(Math.random() * 4) * 15).toString().padStart(2, "0");

        newFlights.push({
          flightNumber: outName,
          from: route.city1,
          to: route.city2,
          departureDate: new Date(departureDate),
          departureTime: `${outDepH}:${outDepM}`,
          arrivalTime: `${outArrH}:${outArrM}`,
          price: route.price,
          totalSeats,
          cabins: CABIN_TEMPLATES.map(c => ({ ...c }))
        });
        flightCount++;

        // --- CHIỀU VỀ (City 2 -> City 1) ---
        const retName = FLIGHT_NAMES[Math.floor(Math.random() * FLIGHT_NAMES.length)];
        const retDepH = (Math.floor(Math.random() * 6) + 14).toString().padStart(2, "0"); // 14:00 - 19:00
        const retDepM = (Math.floor(Math.random() * 4) * 15).toString().padStart(2, "0");
        const retArrH = (Math.floor(Math.random() * 4) + 20).toString().padStart(2, "0"); // 20:00 - 23:00 
        const retArrM = (Math.floor(Math.random() * 4) * 15).toString().padStart(2, "0");

        newFlights.push({
          flightNumber: retName,
          from: route.city2,
          to: route.city1,
          departureDate: new Date(departureDate),
          departureTime: `${retDepH}:${retDepM}`,
          arrivalTime: `${retArrH}:${retArrM}`,
          price: route.price,
          totalSeats,
          cabins: CABIN_TEMPLATES.map(c => ({ ...c }))
        });
        flightCount++;
      }
    }

    // Convert to CSV rows
    for (const t of newFlights) {
      csvRows.push([
        t.flightNumber, t.from, t.to,
        t.departureDate.toISOString().split("T")[0],
        t.departureTime, t.arrivalTime,
        t.price, t.totalSeats
      ]);
    }

    // 2. Insert into DB
    console.log(`Inserting ${flightCount} flights into database...`);
    await Flight.insertMany(newFlights);
    console.log(`Database seeded successfully with ${flightCount} flights!`);

    // 3. Save CSV file
    const csvContent = csvRows.map(row => row.join(",")).join("\n");
    const csvPath = path.join(__dirname, "flights_data.csv");
    fs.writeFileSync(csvPath, csvContent, "utf8");
    console.log(`CSV file generated at: ${csvPath}`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

seedData();
