// const Train = require("../models/Train")

// // lấy danh sách tàu
// exports.getTrains = async (req,res)=>{

//   try{

//     const trains = await Train.find()

//     res.json(trains)

//   }catch(err){
//     res.status(500).json(err)
//   }

// }


// // tạo tàu
// exports.createTrain = async (req,res)=>{

//   try{

//     const train = new Train(req.body)

//     await train.save()

//     res.json(train)

//   }catch(err){
//     res.status(500).json(err)
//   }

// }


// // cập nhật tàu
// exports.updateTrain = async (req,res)=>{

//   try{

//     const train = await Train.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       {new:true}
//     )

//     res.json(train)

//   }catch(err){
//     res.status(500).json(err)
//   }

// }


// // xóa tàu
// exports.deleteTrain = async (req,res)=>{

//   try{

//     await Train.findByIdAndDelete(req.params.id)

//     res.json({
//       message:"Đã xóa tàu"
//     })

//   }catch(err){
//     res.status(500).json(err)
//   }

// }
// // lấy chi tiết 1 tàu
// exports.getTrainById = async (req, res) => {
//   try {
//     const train = await Train.findById(req.params.id);

//     if (!train) {
//       return res.status(404).json({
//         message: "Không tìm thấy tàu",
//       });
//     }

//     res.json(train);
//   } catch (err) {
//     res.status(500).json({
//       message: err.message,
//     });
//   }
// };

const Train = require("../models/Train");
const Ticket = require("../models/Ticket");
const SeatLock = require("../models/SeatLock");

// lấy danh sách tàu
exports.getTrains = async (req, res) => {
  try {
    const trains = await Train.find();
    res.json(trains);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// lấy chi tiết 1 tàu
exports.getTrainById = async (req, res) => {
  try {
    const train = await Train.findById(req.params.id);

    if (!train) {
      return res.status(404).json({
        message: "Không tìm thấy tàu",
      });
    }

    res.json(train);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// tạo tàu
exports.createTrain = async (req, res) => {
  try {
    const trainData = { ...req.body };
    
    // Auto-generate coaches if not provided
    if (!trainData.coaches || trainData.coaches.length === 0) {
      trainData.coaches = [
        { coachNumber: 1, coachType: "soft_seat", capacity: 64, priceMultiplier: 1 },
        { coachNumber: 2, coachType: "soft_seat", capacity: 64, priceMultiplier: 1 },
        { coachNumber: 3, coachType: "soft_seat", capacity: 64, priceMultiplier: 1 },
        { coachNumber: 4, coachType: "sleeper", capacity: 28, priceMultiplier: 1.5 },
        { coachNumber: 5, coachType: "sleeper", capacity: 28, priceMultiplier: 1.5 },
      ];
      trainData.totalSeats = trainData.coaches.reduce((acc, coach) => acc + coach.capacity, 0);
    }

    const train = new Train(trainData);
    await train.save();
    res.json(train);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// cập nhật tàu
exports.updateTrain = async (req, res) => {
  try {
    const train = await Train.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(train);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// xóa tàu
exports.deleteTrain = async (req, res) => {
  try {
    await Train.findByIdAndDelete(req.params.id);

    res.json({
      message: "Đã xóa tàu",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.searchTrains = async (req, res) => {
  try {
    const { from = "", to = "", date = "", tripType = "", groupSize = "" } = req.query;

    let trains = await Train.find().lean(); // Use lean to easily add fields

    // Lọc bỏ các chuyến tàu đã qua ngày khởi hành
    const todayStr = new Date().toISOString().split("T")[0];
    trains = trains.filter(train => {
      if (!train.departureDate) return false;
      const trainDateStr = new Date(train.departureDate).toISOString().split("T")[0];
      return trainDateStr >= todayStr;
    });

    // Đếm số ghế đã đặt cho mỗi tàu
    const bookedCounts = await Ticket.aggregate([
      { $match: { status: "booked" } },
      { $group: { _id: "$train", count: { $sum: 1 } } }
    ]);

    const bookedMap = {};
    bookedCounts.forEach(b => {
      bookedMap[b._id.toString()] = b.count;
    });

    // Thêm trường availableSeats vào dữ liệu tàu
    trains = trains.map(train => {
      const booked = bookedMap[train._id.toString()] || 0;
      const total = train.totalSeats || train.seats || 0;
      return {
        ...train,
        bookedSeats: booked,
        availableSeats: Math.max(total - booked, 0)
      };
    });

    if (from) {
      trains = trains.filter((train) =>
        train.from?.toLowerCase().includes(from.toLowerCase())
      );
    }

    if (to) {
      trains = trains.filter((train) =>
        train.to?.toLowerCase().includes(to.toLowerCase())
      );
    }

    if (date) {
      trains = trains.filter((train) => {
        if (!train.departureDate) return false;

        const trainDate = new Date(train.departureDate)
          .toISOString()
          .split("T")[0];

        return trainDate === date;
      });
    }

    if (tripType === "group" && groupSize) {
      const groupNumber = parseInt(groupSize, 10);

      if (!isNaN(groupNumber)) {
        trains = trains.filter((train) => {
          return train.availableSeats >= groupNumber;
        });
      }
    }

    res.json(trains);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách ghế đã đặt hoặc đang giữ chỗ của một tàu
exports.getBookedSeats = async (req, res) => {
  try {
    const { trainId } = req.params;
    
    // Tìm tất cả các vé đã đặt hoặc đã thanh toán
    const tickets = await Ticket.find({
      train: trainId,
      status: "booked"
    }).select("coachNumber seatNumber paymentStatus").lean();

    // Tìm các ghế đang bị khóa (đang thanh toán)
    const locks = await SeatLock.find({
      trainId: trainId
    }).select("coachNumber seatNumber lockedBy").lean();

    // Map lock thành định dạng giống ticket nhưng có cờ isLocked
    const lockedSeats = locks.map(lock => ({
      coachNumber: lock.coachNumber,
      seatNumber: lock.seatNumber,
      isLocked: true,
      lockedBy: lock.lockedBy
    }));

    // Trả về chung 1 mảng để frontend tiện xử lý
    res.json([...tickets, ...lockedSeats]);
  } catch (error) {
    console.error("Lỗi lấy danh sách ghế:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi lấy dữ liệu ghế" });
  }
};

// Khóa ghế (Giữ chỗ)
exports.lockSeat = async (req, res) => {
  try {
    const { trainId } = req.params;
    const { coachNumber, seatNumber } = req.body;
    const userId = req.user.id;

    // Optional: Xóa các vé đã khóa của user này (nếu chỉ muốn user giữ 1 vé tại 1 thời điểm)
    await SeatLock.deleteMany({ lockedBy: userId });

    if (!coachNumber || !seatNumber) {
      return res.status(400).json({ message: "Vui lòng truyền số toa và số ghế" });
    }

    const newLock = new SeatLock({
      trainId,
      coachNumber: Number(coachNumber),
      seatNumber: seatNumber.toString(),
      lockedBy: userId
    });

    await newLock.save();
    res.json({ message: "Giữ chỗ thành công trong 10 phút" });

  } catch (error) {
    // E11000 duplicate key error means someone else locked it
    if (error.code === 11000) {
      return res.status(400).json({ message: "Ghế này hiện đang có người khác giữ chỗ. Vui lòng chọn ghế khác!" });
    }
    console.error("Lỗi lockSeat:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi giữ chỗ" });
  }
};