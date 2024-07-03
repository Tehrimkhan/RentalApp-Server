import mongoose from "mongoose";
//Cloudinary response
const cloudinaryImageSchema = new mongoose.Schema({
  asset_id: String,
  bytes: Number,
  created_at: Date,
  etag: String,
  folder: String,
  format: String,
  height: Number,
  original_extension: String,
  original_filename: String,
  placeholder: Boolean,
  public_id: String,
  resource_type: String,
  secure_url: String,
  signature: String,
  tags: [String],
  type: String,
  url: String,
  version: Number,
  version_id: String,
  width: Number,
});
//REVIEW MODAL
const reviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is Required!"],
    },
    rating: {
      type: Number,
      defualt: 0,
    },
    comment: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: [true, "User Required"],
    },
  },
  { timestamps: true }
);

//PRODUCT MODEL
const postSchema = new mongoose.Schema(
  {
    postImages: [cloudinaryImageSchema],
    title: {
      type: String,
      required: [true, "Please Add Post Title!"],
    },
    name: {
      type: String,
      required: [true, "Please Add Post Title!"],
    },
    make: {
      type: String,
    },
    model: {
      type: String,
    },
    variant: {
      type: String,
    },
    area: {
      type: String,
    },
    floor: {
      type: String,
    },
    room: {
      type: String,
    },
    color: {
      type: String,
    },
    fabric: {
      type: String,
    },
    size: {
      type: String,
    },
    gender: {
      type: String,
    },
    material: {
      type: String,
    },
    style: {
      type: String,
    },
    rent: {
      type: String,
      required: [true, "Please Add Rent!"],
    },
    description: {
      type: String,
      required: [true, "Please Add Post Description!"],
    },
    postedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "Users",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);
export const postMdoel = mongoose.model("Post", postSchema);
export default postMdoel;
