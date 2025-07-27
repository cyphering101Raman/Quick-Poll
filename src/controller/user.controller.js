import { asyncHandler, ApiResponse, ApiError } from "../utils/index.js"
import User from "../models/user.models.js"
import jwt from "jsonwebtoken"
import { dotenv } from "dotenv"
dotenv.config();

const options = {
  httpOnly: true,
  secure: true
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

  const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE_IN })

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

  if (!user) throw new ApiError(401, "No user found with provided credentials");

  const passwordCheck = await user.isPasswordValid(password)

  if (!passwordCheck) throw new ApiError(401, "Incorrect password");

  const loggedinUser = await User.findById(user._id).select("-password")

  const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE_IN })

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

export {
  registerUser,
  loginUser,
  logoutUser
};