import rentedInfoModel from "../models/rentedInfoModel.js";

export const renterInfoController = async (req, res) => {
  try {
    const { postName, fullName, email, dob, phoneNumber, address } = req.body;
    if (!postName || !fullName || !email || !dob || !phoneNumber || !address) {
      return res.status(500).send({
        success: false,
        message: "Please Provide All Fields!",
      });
    }
    const user = await rentedInfoModel.create({
      postName,
      fullName,
      email,
      dob,
      phoneNumber,
      address,
      postedBy: req.user._id,
    });
    res.status(201).send({
      success: true,
      message: "Registeration Success!",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Register Renter API",
      error,
    });
  }
};
export const getRenterInfoController = async (req, res) => {
  try {
    const userId = req.user._id; // Extracting userId from req.user
    const renterInfo = await rentedInfoModel.find({ postedBy: userId });
    if (!renterInfo || renterInfo.length === 0) {
      return res.status(404).send({
        success: false,
        message: "Renter information not found",
      });
    }
    res.status(200).send({
      success: true,
      message: "Renter information found",
      renterInfo,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error fetching renter information",
      error,
    });
  }
};

export const deleteRenterInfoController = async (req, res) => {
  try {
    const userId = req.user._id; // Extracting userId from req.user
    const { renterInfoId } = req.params; // Extracting renterInfoId from request parameters

    // Check if the renter information exists
    const renterInfo = await rentedInfoModel.findOne({
      _id: renterInfoId,
      postedBy: userId,
    });
    if (!renterInfo) {
      return res.status(404).send({
        success: false,
        message: "Renter information not found",
      });
    }

    // Delete the renter information
    await rentedInfoModel.deleteOne({ _id: renterInfoId });

    res.status(200).send({
      success: true,
      message: "Renter information deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error deleting renter information",
      error,
    });
  }
};
