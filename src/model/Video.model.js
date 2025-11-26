import mongoose from "mongoose";
import mongooseagreegatepaginate from "mongoose-aggregate-paginate-v2";

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
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
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

videoSchema.plugin(mongooseagreegatepaginate);

videoSchema.index({ title: "text", description: "text" });

export const Video = mongoose.model("Video", videoSchema);