import mongoose from "mongoose";

const channelSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true,
            minlength: 3,
            maxlength: 50
        },
        handle: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true
        },
        description: {
            type: String
        },
        avatar: {
            type: String
        },
        banner: {
            type: String
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        videos: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        subscribers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        playlist: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Playlist"
            }
        ],
        posts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Post"
            }
        ],
    },
    {
        timestamps: true
    }
);

export const Channel = mongoose.model("Channel", channelSchema);