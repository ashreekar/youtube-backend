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

export const Video = mongoose.model("Video", videoSchema);