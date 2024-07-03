import postModel from "../models/postModel.js";
import PaymentTransactionModel from "../models/paymentTransactionModel.js";
import cloudinary from "cloudinary";
import { getDataUri } from "../utils/feature.js";
import schedule from "node-schedule";
import { stripe } from "../server.js";
import { setTimeout } from "timers";

export const createPostController = async (req, res) => {
  try {
    const {
      postImages,
      title,
      name,
      make,
      model,
      ac,
      variant,
      area,
      floor,
      room,
      color,
      gender,
      size,
      fabric,
      material,
      style,
      rent,
      description,
    } = req.body;
    //VALIDATION
    // if (
    //   !postImages ||
    //   !title ||
    //   !make ||
    //   !model ||
    //   !variant ||
    //   !rent ||
    //   !description
    // ) {
    //   return res.status(500).send({
    //     success: false,
    //     message: "Please Provide All Fields!",
    //   });
    // }
    //added Things
    // if (!req.file) {
    //   return res.status(500).send({
    //     success: false,
    //     message: "Profile Provide Image!",
    //   });
    // }
    //  const file = getDataUri(req.file);
    //  const cdb = await cloudinary.v2.uploader.upload(file.content);
    //  const images = {
    //    public_id: cdb.public_id,
    //    url: cdb.secure_url,
    //  };
    const post = await postModel({
      //postImages: [images],
      postImages,
      title,
      name,
      make,
      model,
      ac,
      variant,
      area,
      floor,
      room,
      color,
      gender,
      size,
      fabric,
      material,
      style,
      rent,
      description,
      postedBy: req.user._id,
      status: "pending",
      active: true,
    }).save();
    res.status(201).send({
      sucess: true,
      message: "Post Created Sucessfully!",
      post,
    });
    console.log(req);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      sucess: false,
      message: "Error In Create Post API",
      error,
    });
  }
};
// GET ADMIN ALL POSTS
export const getAdminPostController = async (req, res) => {
  try {
    const posts = await postModel
      .find()
      .populate("postedBy", "_id name profileImage")
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      message: "All Posts Data",
      posts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In GETTING ALL POSTS API",
      error,
    });
  }
};
//GET ALL APPROVED POSTS
export const getApprovedPostController = async (req, res) => {
  try {
    const { keyword } = req.query;
    //const userId = req.user._id.toString();
    //console.log("Keyword:", keyword);
    let sortCriteria = { rating: -1 };

    // console.log(userId);
    // // Define the sorting criteria
    // let sortCriteria = { rating: -1 };
    //if (userId === "65e30cd149ebc9f65f700e2d") {
    //  sortCriteria = { rent: 1 };
    //}

    const approvedPosts = await postModel
      .find({
        status: "approved",
        active: true,
        name: {
          $regex: keyword ? keyword : "",
          $options: "i",
        },
      })
      .populate("postedBy", "_id name profileImage")
      .sort(sortCriteria);

    res.status(200).send({
      success: true,
      message: "All Approved Posts Data sorted accordingly",
      totalPosts: approvedPosts.length,
      posts: approvedPosts,
    });
  } catch (error) {
    console.log("Error in getApprovedPostController:", error);
    res.status(500).send({
      success: false,
      message: "Error in fetching approved posts",
      error: error.message, // Include error message in the response for better debugging
    });
  }
};

// export const getApprovedPostController = async (req, res) => {
//   try {
//     const { keyword } = req.query;
//     const approvedPosts = await postModel
//       .find({
//         status: "approved",
//         name: {
//           $regex: keyword ? keyword : "",
//           $options: "i",
//         },
//       })
//       .populate("postedBy", "_id name")
//       .sort({ rent: -1 });

//     res.status(200).send({
//       success: true,
//       message: "All Approved Posts Data",
//       totalPosts: approvedPosts.length,
//       posts: approvedPosts,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       success: false,
//       message: "Error in fetching approved posts",
//       error,
//     });
//   }
// };
//GET TOP POSTS
export const getTopPosts = async (req, res) => {
  try {
    const posts = await postModel.find({}).sort({ rating: -1 });
    res.status(200).send({
      success: true,
      message: "Top Rated Posts",
      posts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Top Posts",
      error,
    });
  }
};

