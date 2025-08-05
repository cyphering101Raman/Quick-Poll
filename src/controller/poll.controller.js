import { asyncHandler, ApiResponse, ApiError } from "../utils/index.js"
import Poll from "../models/poll.models.js"
import User from "../models/user.models.js"
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config();

const createPoll = asyncHandler(async (req, res) => {
  // first validate the user.
  // get question, options from req.body
  // create the poll
  // res the pollData

  const token = req.cookies?.token;
  if (!token) throw new ApiError(401, "User not logged in");

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET)

  const user = await User.findById(decodedToken._id)
  if (!user) throw new ApiError(401, "User not found");

  const { question, options, expiredAt } = req.body;

  if (!question?.trim()) throw new ApiError(401, "Poll question is required");
  if (!options || options.length < 2) throw new ApiError(401, "At least 2 poll options are required");

  const createdPoll = await Poll.create({
    question,
    options,
    expiredAt: expiredAt ? new Date(expiredAt) : undefined,
    createdBy: user._id,
  })

  return res.status(201).json(new ApiResponse(201, createdPoll, "Poll Created"));
})

const getAllPolls = asyncHandler(async (req, res) => {
  // fetch all polls
  // sort them acc. to timeCreated
  // keep Active and Expired Poll seperated
  // return to frontend

  const allPolls = await Poll.find().populate("createdBy", "fullName").sort({ createdAt: -1 })

  if (!allPolls || allPolls.length === 0) throw new ApiError(500, "No polls found.");

  const now = Date.now();

  const activePolls = allPolls.filter(poll => poll.expiredAt > now)
  const expiredPolls = allPolls.filter(poll => poll.expiredAt < now)
  const combinedPoll = {
    activePolls, expiredPolls
  }

  return res.status(200).json(new ApiResponse(200, combinedPoll, "Polls fetched successfully."))
})

const votePoll = asyncHandler(async (req, res) => {
  // verify the user
  // get poll_id from req.body
  // fetch the poll
  // check if user exist in the poll_votedUser
  // check for poll expiry
  // increase the votecount of optionIndex
  // register vote
  // send the response

  const token = req.cookies?.token
  if (!token) throw new ApiError(400, "User is not logged-in.");

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET)

  const user = await User.findById(decodedToken._id)
  if (!user) throw new ApiError(400, "User does not exist.");

  const pollId = req.params.id;
  const { optionIndex } = req.body
  if (!pollId || optionIndex === undefined) throw new ApiError(400, "Poll ID and option index are required.");

  const poll = await Poll.findById(pollId)
  if (!poll) throw new ApiError(404, "Poll not found.")

  if (poll.votedUsers.find(u => u.toString() === user._id.toString())) throw new ApiError(400, "You have already voted on this poll.");

  if (poll.expiredAt < Date.now()) throw new ApiError(400, "Poll is expired.");

  const option = poll.options[optionIndex]
  if (!option) throw new ApiError(400, "Invalid option selected")

  option.voteCounter += 1

  poll.votedUsers.push(user._id)

  await poll.save()

  return res.status(200).json(new ApiResponse(200, poll, "Vote recorded successfully."))
})

const deletePoll = asyncHandler(async (req, res) => {
  // fetch the token from req.cookie
  // verify the user
  // get the poll_id from req.body
  // then delete it.

  const token = req.cookies?.token
  if (!token) throw new ApiError(401, "User not logged in");

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
  const user = await User.findById(decodedToken._id)

  if (!user) throw new ApiError(401, "User not found");

  const { pollId } = req.body;
  if (!pollId) throw new ApiError(400, "pollId not recieved");

  const poll = await Poll.findById(pollId);
  if (!poll) throw new ApiError(400, "Poll dont exist");

  if (poll.createdBy.toString() !== user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this poll");
  }
  await Poll.findByIdAndDelete(pollId)

  return res.status(200).json(new ApiResponse(200, null, "Poll deleted successfully."))
})

const getPollById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const poll = await Poll.findById(id)
    .populate("createdBy", "fullName username")
    .populate("votedUsers", "fullName username email option");

  if (!poll) throw new ApiError(404, "Poll not found.");

  return res.status(200).json(new ApiResponse(200, poll, "Poll fetched successfully."));
});

export {
  createPoll,
  getAllPolls,
  votePoll,
  deletePoll,
  getPollById
}