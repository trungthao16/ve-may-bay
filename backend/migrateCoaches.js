const mongoose = require("mongoose");
require("dotenv").config();
const Train = require("./models/Train");

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Connected to DB, running migration...");
    const trains = await Train.find({ coaches: { $exists: false } }); // or size 0
    console.log(`Found ${trains.length} trains needing coaches.`);
    
    for (let train of trains) {
      train.coaches = [
        { coachNumber: 1, coachType: "soft_seat", capacity: 64, priceMultiplier: 1 },
        { coachNumber: 2, coachType: "soft_seat", capacity: 64, priceMultiplier: 1 },
        { coachNumber: 3, coachType: "soft_seat", capacity: 64, priceMultiplier: 1 },
        { coachNumber: 4, coachType: "sleeper", capacity: 28, priceMultiplier: 1.5 },
        { coachNumber: 5, coachType: "sleeper", capacity: 28, priceMultiplier: 1.5 },
      ];
      train.totalSeats = train.coaches.reduce((sum, c) => sum + c.capacity, 0);
      await train.save();
    }
    console.log("Migration complete.");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
