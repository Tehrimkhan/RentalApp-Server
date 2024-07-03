import express from "express";
import {
  deleteRenterInfoController,
  getRenterInfoController,
  renterInfoController,
} from "../controllers/rentedInfoController.js";
import { isAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register-renter", isAuth, renterInfoController);

router.get("/get-renter-info", isAuth, getRenterInfoController);

router.delete("/renter-info/:renterInfoId", isAuth, deleteRenterInfoController);

export default router;
