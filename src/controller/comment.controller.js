import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

import { Comment } from "../models/Comment.model.js";
import { Video } from "../models/Video.model.js";
import { Post } from "../models/Post.model.js";

// comment on video,comment,post are same but differs in model
const commentOnVideo = asyncHandler(async (req, res) => {
    const { id } = req.params;
    // check for comment and create on video by video id

    if (!req.body) {
        throw new APIerror(404, "Comment body is empty");
    }

    const { content } = req?.body;

    if (!content) {
        throw new APIerror(404, "Comment body is empty");
    }

    const video = await Video.findById(id);

    if (!video) {
        throw new APIerror(400, "Video not found with id");
    }

    const comment = await Comment.create(
        {
            content: content,
            commenter: req.user._id,
            video: id
        }
    )

    res.status(201).json(new APIresponse(201, comment, "comment added"));
})

// commenting on comment
const commentOnCommnent = asyncHandler(async (req, res) => {
    const { id } = req.params;
// check for comment and create on comment by comment id
    if (!req.body) {
        throw new APIerror(404, "Comment body is empty");
    }

    const { content } = req?.body;

    if (!content) {
        throw new APIerror(404, "Comment body is empty");
    }

    const maincomment = await Comment.findById(id);

    if (!maincomment) {
        throw new APIerror(400, "Comment not found with id");
    }

    const comment = await Comment.create(
        {
            content: content,
            commenter: req.user._id,
            comment: id
        }
    )

    res.status(201).json(new APIresponse(201, comment, "comment added"));
})

// commenting on post
const commentOnPost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    // check for comment and create on post by post id

    if (!req.body) {
        throw new APIerror(404, "Comment body is empty");
    }

    const { content } = req?.body;

    if (!content) {
        throw new APIerror(404, "Comment body is empty");
    }

    const post = await Post.findById(id);

    if (!post) {
        throw new APIerror(400, "Post not found with id");
    }

    const comment = await Comment.create(
        {
            content: content,
            commenter: req.user._id,
            post: id
        }
    )

    res.status(201).json(new APIresponse(201, comment, "comment added"));
})

const getCommentOfVideo = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const comments = await Comment.aggregate(
        [
            {
                // matching comment from id
                $match: { video: new mongoose.Types.ObjectId(id) }
            },
            {
                // adding fields like comments
                $lookup: {
                    from: "comments",
                    localField: "video",
                    foreignField: "video",
                    as: "comments",
                    pipeline: [
                         // furthur pipeline for reaction on all comments and users
                        {
                            $lookup: {
                                from: "reactions",
                                localField: "_id",
                                foreignField: "comment",
                                as: "reactions"
                            }
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "commenter",
                                foreignField: "_id",
                                as: "commenter"
                            }
                        },
                        {
                            // getting total count comments and reaction
                            $addFields: {
                                likes: {
                                    $size: {
                                        $filter: {
                                            input: "$reactions",
                                            as: "reaction",
                                            cond: { $eq: ["$$reaction.type", "like"] }
                                        }
                                    }
                                },
                                dislikes: {
                                    $size: {
                                        $filter: {
                                            input: "$reactions",
                                            as: "reaction",
                                            cond: { $eq: ["$$reaction.type", "dislike"] }
                                        }
                                    }
                                }
                            }
                        },
                    ]
                },
            },
            {
                // adding total of 1st level comments
                $addFields: {
                    totalComments: {
                        $size: "$comments"
                    }
                }
            },
            {
                //projecting all comment fields and nested fields
                $project: {
                    totalComments: 1,
                    comments: {
                        _id: 1,
                        content: 1,
                        commenter: {
                            _id: 1,
                            username: 1,
                            avatar: 1
                        },
                        likes: 1,
                        dislikes: 1,
                        createdAt: 1
                    }
                }
            }
        ]
    )

    // removing from array and structuring response
    const responseData = {
        comments: comments[0]?.comments || [],
        totalComments: comments[0]?.totalComments || 0
    }

    res.status(200).json(new APIresponse(200, responseData, "Comments sent sucessfully"));
})

