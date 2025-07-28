import mongoose from "mongoose";

const PollSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: [  // option is array of object which has text and voteCounter
      {
        text: {
          type: String,
          required: true
        },
        voteCounter: {
          type: Number,
          default: 0
        },
      }
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true
    },
    votedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    expiredAt: {
      type: Date,
      default: () => Date.now() + 24 * 60 * 60 * 1000
    }
  }, { timestamps: true }
)

const Poll = mongoose.model("Poll", PollSchema);

export default Poll;