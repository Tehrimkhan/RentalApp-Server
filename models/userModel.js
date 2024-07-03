import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";

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

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is Required!"],
    },
    email: {
      type: String,
      required: [true, "Email is Required!"],
      unique: [true, "Email already Registered!"],
    },
    password: {
      type: String,
      required: [true, "Password is Required!"],
      minLength: [6, "Password should be greater than 6 characters!"],
    },
    confirmPassword: {
      type: String,
      required: [true, "Password is not Same!"],
      minLength: [6, "Password should be greater than 6 characters!"],
    },
    profileImage: [cloudinaryImageSchema], 
    role: {
      type: String,
      default: "Users",
    },
  },
  { timestamps: true }
);
//functions
// hash func
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

// compare function
userSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

//JWT TOKEN
userSchema.methods.generateToken = function () {
  return JWT.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const userMdoel = mongoose.model("Users", userSchema);
export default userMdoel;
