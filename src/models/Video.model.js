import mongoose from "mongoose";
import mongooseagreegatepaginate from "mongoose-aggregate-paginate-v2";

// video schema
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
        thumbnail: {
            type: String, // cloudinary
            required: true,
        },
        description: {
            type: String
        },
        // category of video is refered from categories
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        // owner is refered from users not channels
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Channel",
            required: true
        }
    },
    {
        timestamps: true
    }
)

// mongooseagregate paginate added as plugins
videoSchema.plugin(mongooseagreegatepaginate);

// index created for text search on ttile
videoSchema.index({ title: "text", description: "text" });

export const Video = mongoose.model("Video", videoSchema);