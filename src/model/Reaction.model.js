import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema(
    {
        reactionBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        type: {
            type: Boolean
        },
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        },
        Post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        },
        Comment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        },
    },
    {
        timestamps: true
    }
)

const Reaction = mongoose.model("Reaction", reactionSchema);