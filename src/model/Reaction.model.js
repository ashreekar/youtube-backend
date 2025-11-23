import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema(
  {
    reactionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    type: {
      type: String,
      enum: ["like", "dislike"],
      required: true,
      index: true
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      index: true,
      sparse: true
    },

    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      index: true,
      sparse: true
    },

    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      index: true,
      sparse: true
    }
  },
  {
    timestamps: true
  }
);

reactionSchema.index(
  { reactionBy: 1, video: 1 },
  { unique: true, sparse: true }
);

reactionSchema.index(
  { reactionBy: 1, post: 1 },
  { unique: true, sparse: true }
);

reactionSchema.index(
  { reactionBy: 1, comment: 1 },
  { unique: true, sparse: true }
);

export const Reaction = mongoose.model("Reaction", reactionSchema);