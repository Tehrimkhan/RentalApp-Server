import express from "express";
import {
  createCarPostController,
  deleteCarPostController,
  getCarPostController,
  getUserCarPostController,
  paymentController,
} from "../controllers/carpostController.js";
import { isAuth } from "../middlewares/authMiddleware.js";
import { multipleUpload } from "../middlewares/multer.js";

//ROUTER OBJECT
const router = express.Router();

//CREATE POST
router.post("/create-post", isAuth, multipleUpload, createCarPostController);

//GET ALL POST
router.get("/get-all-post", getCarPostController);

//Get USER POSTS
router.get("/get-user-post", isAuth, getUserCarPostController);

//DELETE POSTS
router.delete("/delete-post/:id", isAuth, deleteCarPostController);

//ACCEPT SUBSCRIPTION
router.post("/payments", isAuth, paymentController);

//EXPORT
export default router;
