import { APIerror } from "../util/APIerror.js";
import { APIresponse } from "../util/APIresponse.js";
import { asyncHandler } from "../util/asyncHandler.js";
import mongoose from "mongoose";

import { Comment } from "../model/Comment.model.js";
import { Video } from "../model/Video.model.js";
import { Post } from "../model/Post.model.js";

const commentOnVideo = asyncHandler(async (req, res) => {
    const { id } = req.params;

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

    const commentExists = await Comment.findOne(
        {
            $and: [{ video: id }, { commenter: req.user._id }]
        }
    )

    if (commentExists) {
        throw new APIerror(400, "Comment already exists");
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

const commentOnCommnent = asyncHandler(async (req, res) => {
    const { id } = req.params;

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

    const commentExists = await Comment.findOne(
        {
            $and: [{ comment: id }, { commenter: req.user._id }]
        }
    )

    if (commentExists) {
        throw new APIerror(400, "Comment already exists");
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

const commentOnPost = asyncHandler(async (req, res) => {
    const { id } = req.params;

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

    const commentExists = await Comment.findOne(
        {
            $and: [{ post: id }, { commenter: req.user._id }]
        }
    )

    if (commentExists) {
        throw new APIerror(400, "Comment already exists");
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
                $match: { video: new mongoose.Types.ObjectId(id) }
            },
            {
                $lookup: {
                    from: "comments",
                    localField: "video",
                    foreignField: "video",
                    as: "comments",
                    pipeline: [
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
                $addFields: {
                    totalComments: {
                        $size: "$comments"
                    }
                }
            },
            {
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
                        createdAt:1
                    }
                }
            }
        ]
    )

    const responseData={
        comments:comments[0]?.comments || [],
        totalComments:comments[0]?.totalComments || 0
    }

    res.status(200).json(new APIresponse(200, responseData, "Comments sent sucessfully"));
})

const getCommentOfPost = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const comments = await Comment.aggregate(
        [
            {
                $match: { post: new mongoose.Types.ObjectId(id) }
            },
            {
                $lookup: {
                    from: "comments",
                    localField: "post",
                    foreignField: "post",
                    as: "comments",
                    pipeline: [
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
                $addFields: {
                    totalComments: {
                        $size: "$comments"
                    }
                }
            },
            {
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
                        createdAt:1
                    }
                }
            }
        ]
    )

    res.status(200).json(new APIresponse(200, comments, "Comments sent sucessfully"));
})

const getCommentOfComment = asyncHandler(async (req, res) => {
    const { id } = req.params;

     const comments = await Comment.aggregate(
        [
            {
                $match: { comment: new mongoose.Types.ObjectId(id) }
            },
            {
                $lookup: {
                    from: "comments",
                    localField: "comment",
                    foreignField: "comment",
                    as: "comments",
                    pipeline: [
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
                $addFields: {
                    totalComments: {
                        $size: "$comments"
                    }
                }
            },
            {
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
                        createdAt:1
                    }
                }
            }
        ]
    )

    res.status(200).json(new APIresponse(200, comments, "Comments sent sucessfully"));
})

const deleteComment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const comment = await Comment.findOneAndDelete(
        {
            $and: [{ _id: id }, { commenter: req.user._id }]
        }
    );

    if (comment) {
        throw new APIerror(404, "Comment not found or can't delete this comment");
    }

    await Comment.deleteMany(
        {
            comment: id
        }
    )

    res.status(200).json(new APIresponse(200, "Comment deleted"));
})

const updateComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await Comment.findOneAndUpdate(
        {
            $and: [{ _id: id }, { commenter: req.user._id }]
        },
        {
            content
        }
    );

    if (comment) {
        throw new APIerror(404, "Comment not found");
    }

    res.status(200).json(new APIresponse(200, "Comment deleted"));
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