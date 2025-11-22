import mongoose from "mongoose";
import { Video } from "../model/Video.model.js";
import { Channel } from "../model/Channel.model.js";
import { User } from "../model/User.model.js";
import { APIerror } from "../util/APIerror.js";
import { APIresponse } from "../util/APIresponse.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { uploadOnCloudinary } from "../util/cloudinary.js";

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
                $match: { _id: new mongoose.Types.ObjectId(id) }
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
                    views: 1,
                    owner: 1,
                    comments: 1,
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
    const { title, url, description } = req.body;

    const thubnailLocalPath = req?.files?.thumbnail[0]?.path;

    if (!thubnailLocalPath) {
        throw new APIerror(400, "Thumbnail is required field");
    }

    const thumbnail = await uploadOnCloudinary(thubnailLocalPath);


    const video = await Video.create(
        {
            title,
            url,
            description,
            views: 0,
            thumbnail: thumbnail.url
        }
    )

    res.status(201).json(new APIresponse(201, video, "New video created"));
})

const updateVideo=asyncHandler(async(req,res)=>{
    
})

const deleteVideo=asyncHandler(async(req,res)=>{

})

export { getVideoById, getallvideos, uploadVideo };