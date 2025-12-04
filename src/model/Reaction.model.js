import mongoose from "mongoose";

//reaction schema
const reactionSchema = new mongoose.Schema(
  {
    reactionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    // reaction schema can store like and dislike
    type: {
      type: String,
      enum: ["like", "dislike"],
      required: true,
      index: true
    },
    // it only can refer either video,post,comment
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