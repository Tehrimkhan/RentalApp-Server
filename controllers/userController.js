import userModel from "../models/userModel.js";
import cloudinary from "cloudinary";
import { getDataUri } from "../utils/feature.js";
import multer from "multer";
import Conversation from "../models/conversationModel.js";
import messagesMdoel from "../models/messagesModel.js";

// const imgconfig = multer.diskStorage({
//   destination: (req, file, callback) => {
//     callback(null, "./uploads");
//   },
//   filename: (req, file, callback) => {
//     callback(null, `image-${Date.now()}.${file.originalname}`);
//   },
// });

// const isImage = (req, file, callback) => {
//   if (file.mimetype.startsWith("image")) {
//     callback(null, true);
//   } else {
//     callback(new Error("only image is allow"));
//   }
// };
// export const upload = multer({
//   storage: imgconfig,
//   fileFilter: isImage,
// });
export const UploadImageController = async (req, res) => {
  try {
    const cloudinaryResponse = req.body.cloudinaryResponse;
    // console.log("data reached backend", cloudinaryResponse);

    const user = await userModel.findById(req.user._id);

    user.profileImage = [];

    user.profileImage.push(cloudinaryResponse);

    await user.save();

    res.status(200).json({ message: "Profile image uploaded successfully" });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
//UPLAOD IMAGE
// export const uploadUserImage = async (req, res) => {
//   try {
//     console.log("Request Body:", req.body);
//     console.log("Uploaded file:", req.file);
//     res.status(200).json({ message: "File uploaded successfully" });
//   } catch (error) {
//     console.error("Error uploading file:", error);
//     res.status(500).json({ message: "Error uploading file" });
//   }
// };

//REGISTER
export const registerController = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, profileImage } = req.body;
    //VALIDATION
    if (!name || !email || !password || !confirmPassword) {
      return res.status(500).send({
        success: false,
        message: "Please Provide All Fields!",
      });
    }
    //CHECK EXISTING USER
    const exisitingUSer = await userModel.findOne({ email });
    //VALIDATION
    if (exisitingUSer) {
      return res.status(500).send({
        success: false,
        message: "Email Already Taken!",
      });
    }
    const user = await userModel.create({
      name,
      email,
      password,
      confirmPassword,
      profileImage,
    });
    res.status(201).send({
      success: true,
      message: "Registeration Success, Please Login!",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Register API",
      error,
    });
  }
};

//LOGIN CONTROLLER
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    //VALIDATION
    if (!email || !password) {
      return res.status(500).send({
        success: false,
        message: "Please Add Email OR Password!",
      });
    }
    //CHECK USER
    const user = await userModel.findOne({ email });
    //USER VALIDATION
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User Not Found",
      });
    }
    //CHECK PASSWORD
    const isMatch = await user.comparePassword(password);
    //VALIDATION PASSWORD
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "Invalid credentials!",
      });
    }
    //JWT TOKEN
    const token = user.generateToken();

    res
      .status(200)
      .cookie("token", token, {
        expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        secure: process.env.NODE_ENV === "development" ? true : false,
        httpOnly: process.env.NODE_ENV === "development" ? true : false,
        sameSite: process.env.NODE_ENV === "development" ? true : false,
      })
      .send({
        success: true,
        message: "Login Successfully",
        token,
        user,
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: "false",
      message: "Error In Login Api",
      error,
    });
  }
};

// GET USER
export const getUserProfileController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    user.password = undefined;
    user.confirmPassword = undefined;
    res.status(200).send({
      success: true,
      message: "User Profile Fetched Successfully!",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Profile API",
      error,
    });
  }
};
//LOGOUT PROFILE
export const logoutController = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", "", {
        expires: new Date(Date.now()),
        secure: process.env.NODE_ENV === "development" ? true : false,
        httpOnly: process.env.NODE_ENV === "development" ? true : false,
        sameSite: process.env.NODE_ENV === "development" ? true : false,
      })
      .send({
        success: true,
        message: "Logout Successfully",
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Logout API",
      error,
    });
  }
};
//UPDATE USER PROFILE
export const updateProfileController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    const { name, email } = req.body;
    //VALIDATION + UPDATE
    if (name) user.name = name;
    if (email) user.email = email;
    //SAVE USER
    await user.save();
    res.status(200).send({
      success: true,
      message: "User Profile Updated!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Update Profile API",
      error,
    });
  }
};
//UPDATE USER PASSWORD
export const udpatePasswordController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    const { oldPassword, newPassword } = req.body;
    //VALIDATION
    if (!oldPassword || !newPassword) {
      return res.status(500).send({
        success: false,
        message: "Please Provide Old Or New Password!",
      });
    }
    //CHECK OLD PASSWORD
    const isMatch = await user.comparePassword(oldPassword);
    //VALIDATION
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "Invalid Old Password!",
      });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).send({
      success: true,
      message: "Password Updated Successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Update Password API",
      error,
    });
  }
};
//UPDATE PROFILE IMAGE
export const updateProfilePicController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    // Check if the user has a profileImage before attempting to destroy it
    if (user.profileImage && user.profileImage.public_id) {
      await cloudinary.v2.uploader.destroy(user.profileImage.public_id);
    }
    console.log(req.file);
    // Check if req.file is available
    if (!req.file) {
      console.error("No file uploaded");
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    // FILE GET FROM CLIENT PHOTO
    const fileDataUri = getDataUri(req.file);
    console.log(fileDataUri);

    // UPDATE
    const cdb = await cloudinary.v2.uploader.upload(fileDataUri.content);
    user.profileImage = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };

    // SAVE FUNCTION
    await user.save();

    res.status(200).send({
      success: true,
      message: "Profile Picture Updated!",
    });
  } catch (error) {
    console.error("Error in Update Profile Image API:", error);
    res.status(500).send({
      success: false,
      message: "Error In Update Profile Image API",
      error,
    });
  }
};

