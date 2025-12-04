import mongooseagreegatepaginate from "mongoose-aggregate-paginate-v2";
import mongoose, { Schema } from "mongoose";

// comment schema
const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true
        },
        // video,comment,post,commentor refrer
        // video,comment,post and commentor
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
//Note: comment schema refers either comment,video,post not all as one comment is for one thing


//added agregatepaginate plugin
commentSchema.plugin(mongooseagreegatepaginate);

export const Comment = mongoose.model("Comment", commentSchema);