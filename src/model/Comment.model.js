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
            reference: "Video"
        },
        comment: {
            type: Schema.Types.ObjectId,
            reference: "Comment"
        },
        post: {
            type: Schema.Types.ObjectId,
            reference: "Post"
        },
        commenter: {
            type: Schema.Types.ObjectId,
            reference: "User"
        },
    },
    {
        timestamps: true
    })

commentSchema.plugin(mongooseagreegatepaginate);

export const Commnet = mongoose.model("Comment", commentSchema);