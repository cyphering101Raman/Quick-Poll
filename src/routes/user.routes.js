import { Router } from "express";
import { registerUser, loginUser, logoutUser } from "../controller/user.controller";

const route = Router()

route.post("/signup", registerUser)
route.post("/login", loginUser)
route.post("/logout", logoutUser)

export default route;