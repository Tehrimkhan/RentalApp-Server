import express from "express";
import {
  bannerImageController,
  deletebannerImageController,
  getbannerImageController,
  updateBannerImageController,
} from "../controllers/bannerImageController.js";

// router object
const router = express.Router();

//routes
//register
router.post("/create", bannerImageController);
router.put("/update/:id", updateBannerImageController);
router.get("/get", getbannerImageController);
router.delete("/delete/:id", deletebannerImageController);

//login

export default router;