//DELETE USER
export const deleteUserController = async (req, res) => {
  try {
    const userIdToDelete = req.params.userId;

    // Check if the user exists
    const userToDelete = await userModel.findById(userIdToDelete);
    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Perform the logic to delete the user
    await userToDelete.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error deleting user.",
      error,
    });
  }
};

//GET All USERS
export const getAllUserController = async (req, res) => {
  try {
    // Check if the requesting user is an admin
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Permission denied. Admin access required.',
    //   });
    // }

    const allUsers = await userModel.find(
      { role: { $ne: "admin" } },
      { password: 0, confirmPassword: 0 }
    );

    res.status(200).json({
      success: true,
      message: "Users fetched successfully.",
      users: allUsers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in Get Users Profile API",
      error,
    });
  }
};

// UPDATE USER ROLE
export const updateUserRoleController = async (req, res) => {
  try {
    const { userId, newRole } = req.body;
    if (!userId || !newRole) {
      return res.status(400).json({
        success: false,
        message: "Please provide userId and newRole.",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Permission denied. Admin access required.",
      });
    }
    const userToUpdate = await userModel.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
    userToUpdate.role = newRole;
    await userToUpdate.save();

    res.status(200).json({
      success: true,
      message: "User role updated successfully.",
      user: userToUpdate,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in Update User Role API",
      error,
    });
  }
};
export const getUserForSideBarController = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const filteredUsers = await userModel
      .find({
        _id: { $ne: loggedInUserId },
        role: { $ne: "admin" },
      })
      .select("-password -confirmPassword");

    res.status(200).json({
      success: true,
      message: "User found successfully.",
      filteredUsers,
    });
  } catch (error) {
    console.error("Error in get User SideBar", error.message);
    res.status(500).json({
      success: false,
      message: "Error in Get User Sidebar API",
      error,
    });
  }
};

export const getChattedUsersController = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    }).populate("participants", "name email profileImage");

    let chattedUsers = [];

    for (const conversation of conversations) {
      const participantIds = conversation.participants
        .filter(
          (participant) => participant._id.toString() !== userId.toString()
        )
        .map((participant) => participant._id);

      const lastMessage = await messagesMdoel
        .findOne({
          $or: [
            { senderId: participantIds[0] },
            { receiverId: participantIds[0] },
          ],
        })
        .sort({ createdAt: -1 })
        .limit(1);

      const chattedUser = {
        participant: conversation.participants.find(
          (participant) => participant._id.toString() !== userId.toString()
        ),
        lastMessage: lastMessage ? lastMessage.message : null,
        lastMessageTimestamp: lastMessage ? lastMessage.createdAt : null,
      };

      chattedUsers.push(chattedUser);
    }
    chattedUsers.sort((a, b) => {
      return (
        new Date(b.lastMessageTimestamp) - new Date(a.lastMessageTimestamp)
      );
    });

    res.status(200).json({
      success: true,
      message: "Chatted users fetched successfully.",
      chattedUsers,
    });
  } catch (error) {
    console.log("Error in getChattedUsersController:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching chatted users.",
      error: error.message,
    });
  }
};

export const getTotalUsersController = async (req, res) => {
  try {
    const totalUsersCount = await userModel.countDocuments();

    res.status(200).json({
      success: true,
      message: "Total number of users fetched successfully.",
      totalUsersCount,
    });
  } catch (error) {
    console.error("Error fetching total number of users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching total number of users.",
      error: error.message,
    });
  }
};