const getCommentOfPost = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const comments = await Comment.aggregate(
        [
            {
                // matching comment from id
                $match: { post: new mongoose.Types.ObjectId(id) }
            },
            {
                // adding fields like comments
                $lookup: {
                    from: "comments",
                    localField: "post",
                    foreignField: "post",
                    as: "comments",
                    pipeline: [
                        {
                            // furthur pipeline for reaction on all comments and users
                            $lookup: {
                                from: "reactions",
                                localField: "_id",
                                foreignField: "comment",
                                as: "reactions"
                            }
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "commenter",
                                foreignField: "_id",
                                as: "commenter"
                            }
                        },
                        {
                            // getting total count comments and reaction
                            $addFields: {
                                likes: {
                                    $size: {
                                        $filter: {
                                            input: "$reactions",
                                            as: "reaction",
                                            cond: { $eq: ["$$reaction.type", "like"] }
                                        }
                                    }
                                },
                                dislikes: {
                                    $size: {
                                        $filter: {
                                            input: "$reactions",
                                            as: "reaction",
                                            cond: { $eq: ["$$reaction.type", "dislike"] }
                                        }
                                    }
                                }
                            }
                        },
                    ]
                },
            },
            {
                // adding total of 1st level comments
                $addFields: {
                    totalComments: {
                        $size: "$comments"
                    }
                }
            },
            {
                //projecting all comment fields and nested fields
                $project: {
                    totalComments: 1,
                    comments: {
                        _id: 1,
                        content: 1,
                        commenter: {
                            _id: 1,
                            username: 1,
                            avatar: 1
                        },
                        likes: 1,
                        dislikes: 1,
                        createdAt: 1
                    }
                }
            }
        ]
    )

    // removing from array and structuring response
    const responseData = {
        comments: comments[0]?.comments || [],
        totalComments: comments[0]?.totalComments || 0
    }

    res.status(200).json(new APIresponse(200, responseData, "Comments sent sucessfully"));
})

const getCommentOfComment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Note: In this agregation comment can be from top level or any other level
    const comments = await Comment.aggregate(
        [
            {
                // matching comment from id
                $match: { comment: new mongoose.Types.ObjectId(id) }
            },
            {
                // adding fields like comments
                $lookup: {
                    from: "comments",
                    localField: "comment",
                    foreignField: "comment",
                    as: "comments",
                    pipeline: [
                        {
                            // furthur pipeline for reaction on all comments and users
                            $lookup: {
                                from: "reactions",
                                localField: "_id",
                                foreignField: "comment",
                                as: "reactions"
                            }
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "commenter",
                                foreignField: "_id",
                                as: "commenter"
                            }
                        },
                        {
                            // getting total count comments and reaction
                            $addFields: {
                                likes: {
                                    $size: {
                                        $filter: {
                                            input: "$reactions",
                                            as: "reaction",
                                            cond: { $eq: ["$$reaction.type", "like"] }
                                        }
                                    }
                                },
                                dislikes: {
                                    $size: {
                                        $filter: {
                                            input: "$reactions",
                                            as: "reaction",
                                            cond: { $eq: ["$$reaction.type", "dislike"] }
                                        }
                                    }
                                }
                            }
                        },
                    ]
                },
            },
            {
                // adding total of 1st level comments
                $addFields: {
                    totalComments: {
                        $size: "$comments"
                    }
                }
            },
            {
                //projecting all comment fields and nested fields
                $project: {
                    totalComments: 1,
                    comments: {
                        _id: 1,
                        content: 1,
                        commenter: {
                            _id: 1,
                            username: 1,
                            avatar: 1
                        },
                        likes: 1,
                        dislikes: 1,
                        createdAt: 1
                    }
                }
            }
        ]
    )

    // removing from array and structuring response
    const responseData = {
        comments: comments[0]?.comments || [],
        totalComments: comments[0]?.totalComments || 0
    }

    res.status(200).json(new APIresponse(200, responseData, "Comments sent sucessfully"));
})

const deleteCommentRecursive = async (commentId) => {
    // fucntion to delete comment at all level recusivley
     if (commentId===undefined) {
        return;
    }

    const replies = await Comment.find({ comment: commentId });

    for (const reply of replies) {
        await deleteCommentRecursive(reply._id);
    }

    await Comment.deleteOne({ _id: commentId });
};

const deleteComment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // dleteing comment by comment id
    const isOwner = await Comment.findOne({
        _id: id,
        commenter: req.user._id
    });

    if (!isOwner) {
        throw new APIerror(400, "Unauthorized request to delete comment");
    }

    await deleteCommentRecursive(id);

    res.status(200).json(new APIresponse(200, {}, "Comment deleted"));
});


const updateComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    // in comment only can update comment body
    const comment = await Comment.findOneAndUpdate(
        {
            $and: [{ _id: id }, { commenter: req.user._id }]
        },
        {
            content
        },
        { new: true }
    );

    if (!comment) {
        throw new APIerror(404, "Comment not found");
    }

    res.status(200).json(new APIresponse(200, comment, "Comment updated"));
})

export {
    commentOnCommnent,
    commentOnPost,
    commentOnVideo,
    getCommentOfVideo,
    getCommentOfPost,
    getCommentOfComment,
    deleteComment,
    updateComment
};