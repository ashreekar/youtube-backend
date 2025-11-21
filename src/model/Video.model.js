import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        url: {
            type: String,  // I frame url
            required: true
        },
        thubnail: {
            type: String, // cloudinary
            required: true,
        },
        description: {
            type: String
        },
        views: {
            type: Number,
            default: 0
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Channel",
            required: true
        },
        reactions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Reaction"
            }
        ],
        comments: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "Comment"
            }
        ]
    },
    {
        timestamps: true
    }
)