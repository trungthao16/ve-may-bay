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
    const train = new Train(req.body);
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