import JWT from "jsonwebtoken";
import userMdoel from "../models/userModel.js";

const cleanToken = (token) => {
  return token.replace("Bearer ", "").replace("bearer ", "");
};

// USER AUTH
export const isAuth = async (req, res, next) => {
  try {
    const token = cleanToken(req.headers.authorization);
    console.log(token);
    if (!token) {
      throw new Error("UnAuthorized User");
    }

    const decodeData = JWT.verify(token, process.env.JWT_SECRET);
    req.user = await userMdoel.findById(decodeData._id);
    next();
  } catch (error) {
    return res.status(401).send({
      success: false,
      message: "UnAuthorized User",
    });
  }
};

//ADMIN Auth
export const isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Permission denied. Admin access required.",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error in isAdmin middleware",
    });
  }
};
