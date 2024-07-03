import express from "express";
import {
  allPostDiscountController,
  createPostController,
  deletePostController,
  getAdminPostController,
  getAllPaymentTransactionsController,
  getApprovedPostController,
  getTopPosts,
  getUserPostController,
  hightoLowRentController,
  lowtoHighRentController,
  postRatingController,
  postCommentController,
  // postReviewController,
  stripePaymentController,
  updatePostStatusController,
  changePostStatusController,
  getTotalPostsAndNameCounts,
  getUserPostCountController,
  getInactivePostCountController,
  getNumberOfPaymentsController,
  getAllPaymentController,
} from "../controllers/postController.js";
import { isAdmin, isAuth } from "../middlewares/authMiddleware.js";
import { multipleUpload } from "../middlewares/multer.js";
import { paymentController } from "../controllers/carpostController.js";

//ROUTER OBJECT
const router = express.Router();

//CREATE POST
router.post("/create-post", isAuth, multipleUpload, createPostController);

//GET ADMIN ALL POST
router.get("/get-admin-all-post", getAdminPostController);

//GET ALL APPROVED POSTS
router.get("/get-approved-posts", getApprovedPostController);

//GET TOP POSTS
router.get("/get-top-posts", getTopPosts);

//Approve post by admin
router.put("/approve-post/:id", isAuth, isAdmin, updatePostStatusController);

//Get USER POSTS
router.get("/get-user-post", isAuth, getUserPostController);

//DELETE POSTS isAuth,
router.delete("/delete-post/:id", isAuth, deletePostController);

//ACCEPT SUBSCRIPTION
router.post("/payments", isAuth, paymentController);
router.post("/create-checkout-session", stripePaymentController);

//SHOW PAYMENT TO ADMINS
router.get(
  "/get-all-payment-transactions",
  isAuth,
  isAdmin,
  getAllPaymentTransactionsController
);
//SHOW 2 PAYMENT TO ADMINS
router.post("/paymentInfo", isAuth, getAllPaymentController);

//Discount
router.post("/discount", isAuth, isAdmin, allPostDiscountController);

//FILTERS
router.get("/filters/low-to-high-rent", lowtoHighRentController);
router.get("/filters/high-to-low-rent", hightoLowRentController);

// //Post Reviews
// router.put("/ratings/:id", isAuth, postRatingController);

// router.put("/ratings/:id", isAuth, postReviewController);
// Route for posting comments
router.put("/comments/:id", isAuth, postCommentController);

// Route for posting ratings
router.put("/ratings/:id", isAuth, postRatingController);

router.put("/status/:id", isAuth, changePostStatusController);

router.get("/postcount", getTotalPostsAndNameCounts);

router.get("/user-postcount", isAuth, getUserPostCountController);

router.get("/inactive-postcount", getInactivePostCountController);

router.get("/paymentscount", getNumberOfPaymentsController);

//EXPORT
export default router;
