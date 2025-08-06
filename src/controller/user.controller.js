import { asyncHandler, ApiResponse, ApiError } from "../utils/index.js"
import User from "../models/user.models.js"
import jwt from "jsonwebtoken"
import admin from "../firebase.js";
import dotenv from "dotenv"
dotenv.config();

const options = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  path: "/"
}

const registerUser = asyncHandler(async (req, res) => {
  // take the userData from req.body
  // check the missing field
  // check if userExist in DB
  // registerUser in Db
  // return success reponse

  const { fullName, username, email, password, gender } = req.body;

  if (!fullName || !username || !email || !password || !gender) {
    throw new ApiError(400, "All Fields are requied")
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { username }]
  })

  if (existedUser) throw new ApiError(400, "User already existed.");

  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    email,
    password,
    gender
  })

  const createdUser = await User.findById(user._id).select("-password")

  if (!createdUser) throw new ApiError(500, "Something went wrong while registering user")

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE_IN })

  return res.status(201)
    .cookie("token", token, options)
    .json(
      new ApiResponse(201, createdUser, "User registered successfully"))
})

const loginUser = asyncHandler(async (req, res) => {
  // take user info from frontend using req.body
  // find user
  // valiate the email and username
  // check for password.
  // return success response to frontend

  const { userid, password } = req.body;

  if (!userid) throw new ApiError(400, "username or email is required");

  if (!password) throw new ApiError(400, "password is required");

  const user = await User.findOne({
    $or: [{ email: userid }, { username: userid }]
  })

  if (!user) throw new ApiError(401, "User does not exist");

  const passwordCheck = await user.isPasswordValid(password)

  if (!passwordCheck) throw new ApiError(401, "Invalid credentials");

  const loggedinUser = await User.findById(user._id).select("-password")

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE_IN })

  return res.status(200)
    .cookie("token", token, options)
    .json(
      new ApiResponse(200, loggedinUser, "Login successful")
    )
})

const logoutUser = asyncHandler(async (req, res) => {
  return res.status(200)
    .clearCookie("token", options)
    .json(new ApiResponse(200, null, "User logged out successfully"));
})

const updateUserProfile = asyncHandler(async (req, res) => {
  const allowedUpdates = ["fullName", "username", "email", "gender"]
  const updates = Object.keys(req.body);

  const isValid = updates.every(field => allowedUpdates.includes(field));
  if (!isValid) throw new ApiError(400, "Invalid update fields.");

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  updates.forEach(field => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });

  await user.save();

  const updatedUser = await User.findById(user._id).select("-password");

  return res.status(200).json(new ApiResponse(200, updatedUser, "User updated successfully"));

})

const changePassword = asyncHandler(async (req, res) => {
  const {oldPassword, newPassword} = req.body;
  if(!oldPassword || !newPassword) throw new ApiError(400, "Password didn't received.")
    
  const user = await User.findById(req.user._id)
  if (!user) throw new ApiError(400, "Unathorised User");


  const isValidPass = await user.isPasswordValid(oldPassword);
  if(!isValidPass) throw new ApiError(401, "Old password is incorrect");

  user.password = newPassword
  await user.save();

  return res.status(200).json(new ApiResponse(200, null, "Password changed successfully."));
})

const deleteAccount = asyncHandler(async (req, res) => {
  const deletedUser = await User.findByIdAndDelete(req.user._id);

  if (!deletedUser) {
    throw new ApiError(404, "User not found or already deleted");
  }

  res.clearCookie("token", options); // This ensures the user is signed out
  return res.status(200).json(new ApiResponse(200, null, "Account deleted successfully"));
});

const googleLoginUser = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  if (!credential) throw new ApiError(400, "Google credential is missing");

  // Verify and decode the token using Firebase Admin
  const decoded = await admin.auth().verifyIdToken(credential);

  let user = await User.findOne({ email: decoded.email });
  if (!user) {
    user = await User.create({
      username: decoded.email.split("@")[0],
      fullName: decoded.name || decoded.email.split("@")[0],
      email: decoded.email,
      gender: "other",
      password: "google"
    });
  }

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE_IN });
  const loggedinUser = await User.findById(user._id).select("-password");

  return res.status(200).cookie("token", token, options)
    .json(new ApiResponse(200, loggedinUser, "Google login successful"));
});


export {
  registerUser,
  loginUser,
  logoutUser,
  updateUserProfile,
  changePassword,
  deleteAccount,
  googleLoginUser
};