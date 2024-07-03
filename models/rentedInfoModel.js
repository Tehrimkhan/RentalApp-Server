import mongoose from "mongoose";
const renterInfoSchema = new mongoose.Schema({
  postName: {
    type: String,
    required: [true, "Post Name is Required!"],
  },
  fullName: {
    type: String,
    required: [true, "Name is Required!"],
  },
  email: {
    type: String,
    required: [true, "Email is Required!"],
  },
  dob: {
    type: String,
    required: [true, "DOB is Required!"],
  },
  phoneNumber: {
    type: String,
    required: [true, "Phone Number is Required!"],
  },
  address: {
    type: String,
    required: [true, "Adress is Required!"],
  },
  postedBy: {
    type: mongoose.Schema.ObjectId,
    ref: "Users",
    required: true,
  },
});
export const rentedInfoModel = mongoose.model("Renter", renterInfoSchema);
export default rentedInfoModel;
