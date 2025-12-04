import mongoose from "mongoose";

// playlost schema
const playlistSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        // it only have details of createdby,videos and title
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Channel"
        },
        videos: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video"
            }
        ]
    },
    {
        timestamps: true
    }
)

export const Playlist = mongoose.model("Playlist", playlistSchema);