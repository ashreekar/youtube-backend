import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        // post model only have content images and owner
        content: {
            type: String,
            required: true
        },
        images: [{
            type: String
        }],
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Channel"
        }
    },
    {
        timestamps: true
    }
)

export const Post = mongoose.model("Post", postSchema);