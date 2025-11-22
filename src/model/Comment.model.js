import mongooseagreegatepaginate from "mongoose-aggregate-paginate-v2";
import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        },
        post: {
            type: Schema.Types.ObjectId,
            ref: "Post"
        },
        commenter: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
    },
    {
        timestamps: true
    })

commentSchema.plugin(mongooseagreegatepaginate);

export const Commnet = mongoose.model("Comment", commentSchema);