import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema(
  {
    reactionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    type: {
      type: String,
      enum: ["like", "dislike"],
      required: true,
      index: true
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video"
    },

    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    },

    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }
  },
  {
    timestamps: true
  }
);

export const Reaction = mongoose.model("Reaction", reactionSchema);