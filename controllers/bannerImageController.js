import bannerModel from "../models/bannerImageModel.js";

export const bannerImageController = async (req, res) => {
  try {
    const { images } = req.body;

    // Validation: Check if images are provided
    if (!images) {
      return res.status(400).send({
        success: false,
        message: "Please provide valid image data in 'images' field.",
      });
    }

    // Create a new banner with provided images
    const imagesData = await bannerModel.create({
      images,
    });

    // Send success response
    res.status(201).send({
      success: true,
      message: "Images stored successfully.",
      imagesData,
    });
  } catch (error) {
    // Handle different types of errors
    console.error(error);

    // Database validation error
    if (error.name === "ValidationError") {
      return res.status(400).send({
        success: false,
        message: "Invalid image data. Please check the format and try again.",
      });
    }

    // Database error
    if (error.name === "MongoError" && error.code === 11000) {
      return res.status(400).send({
        success: false,
        message: "Duplicate key error. Images already exist.",
      });
    }

    // Other unexpected errors
    res.status(500).send({
      success: false,
      message: "Internal Server Error. Please try again later.",
      error: error.message,
    });
  }
};
// Get IMages

export const getbannerImageController = async (req, res) => {
  try {
    const data = await bannerModel.find();

    return res.status(200).json(data);
  } catch (error) {
    // Handle different types of errors
    console.error(error);

    // Database validation error
    if (error.name === "ValidationError") {
      return res.status(400).send({
        success: false,
        message: "Invalid image data. Please check the format and try again.",
      });
    }

    // Database error
    if (error.name === "MongoError" && error.code === 11000) {
      return res.status(400).send({
        success: false,
        message: "Duplicate key error. Images already exist.",
      });
    }

    // Other unexpected errors
    res.status(500).send({
      success: false,
      message: "Internal Server Error. Please try again later.",
      error: error.message,
    });
  }
};

//delete

export const deletebannerImageController = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await bannerModel.deleteOne({ _id: id });

    return res.status(200).json({ message: "successfully deleted image" });
  } catch (error) {
    // Handle different types of errors
    console.error(error);

    // Database validation error
    if (error.name === "ValidationError") {
      return res.status(400).send({
        success: false,
        message: "Invalid image data. Please check the format and try again.",
      });
    }

    // Database error
    if (error.name === "MongoError" && error.code === 11000) {
      return res.status(400).send({
        success: false,
        message: "Duplicate key error. Images already exist.",
      });
    }

    // Other unexpected errors
    res.status(500).send({
      success: false,
      message: "Internal Server Error. Please try again later.",
      error: error.message,
    });
  }
};

// Update Image Controller
export const updateBannerImageController = async (req, res) => {
  try {
    const { imageId } = req.params; // Assuming imageId is passed in the URL params
    const { image } = req.body;

    // Validation: Check if new image data is provided
    if (!image) {
      return res.status(400).send({
        success: false,
        message: "Please provide valid new image data.",
      });
    }

    // Find the existing image by ID and delete it
    const existingImage = await bannerModel.findById(imageId);
    if (!existingImage) {
      return res.status(404).send({
        success: false,
        message: "Image not found.",
      });
    }

    // Delete the existing image
    await existingImage.remove();

    // Create a new banner with the new image data
    const imageData = await bannerModel.create({
      images: [image],
    });

    // Send success response
    res.status(200).send({
      success: true,
      message: "Image updated successfully.",
      imageData,
    });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Internal Server Error. Please try again later.",
      error: error.message,
    });
  }
};
