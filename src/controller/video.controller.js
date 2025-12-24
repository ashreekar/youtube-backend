import mongoose from "mongoose";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// models
import { Video } from "../models/Video.model.js";
import { Channel } from "../models/Channel.model.js";
import { Reaction } from "../models/Reaction.model.js";
import { Comment } from "../models/Comment.model.js";
import { User } from "../models/User.model.js";
import { Category } from "../models/Category.model.js";

// handler to getall videos
const getallvideos = asyncHandler(async (req, res) => {
    // finding all videos if videos not found [] empty array will be sent
    const videos = await Video.find({})
        .select("-updatedAt -__v -description")
        .populate("category")
        .populate("owner", "name handle avatar _id");
    //populating with important fields and removign not so ones like upadted, desciption for all

    res.status(200).json(new APIresponse(200, videos, "videos sent sucessfully"))
})

// handler to get info of a sig=ngle video
const getVideoById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // agreagtion pipeline for video
    const video = await Video.aggregate(
        [
            // matching video by id
            {
                $match: { _id: new mongoose.Types.ObjectId(id) }
            },
            // lookup for all reactions as reaction(like and comment)
            {
                $lookup: {
                    from: "reactions",
                    localField: "_id",
                    foreignField: "video",
                    as: "reactions"
                }
            },
            // lookup for comments
            {
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "video",
                    as: "comments"
                }
            },
            // lookup for channel/owner details
            {
                $lookup: {
                    from: "channels",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner"
                }
            },
            // lookup for category
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            { $unwind: "$owner" },
            {
                // calculating totalcomments,totalsubs
                // calculating total likes,dislikes
                $addFields: {
                    totalComments: { $size: "$comments" },
                    totalSubscribers: { $size: "$owner.subscribers" },
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
                // video projection that is part of response
                $project: {
                    title: 1,
                    url: 1,
                    thumbnail: 1,
                    description: 1,
                    totalSubscribers: 1,
                    category: 1,
                    views: 1,
                    owner: 1,
                    totalComments: 1,
                    likes: 1,
                    dislikes: 1,
                    createdAt: 1,
                    owner: {
                        _id: 1,
                        name: 1,
                        handle: 1,
                        avatar: 1
                    }
                }
            }
        ]
    )

    // voew updation on every fetch
    await Video.findByIdAndUpdate(id, {
        $inc: { views: 1 }
    })

    // adding to watch history of user who requested the resource if found
    if (req.user) {
        await User.findByIdAndUpdate(req?.user?._id, {
            $addToSet: { watchhistory: id }
        })
    }

    if (!video?.length) {
        throw new APIerror(404, "Video not found");
    }

    res.status(200).json(new APIresponse(200, video, "Video sent sucessfully"));
})

// upload video handler
const uploadVideo = asyncHandler(async (req, res) => {
    if (!req.body) {
        throw new APIerror(400, "All fields are empty");
    }

    // expect title,url(string),desc,category
    const { title, url, description, category } = req.body;

    // all fields must be filled
    if (!title || !url || !description || !category) {
        throw new APIerror(400, "All fields must be filled");
    }

    // thumbnailfile comes from multer
    const thumbanilFile = req?.files?.thumbnail

    if (!thumbanilFile) {
        throw new APIerror(400, "Thumbnail is required field");
    }

    // checking for path of file in public
    const thumbnailLocalPath = thumbanilFile[0]?.path;

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    // if catgeory exists getting it
    let categoryObject = await Category.findOne({ name: category.toLowerCase() });

    // if not then creating a new category
    if (!categoryObject) {
        categoryObject = await Category.create({ name: category.toLowerCase() });
    }

    // creating a new video
    const video = await Video.create(
        {
            title,
            url,
            description,
            category: categoryObject._id,
            views: 0,
            thumbnail: thumbnail?.url,
            owner: req.channel._id
        }
    )

    // updating channel
    await Channel.findByIdAndUpdate(
        req.channel._id,
        {
            $push: { videos: video._id }
        }
    )

    res.status(201).json(new APIresponse(201, video, "New video created"));
})

// updating video handler
const updateVideo = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // can't modify owner,views,category
    if (req.body.views || req.body.owner || req.body.category) {
        throw new APIerror(400, "Can't modify important fields");
    }

    if (!req.body) {
        throw new APIerror(400, "No field is added to modify");
    }

    // updating video from id
    const updatedvideo = await Video.findByIdAndUpdate(id, { ...req.body }, { new: true });

    if (!updatedvideo) {
        throw new APIerror(404, "Video not found");
    }

    // agregation pipeline for videos
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
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category"
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

    if (video?.length === 0) {
        throw new APIerror(404, "Video not found");
    }

    res.status(201).json(new APIresponse(201, video, "Video updated sucessfully"));
})

// video deletion handler
const deleteVideo = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // deleting video by id
    const video = await Video.findByIdAndDelete(id);
    if (!video) {
        throw new APIerror(400, "Video not found");
    }

    // removing video from channel
    await Channel.findByIdAndUpdate(
        req.channel._id,
        {
            $pull: { videos: id }
        }
    )

    // deleting comment and rection on video
    await Reaction.deleteMany({ video: id })
    await Comment.deleteMany({ video: id })

    res.status(200).json(new APIresponse("Video deleted sucessfully"));
})

// change thumbnail handler
const changeThumbnail = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // checking of thumbnailfile from multur
    const thumbanilFile = req?.files?.thumbnail;
    if (!thumbanilFile) {
        throw new APIerror(400, "Thumbnail is needed to update thumbnail image");
    }

    const thumbnailLocalPath = thumbanilFile[0]?.path;
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    // updating the thumbanail using $set query
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

// gives all categories for videos
const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({});

    return res.status(200).json(new APIresponse(200, categories, "Categories sent"));
})

// gives every video by category with id(category)
const getVideosByCategories = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // pipeline for getting videos
    const videoresult = await Category.aggregate(
        [
            {
                $match: { _id: new mongoose.Types.ObjectId(id) }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "_id",
                    foreignField: "category",
                    as: "videos",
                    pipeline: [
                        {
                            $lookup: {
                                from: "channels",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner"
                            }
                        },
                        { $unwind: "$owner" },
                    ]
                }
            },
            {
                $project: {
                    name: 1,
                    _id: 1,
                    videos: {
                        owner: {
                            name: 1,
                            handle: 1,
                            avatar: 1,
                            _id: 1
                        },
                        title: 1,
                        url: 1,
                        thumbnail: 1,
                        views: 1,
                        createdAt: 1,
                        _id: 1
                    }
                }
            }
        ]
    )

    res.status(200).json(new APIresponse(200, videoresult, "Videos sent sucessfully"));
})

export { getVideoById, getallvideos, uploadVideo, updateVideo, deleteVideo, changeThumbnail, getCategories, getVideosByCategories };