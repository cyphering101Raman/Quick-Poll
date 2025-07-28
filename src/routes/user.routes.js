import { Router } from "express";
import { registerUser, loginUser, logoutUser } from "../controller/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

import User from "../models/user.models.js"

const route = Router()

route.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password")

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
})

route.post("/signup", registerUser)
route.post("/login", loginUser)
route.post("/logout", logoutUser)

export default route;