//Approve by admin
export const updatePostStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status !== "approved" && status !== "rejected") {
      return res.status(400).send({
        success: false,
        message: "Invalid status. Please provide 'approved' or 'rejected'.",
      });
    }

    const updatedPost = await postModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).send({
        success: false,
        message: "Post not found for status update",
      });
    }

    res.status(200).send({
      success: true,
      message: `Post ${
        status === "approved" ? "approved" : "rejected"
      } successfully`,
      post: updatedPost,
    });

    // delete after 1 day
    if (status === "rejected") {
      setTimeout(async () => {
        const deletedPost = await postModel.findByIdAndDelete(id);
        console.log("Post deleted after 5 minutes:", deletedPost);
      }, 24 * 60 * 60 * 1000);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in updating post status",
      error,
    });
  }
};

//GET USER POSTS
export const getUserPostController = async (req, res) => {
  try {
    const userPosts = await postModel.find({ postedBy: req.user._id });
    res.status(200).send({
      sucess: true,
      message: "USER POSTS",
      userPosts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In GET USER POSTS API",
      error,
    });
  }
};

//DELETE POST
export const deletePostController = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPost = await postModel.findByIdAndDelete(id);

    if (!deletedPost) {
      return res.status(404).send({
        success: false,
        message: "Post not found for deletion",
      });
    }

    res.status(200).send({
      success: true,
      message: "POST IS DELETED",
      deletedPost,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In DELETING POSTS API",
      error,
    });
  }
};

