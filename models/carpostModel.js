import mongoose from "mongoose";

//SCHEMA
const carpostSchema = new mongoose.Schema(
  {
    postImages: [
      {
        public_id: {
          type: String,
        },
        url: {
          type: String,
        },
      },
    ],
    title: {
      type: String,
      required: [true, "Please Add Post Title!"],
    },
    make: {
      type: String,
      required: [true, "Please Add Car Make!"],
    },
    model: {
      type: String,
      required: [true, "Please Add Car Model!"],
    },
    variant: {
      type: String,
      required: [true, "Please Add Car Variant!"],
    },
    rent: {
      type: String,
      required: [true, "Please Add Car Rent!"],
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
  },
  { timestamps: true }
);

export const carpostMdoel = mongoose.model("carPost", carpostSchema);
export default carpostMdoel;
