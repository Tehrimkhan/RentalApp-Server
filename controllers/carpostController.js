import carpostModel from "../models/carpostModel.js";
import cloudinary from "cloudinary";
import { getDataUri } from "../utils/feature.js";
import { stripe } from "../server.js";

//CREATE POST
export const createCarPostController = async (req, res) => {
  try {
    const { postImages, title, make, model, variant, rent, description } =
      req.body;
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
    const post = await carpostModel({
      //postImages: [images],
      postImages,
      title,
      make,
      model,
      variant,
      rent,
      description,
      postedBy: req.user._id,
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
      message: "Error In Create Car Post API",
      error,
    });
  }
};
// GET ALL POSTS
export const getCarPostController = async (req, res) => {
  try {
    const posts = await carpostModel
      .find()
      .populate("postedBy", "_id name")
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
      message: "Error In GET ALL POSTS API",
      error,
    });
  }
};

//GET USER POSTS
export const getUserCarPostController = async (req, res) => {
  try {
    const userPosts = await carpostModel.find({ postedBy: req.user._id });
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
export const deleteCarPostController = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPost = await carpostModel.findByIdAndDelete(id);

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
export const paymentController = async (req, res) => {
  try {
    //get amount
    const { rent, name } = req.body;
    //VALIDATION
    if (!rent && !name) {
      res.status(404).send({
        success: false,
        message: "Name And Total Amount Is Required!",
      });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(rent * 100),
      currency: "usd",
      payment_method_types: ["card"],
      metadata: { name, rent },
    });
    const client_secret = paymentIntent.client_secret;
    res.status(200).send({
      success: true,
      message: "PAYMENT IS DONE!",
      client_secret,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error PAYMENT API",
      error,
    });
  }
};

//stripePaymentController
// export const stripePaymentController = async (req, res) => {
//   try {
//     const data = req.body;
//     const deductionAmount = Math.round(data.rent * 100 * 0.05);

//     const lineItem = {
//       price_data: {
//         currency: "pkr",
//         product_data: {
//           name: data.name,
//         },
//         unit_amount: deductionAmount,
//       },
//       quantity: 1,
//     };

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [lineItem],
//       mode: "payment",
//       success_url: data.success_url || "http://localhost:19006/Dashboard",
//       cancel_url: data.cancel_url || "http://localhost:19006/MyAdsPage",
//     });

//     res.status(200).json({ id: session.id });
//   } catch (error) {
//     console.error("Error in stripePaymentController:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };
