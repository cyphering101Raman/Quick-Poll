import { Router } from "express";

import {createPoll, getAllPolls, votePoll, deletePoll} from "../controller/poll.controller.js"

import authMiddleware from "../middlewares/auth.middleware.js";

const route = Router()


route.post("/poll/post", authMiddleware, createPoll)
route.get("/polls", getAllPolls)
route.post("/poll/vote", authMiddleware, votePoll)
route.post("/poll/delete", authMiddleware, deletePoll)


export default route;