//PAYMENT CONTROLLER paymentController
// export const paymentController = async (req, res) => {
//   try {
//     //get amount
//     const { rent, name } = req.body;
//     //VALIDATION
//     if (!rent && !name) {
//       res.status(404).send({
//         success: false,
//         message: "Name And Total Amount Is Required!",
//       });
//     }
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: Math.round(rent * 100),
//       currency: "usd",
//       payment_method_types: ["card"],
//       metadata: { name, rent },
//     });
//     const client_secret = paymentIntent.client_secret;
//     res.status(200).send({
//       success: true,
//       message: "PAYMENT IS DONE!",
//       client_secret,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       success: false,
//       message: "Error PAYMENT API",
//       error,
//     });
//   }
// };
//Working Payment Controller
export const stripePaymentController = async (req, res) => {
  try {
    const data = req.body;
    const deductionAmount = Math.round(data.rent * 100 * 0.05);

    const lineItem = {
      price_data: {
        currency: "pkr",
        product_data: {
          name: data.name,
        },
        unit_amount: deductionAmount,
      },
      quantity: 1,
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [lineItem],
      mode: "payment",
      success_url: data.success_url || "http://127.0.0.1:19006/MyAdsPage",
      cancel_url: data.cancel_url || "http://127.0.0.1:19006/MyAdsPage",
    });

    // Log payment information to the database
    const paymentTransaction = await PaymentTransactionModel({
      paymentId: session.id,
      totalamount: data.rent,
      percentage: deductionAmount,
      currency: "pkr",
      productName: data.name,
      paymentStatus: "pending",
    }).save();

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error("Error in stripePaymentController:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// Fetch all payment transactions
export const getAllPaymentTransactionsController = async (req, res) => {
  try {
    const paymentTransactions = await PaymentTransactionModel.find().sort({
      createdAt: -1,
    });
    // console.log("transaction detail", paymentTransactions);
    res.status(200).send({
      success: true,
      message: "All Payment Transactions Data",
      paymentTransactions,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in fetching payment transactions",
      error,
    });
  }
};

//fetch payment details
export const getAllPaymentController = async (req, res) => {
  try {
    const { paymentId, totalamount, percentage, currency, productName } =
      req.body;

    // Validate data (optional, based on your needs)

    // Create new payment transaction instance
    const newTransaction = new PaymentTransactionModel({
      paymentId,
      totalamount,
      percentage,
      currency,
      productName,
    });

    // Save transaction to MongoDB
    const savedTransaction = await newTransaction.save();

    res.status(201).json({
      success: true,
      message: "Payment transaction successfull!",
      transaction: savedTransaction,
    });
  } catch (error) {
    console.error("Error saving payment transaction:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save payment transaction",
      error: error.message,
    });
  }
};

//DISCOUNT
export const allPostDiscountController = async (req, res) => {
  try {
    const { discountPercentage, startDate, endDate } = req.body;

    // Validate inputs
    if (
      !discountPercentage ||
      isNaN(discountPercentage) ||
      discountPercentage <= 0 ||
      discountPercentage > 100
    ) {
      return res.status(400).send({
        success: false,
        message:
          "Invalid discount percentage. Please provide a valid percentage between 1 and 100.",
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).send({
        success: false,
        message: "Discount start date and end date are required.",
      });
    }

    const startTime = new Date(startDate);
    const endTime = new Date(endDate);

    if (
      isNaN(startTime.getTime()) ||
      isNaN(endTime.getTime()) ||
      startTime >= endTime
    ) {
      return res.status(400).send({
        success: false,
        message: "Invalid start date or end date.",
      });
    }

    // Get all posts
    const allPosts = await postModel.find();
    const originalRents = [];

    for (const post of allPosts) {
      //original rent value
      originalRents.push({ postId: post._id, originalRent: post.rent });

      const discountedRent = post.rent - post.rent * (discountPercentage / 100);

      // Update the discounted rent
      await postModel.findByIdAndUpdate(post._id, { rent: discountedRent });
    }

    // reset rents to their original prices after the end time
    const job = schedule.scheduleJob(endTime, async () => {
      for (const originalRent of originalRents) {
        const { postId, originalRent: originalValue } = originalRent;
        await postModel.findByIdAndUpdate(postId, { rent: originalValue });
      }
    });

    res.status(200).send({
      success: true,
      message: `Discount of ${discountPercentage}% applied to all posts until ${endTime}.`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in applying discount.",
      error,
    });
  }
};
//REVIEWS Comment
// export const postReviewController = async (req, res) => {
//   try {
//     const { comment, rating } = req.body;
//     // find post
//     const post = await postModel.findById(req.params.id);

//     // Find the user's existing reviews
//     const userReviews = post.reviews.filter(
//       (r) => r.user.toString() === req.user._id.toString()
//     );

//     // If the user has already provided a rating, update the existing review
//     if (userReviews.length > 0 && userReviews[0].rating !== undefined) {
//       if (rating !== undefined) {
//         userReviews[0].rating = Number(rating);
//       }
//     } else {
//       // If the user is adding a rating for the first time, and comment is not provided
//       if (
//         !userReviews.length &&
//         rating !== undefined &&
//         comment === undefined
//       ) {
//         return res.status(400).send({
//           success: false,
//           message: "Please provide a comment along with the initial rating.",
//         });
//       }

//       // Review or comment object
//       const reviewOrComment = {
//         name: req.user.name,
//         rating: rating !== undefined ? Number(rating) : undefined,
//         comment: comment || (rating === undefined ? "No comment" : undefined),
//         user: req.user._id,
//       };

//       // Push the new review or comment
//       post.reviews.push(reviewOrComment);
//     }

//     // Number of reviews
//     post.numReviews = post.reviews.length;

//     // Calculate average rating only for reviews with ratings
//     const ratedReviews = post.reviews.filter((r) => r.rating !== undefined);
//     post.rating =
//       ratedReviews.reduce((acc, item) => item.rating + acc, 0) /
//       ratedReviews.length;

//     // Save
//     await post.save();

//     res.status(200).send({
//       success: true,
//       message: "Review or comment added!",
//     });
//   } catch (error) {
//     console.log(error);
//     // Cast error || OBJECT ID
//     if (error.name === "CastError") {
//       return res.status(500).send({
//         success: false,
//         message: "Invalid Id",
//       });
//     }
//     res.status(500).send({
//       success: false,
//       message: "Error in Review or Comment API",
//       error,
//     });
//   }
// };
export const postCommentController = async (req, res) => {
  try {
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).send({
        success: false,
        message: "Comment cannot be empty",
      });
    }

    const post = await postModel.findById(req.params.id);

    if (!post) {
      return res.status(404).send({
        success: false,
        message: "Post not found",
      });
    }

    const review = {
      name: req.user.name,
      comment,
      user: req.user._id,
    };

    post.reviews.push(review);

    post.numReviews = post.reviews.length;

    await post.save();

    res.status(200).send({
      success: true,
      message: "Comment added successfully",
    });
  } catch (error) {
    console.error("Error in postCommentController:", error);

    if (error.name === "CastError") {
      return res.status(400).send({
        success: false,
        message: "Invalid post ID",
      });
    }

    res.status(500).send({
      success: false,
      message: "Error in Comment API",
      error: error.message,
    });
  }
};

