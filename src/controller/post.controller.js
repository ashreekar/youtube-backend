import mongoose from "mongoose";
import { APIerror } from "../util/APIerror.js";
import { APIresponse } from "../util/APIresponse.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { uploadOnCloudinary } from "../util/cloudinary.js";

// models
import { Channel } from "../model/Channel.model.js";
import { Reaction } from "../model/Reaction.model.js";
import { Comment } from "../model/Comment.model.js";
import { Post } from "../model/Post.model.js";

// post controller logic same as video controller
// except change in content and model

const getallPosts = asyncHandler(async (req, res) => {
    // getting all posts on server
    const posts = await Post.find({})
        .select("-updatedAt -__v")
        .populate("postedBy", "name handle avatar");

    res.status(200).json(new APIresponse(200, posts, "posts sent sucessfully"))
})

// geting a post by id
const getPostById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // aggreagtion pipeline for post
    const post = await Post.aggregate(
        [
            {
                // matching post by id
                $match: { _id: new mongoose.Types.ObjectId(id) }
            },
            // getting reactions as reactions
            {
                $lookup: {
                    from: "reactions",
                    localField: "_id",
                    foreignField: "post",
                    as: "reactions"
                }
            },
            // getting comments as comments
            {
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "post",
                    as: "comments"
                }
            },
            // getting owner as postedby
            {
                $lookup: {
                    from: "channels",
                    localField: "postedBy",
                    foreignField: "_id",
                    as: "postedBy"
                }
            },
            { $unwind: "$postedBy" },
            {
                // adding fields like
                // total comments on video,like,dislike
                $addFields: {
                    totalComments: { $size: "$comments" },
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
                    },
                }
            },
            {
                // projecting important fields for post controller
                $project: {
                    content: 1,
                    images: 1,
                    owner: 1,
                    totalComments: 1,
                    likes: 1,
                    dislikes: 1,
                    createdAt: 1
                }
            }
        ]
    )

    if (!post?.length) {
        throw new APIerror(404, "Post not found");
    }

    res.status(200).json(new APIresponse(200, post, "Post sent sucessfully"));
})

// add post handler
const addPost = asyncHandler(async (req, res) => {
    const { content } = req.body;

    // images are optional from frontend
    const imagesArray = req?.files?.images;

    let images = [];
    if (imagesArray && imagesArray.length > 0) {
        // uploading all images first on cloudinary
        images = await Promise.all(
            imagesArray.map(async (image) => {
                const imageMeta = await uploadOnCloudinary(image.path);
                return imageMeta.url;
            }))
    }

    // craring a post
    const post = await Post.create(
        {
            content,
            images,
            postedBy: req.channel._id
        }
    )

    // updating the channel
    await Channel.findByIdAndUpdate(
        req.channel._id,
        {
            $push: { posts: post._id }
        }
    )

    res.status(201).json(new APIresponse(201, post, "New post created"));
})

// updating post controller
const updatePost = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!req.body) {
        throw new APIerror(400, "No field is added to modify");
    }

    // upating post on content
    const updatedPost = await Post.findByIdAndUpdate(id, { ...req.body }, { new: true });

    if (!updatedPost) {
        throw new APIerror(404, "Video not found");
    }

    // aggregation pipeline for post
    const post = await Post.aggregate(
        [
            {
                // match for id from post
                $match: { _id: new mongoose.Types.ObjectId(id) }
            },
            // lookup for reactions, comments,channels
            {
                $lookup: {
                    from: "reactions",
                    localField: "_id",
                    foreignField: "post",
                    as: "reactions"
                }
            },
            {
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "post",
                    as: "comments"
                }
            },
            {
                $lookup: {
                    from: "channels",
                    localField: "postedBy",
                    foreignField: "_id",
                    as: "postedBy"
                }
            },
            { $unwind: "$postedBy" },
            {
                // adding fields like total comments, totla likes, total dislikes
                $addFields: {
                    totalComments: { $size: "$comments" },
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
                    },
                }
            },
            {
                $project: {
                    titlcontente: 1,
                    images: 1,
                    owner: 1,
                    totalComments: 1,
                    likes: 1,
                    dislikes: 1,
                    createdAt: 1
                }
            }
        ]
    )

    if (!post?.length) {
        throw new APIerror(404, "Post not found");
    }

    res.status(201).json(new APIresponse(201, post, "Post updated sucessfully"));
})

// delting post controller
const deletePost = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const post = await Post.findByIdAndDelete(id);
    if (!post) {
        throw new APIerror(400, "Post not found");
    }

    // deleting  from channel
    await Channel.findByIdAndUpdate(
        req.channel._id,
        {
            $pull: { posts: id }
        }
    )
    //deleting all comment and reaction
    await Reaction.deleteMany({ post: id })
    await Comment.deleteMany({ post: id })

    res.status(200).json(new APIresponse("Post deleted sucessfully"));
})

export { getallPosts, getPostById, addPost, updatePost, deletePost };