import mongoose from "mongoose";
import { APIerror } from "../util/APIerror.js";
import { APIresponse } from "../util/APIresponse.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { uploadOnCloudinary } from "../util/cloudinary.js";

// models
import { Video } from "../model/Video.model.js";
import { Channel } from "../model/Channel.model.js";
import { Reaction } from "../model/Reaction.model.js";

const getallvideos = asyncHandler(async (req, res) => {
    const videos = await Video.find({})
        .select("-updatedAt -__v")
        .populate("owner", "name handle avatar");

    res.status(200).json(new APIresponse(200, videos, "videos sent sucessfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const video = await Video.aggregate(
        [
            {
                $match: { _id: id }
            },
            {
                $lookup: {
                    from: "reactions",
                    localField: "_id",
                    foreignField: "video",
                    as: "reactions"
                }
            },
            {
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "video",
                    as: "comments"
                }
            },
            {
                $lookup: {
                    from: "channels",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner"
                }
            },
            { $unwind: "$owner" },
            {
                $addFields: {
                    totalComments: { $size: "$comments" },
                    likes: {
                        $size: {
                            $filter: {
                                input: "$reactions",
                                as: "r",
                                cond: { $eq: ["$$r.type", "like"] }
                            }
                        }
                    },
                    dislikes: {
                        $size: {
                            $filter: {
                                input: "$reactions",
                                as: "r",
                                cond: { $eq: ["$$r.type", "dislike"] }
                            }
                        }
                    },
                }
            },
            {
                $project: {
                    title: 1,
                    url: 1,
                    thumbnail: 1,
                    description: 1,
                    category: 1,
                    views: 1,
                    owner: 1,
                    totalComments: 1,
                    likes: 1,
                    dislikes: 1,
                    createdAt: 1
                }
            }
        ]
    )

    if (!video?.length) {
        throw new APIerror(404, "Video not found");
    }

    res.status(200).json(new APIresponse(200, video, "Video sent sucessfully"));
})

const uploadVideo = asyncHandler(async (req, res) => {
    const { title, url, description, category } = req.body;

    if (!title || !url || !description || !category) {
        throw new APIerror(400, "All fields must be filled");
    }

    const thumbnailLocalPath = req?.files?.thumbnail[0]?.path;

    if (!thumbnailLocalPath) {
        throw new APIerror(400, "Thumbnail is required field");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);


    const video = await Video.create(
        {
            title,
            url,
            description,
            category,
            views: 0,
            thumbnail: thumbnail.url,
            owner: req.channel._id
        }
    )

    await Channel.findByIdAndUpdate(
        req.channel._id,
        {
            $push: { videos: video._id }
        }
    )

    res.status(201).json(new APIresponse(201, video, "New video created"));
})

const updateVideo = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (req.body.views || req.body.owner) {
        throw new APIerror(400, "Can't modify important fields");
    }

    const updatedvideo = await Video.findByIdAndUpdate(id, { ...req.body }, { new: true });

    if (!updatedvideo) {
        throw new APIerror(404, "Video not found");
    }

    const video = await Video.aggregate(
        [
            {
                $match: { _id: id }
            },
            {
                $lookup: {
                    from: "reactions",
                    localField: "_id",
                    foreignField: "video",
                    as: "reactions"
                }
            },
            {
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "video",
                    as: "comments"
                }
            },
            {
                $lookup: {
                    from: "channels",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner"
                }
            },
            { $unwind: "$owner" },
            {
                $addFields: {
                    totalComments: { $size: "$comments" },
                    likes: {
                        $size: {
                            $filter: {
                                input: "$reactions",
                                as: "r",
                                cond: { $eq: ["$$r.type", "like"] }
                            }
                        }
                    },
                    dislikes: {
                        $size: {
                            $filter: {
                                input: "$reactions",
                                as: "r",
                                cond: { $eq: ["$$r.type", "dislike"] }
                            }
                        }
                    },
                }
            },
            {
                $project: {
                    title: 1,
                    url: 1,
                    thumbnail: 1,
                    description: 1,
                    category: 1,
                    views: 1,
                    owner: 1,
                    totalComments: 1,
                    likes: 1,
                    dislikes: 1,
                    createdAt: 1
                }
            }
        ]
    )

    if (!video?.length) {
        throw new APIerror(404, "Video not found");
    }

    res.status(201).json(new APIresponse(201, video, "Video updated sucessfully"));
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const video = await Video.findByIdAndDelete(id);
    if (!video) {
        throw new APIerror(400, "Video not found");
    }

    await Channel.findByIdAndUpdate(
        req.channel._id,
        {
            $pull: { videos: id }
        }
    )
    await Reaction.deleteMany({ video: id })
    await Comment.deleteMany({ video: id })

    res.status(200).json(new APIresponse("Video deleted sucessfully"));
})

const changeThumbnail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const thumbnailLocalPath = req?.files?.thumbnail[0]?.path;

    if (!thumbnailLocalPath) {
        throw new APIerror(400, "Cover image is needed to update cover image");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    const url = await Video.findByIdAndUpdate(
        id,
        {
            $set: { thumbnail: thumbnail.url }
        },
        {
            new: true
        }
    )
        .select("thumbnail")

    res.status(201).json(new APIresponse(201, url, "thumbanil image changed"));
})

export { getVideoById, getallvideos, uploadVideo, updateVideo, deleteVideo, changeThumbnail };