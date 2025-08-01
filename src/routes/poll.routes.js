import { Router } from "express";

import {createPoll, getAllPolls, votePoll, deletePoll, getPollById} from "../controller/poll.controller.js"

import {authMiddleware} from "../middlewares/auth.middleware.js";

const route = Router()


route.post("/poll/post", authMiddleware, createPoll)
route.get("/polls", getAllPolls)
route.post("/poll/vote/:id", authMiddleware, votePoll)
route.post("/poll/delete", authMiddleware, deletePoll)
route.get("/poll/:id", getPollById)


export default route;