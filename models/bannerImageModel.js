import mongoose from "mongoose";
const bannerImageSchema = new mongoose.Schema(
  {
    images: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true }
);

export const bannerModel = mongoose.model("Banner", bannerImageSchema);
export default bannerModel;
