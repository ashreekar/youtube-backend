import { Channel } from "../model/Channel.model.js";
import { User } from "../model/User.model.js";
import { APIerror } from "../util/APIerror.js";
import { APIresponse } from "../util/APIresponse.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { uploadOnCloudinary } from "../util/cloudinary.js"

const createChannel = asyncHandler(async (req, res) => {
    const { name, handle } = req.body;

    if (!name || !handle) {
        throw new APIerror(400, "name and handle is required");
    }

    const channelExists = await Channel.findOne(
        {
            owner: req.user._id
        }
    )

    if (channelExists) {
        throw new APIerror(400, "User have a channel already");
    }

    const avatarLocalpath = req?.files?.avatar[0]?.path;

    if (!avatarLocalpath) {
        throw new APIerror(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalpath);

    const channel = await Channel.create(
        {
            name,
            handle,
            avatar: avatar.url,
            owner: req.user._id
        }
    )

    await User.findByIdAndUpdate(req.user._id,
        {
            $push: { channel: channel._id }
        }
    )

    res.status(201).json(new APIresponse(201, channel, "channel created"));
})

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req?.files?.avatar[0]?.path;

    if (!avatarLocalPath) {
        throw new APIerror(400, "Avatar is needed to update avatar");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    const url = await Channel.findOneAndUpdate(
        {
            owner: req.user._id
        },
        {
            $set: { avatar: avatar.url }
        },
        {
            new: true
        }
    )
        .select("avatar")

    res.status(201).json(new APIresponse(201, url, "avatar changed"));
})

const updateBanner = asyncHandler(async (req, res) => {
    const bannerLocalPath = req?.files?.banner[0]?.path;

    if (!bannerLocalPath) {
        throw new APIerror(400, "Cover image is needed to update cover image");
    }

    const banner = await uploadOnCloudinary(coverLocalPath);

    const url = await Channel.findOneAndUpdate(
        {
            owner: req.user._id
        },
        {
            $set: { coverImage: banner.url }
        },
        {
            new: true
        }
    )
        .select("banner")

    res.status(201).json(new APIresponse(201, url, "banner image changed"));
})

const getSelfChannel = asyncHandler(async (req, res) => {
    const channel = await Channel.findOne({ owner: req.user._id })
        .select("-createdAt -updatedAt")
        .populate("videos").select("-reactions -comments -owner -description -createdAt -updatedAt")
        .populate("playlist")
        .populate("posts")

    if (!channel) {
        throw new APIerror(404, "Channel not found");
    }

    const responseObject = {
        meta: {
            name: channel.name,
            handle: channel.handle,
            avatar: channel.avatar,
            banner: channel.banner
        },
        stats: {
            total_videos: channel.videos.length,
            total_subscribers: channel.subscribers.length
        },
        content: {
            videos: channel.videos,
            playlist: channel.playlist,
            posts: channel.posts
        }
    }

    return res.status(200).json(new APIresponse(200, responseObject, "channel fetched sucessfully"));
})

const getChannelById = asyncHandler(async (req, res) => {
    const { id } = req.params.id;

    const channel = await Channel.findById(id)
        .select("-createdAt -updatedAt")
        .populate("videos").select("-reactions -comments -owner -description -createdAt -updatedAt")
        .populate("playlist")
        .populate("posts")

    if (!channel) {
        throw new APIerror(404, "Channel not found");
    }

    const responseObject = {
        meta: {
            name: channel.name,
            handle: channel.handle,
            avatar: channel.avatar,
            banner: channel.banner
        },
        stats: {
            total_videos: channel.videos.length,
            total_subscribers: channel.subscribers.length
        },
        content: {
            videos: channel.videos,
            playlist: channel.playlist,
            posts: channel.posts
        }
    }

    return res.status(200).json(new APIresponse(200, responseObject, "channel fetched sucessfully"));
})

// const deleteChannel = asyncHandler(async (req, res) => {
//     await User.findByIdAndUpdate(
//         req.user._id,
//         {
//             $pop: { channel: {} }
//         }
//     )

//     // not complte but need to finish
// })

const subscribeChannel = asyncHandler(async (req, res) => {
    const { id } = req.params.id;

    const channel = await Channel.findByIdAndUpdate(
        id,
        {
            $push: { subscribers: req.user._id }
        },
        {
            new: true
        }
    )

    if (!channel) {
        throw new APIerror(200, "Channel not found");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $push: { subscribedTo: id }
        },
        {
            new: true
        }
    )

    res.status(201).json(new APIresponse(201, user, "Subscribed"))
})

export { createChannel, updateAvatar, updateBanner, getSelfChannel, getChannelById, subscribeChannel };