export const postRatingController = async (req, res) => {
  try {
    const { rating } = req.body;
    // find post
    const post = await postModel.findById(req.params.id);

    // Find the user's existing reviews
    const userReviews = post.reviews.filter(
      (r) => r.user.toString() === req.user._id.toString()
    );

    // If the user has already provided a rating, update the existing review
    if (userReviews.length > 0 && userReviews[0].rating !== undefined) {
      return res.status(400).send({
        success: false,
        message: "You have already provided a rating for this post.",
      });
    }

    // Review or comment object
    const review = {
      name: req.user.name,
      rating: Number(rating),
      user: req.user._id,
    };

    // Push the new review or comment
    post.reviews.push(review);

    // Number of reviews
    post.numReviews = post.reviews.length;

    // Calculate average rating only for reviews with ratings
    const ratedReviews = post.reviews.filter((r) => r.rating !== undefined);
    post.rating =
      ratedReviews.reduce((acc, item) => item.rating + acc, 0) /
      ratedReviews.length;

    // Save
    await post.save();

    res.status(200).send({
      success: true,
      message: "Rating added!",
    });
  } catch (error) {
    console.log(error);
    // Cast error || OBJECT ID
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in Rating API",
      error,
    });
  }
};
//FILTERSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS
// FILTER BY LOW TO HIGH RENT
export const lowtoHighRentController = async (req, res) => {
  try {
    const posts = await postModel.find().sort({ rent: 1 });

    res.status(200).send({
      success: true,
      message: "Posts sorted by low to high rent",
      posts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Filter API",
      error,
    });
  }
};
// FILTER BY HIGH TO LOW RENT
export const hightoLowRentController = async (req, res) => {
  try {
    const posts = await postModel.find().sort({ rent: 1 });

    res.status(200).send({
      success: true,
      message: "Posts sorted by high to lowrent",
      posts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Filter API",
      error,
    });
  }
};

export const changePostStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    const post = await postModel.findById(id);

    // Check if the post exists
    if (!post) {
      return res.status(404).send({
        success: false,
        message: "Post not found",
      });
    }

    // Check if the user trying to change the status is the one who posted it
    if (post.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).send({
        success: false,
        message: "You are not authorized to change the status of this post",
      });
    }

    // Update the active status of the post
    post.active = active;
    await post.save();

    res.status(200).send({
      success: true,
      message: `Post ${active ? "activated" : "deactivated"} successfully`,
      post,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in changing post status",
      error,
    });
  }
};

export const getTotalPostsAndNameCounts = async (req, res) => {
  try {
    // Fetch all documents
    const allPosts = await postModel.find();

    // Filter out inactive documents
    const activePosts = allPosts.filter((post) => post.active);

    // Count total active posts
    const totalPostsCount = activePosts.length;

    // Aggregate count of active posts by title
    const nameCounts = activePosts.reduce((counts, post) => {
      counts[post.title] = (counts[post.title] || 0) + 1;
      return counts;
    }, {});

    const response = {
      totalPostsCount,
      nameCounts,
    };

    res.status(200).send({
      success: true,
      message: "Total number of posts and name counts",
      data: response,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in getting total posts and name counts",
      error,
    });
  }
};

export const getUserPostCountController = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all posts for the user
    const userPosts = await postModel.find({ postedBy: userId });

    // Initialize an empty object to store name counts
    const nameCounts = {};

    // Count the number of posts for each title
    userPosts.forEach((post) => {
      const title = post.title;
      if (nameCounts[title]) {
        nameCounts[title]++;
      } else {
        nameCounts[title] = 1;
      }
    });

    // Calculate the total number of user posts
    const totalUserPostsCount = userPosts.length;

    const response = {
      totalPostsCount: totalUserPostsCount,
      nameCounts: Object.entries(nameCounts).map(([title, count]) => ({
        _id: title,
        count: count,
      })),
    };

    res.status(200).send({
      success: true,
      message: "Total number of user posts and name counts",
      data: response,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in getting user posts and name counts",
      error,
    });
  }
};

export const getInactivePostCountController = async (req, res) => {
  try {
    // Find inactive posts
    const inactivePostsCount = await postModel.countDocuments({
      active: false,
    });

    res.status(200).send({
      success: true,
      message: "Number of inactive posts",
      count: inactivePostsCount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in getting inactive post count",
      error,
    });
  }
};
export const getNumberOfPaymentsController = async (req, res) => {
  try {
    const numberOfPayments = await PaymentTransactionModel.countDocuments();
    res.status(200).send({
      success: true,
      message: "Number of payments done",
      count: numberOfPayments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in getting the number of payments",
      error,
    });
  }
};
