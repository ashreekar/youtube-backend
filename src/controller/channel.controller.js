import { APIerror } from "../util/APIerror.js";
import { APIresponse } from "../util/APIresponse.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { uploadOnCloudinary } from "../util/cloudinary.js"

// Models import
import { Channel } from "../model/Channel.model.js";
import { User } from "../model/User.model.js";
import { Video } from "../model/Video.model.js";
import { Playlist } from "../model/Playlist.model.js";
import { Post } from "../model/Post.model.js";

const createChannel = asyncHandler(async (req, res) => {
    if (!req?.body?.name || !req?.body?.handle) {
        throw new APIerror(400, "name and handle is required");
    }

    const { name, handle } = req.body;

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
    const avatarFile = req?.files?.avatar

    if (!avatarFile || avatarFile.length === 0) {
        throw new APIerror(400, "Avatar is needed to update avatar");
    }

    const avatarLocalPath = avatarFile[0]?.path;

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
    const bannerFile = req?.files?.banner

    if (!bannerFile || bannerFile.length===0) {
        throw new APIerror(400, "Cover image is needed to update cover image");
    }
    
    const bannerLocalPath = bannerFile[0]?.path;

    const banner = await uploadOnCloudinary(bannerLocalPath);

    const url = await Channel.findOneAndUpdate(
        {
            owner: req.user._id
        },
        {
            $set: { banner: banner.url }
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
        .populate({
            path: "videos",
            select: "title url thumbnail views"
        })
        .populate({
            path: "playlist",
            select: "name description thumbnail"
        })
        .populate({
            path: "posts",
            select: "content images createdAt"
        })
        .lean();

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
            total_videos: channel.videos?.length || 0,
            total_subscribers: channel.subscribers?.length || 0
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
    const { id } = req.params;

    const channel = await Channel.findById(id)
        .select("-createdAt -updatedAt")
        .populate({
            path: "videos",
            select: "title url thumbnail views"
        })
        .populate({
            path: "playlist",
            select: "name description thumbnail"
        })
        .populate({
            path: "posts",
            select: "content images createdAt"
        })
        .lean();

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
            total_videos: channel.videos?.length || 0,
            total_subscribers: channel.subscribers?.length || 0
        },
        content: {
            videos: channel.videos,
            playlist: channel.playlist,
            posts: channel.posts
        }
    }

    return res.status(200).json(new APIresponse(200, responseObject, "channel fetched sucessfully"));
})

const deleteChannel = asyncHandler(async (req, res) => {
    const channel = await Channel.findByIdAndDelete(req.channel.id);
    await Video.findOneAndDelete({ owner: req.channel._id });
    await Post.findOneAndDelete({ postedBy: req.channel._id });
    await Playlist.findOneAndDelete({ createdBy: req.channel._id });

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                channel: []
            }
        }
    )

    res.status(201).json(new APIresponse(201, channel, "Channel deleted sucessfully"));
})

const subscribeChannel = asyncHandler(async (req, res) => {
    const { id } = req.params;

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

const unsubscribeChannel = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const channel = await Channel.findByIdAndUpdate(
        id,
        {
            $pull: { subscribers: req.user._id }
        },
        {
            new: true
        }
    )

    if (!channel) {
        throw new APIerror(200, "Channel is not subscribed");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $pull: { subscribedTo: id }
        },
        {
            new: true
        }
    )

    res.status(201).json(new APIresponse(201, user, "unsubscribed"))
})

const updateChannel = asyncHandler(async (req, res) => {
    const channel = await Channel.findByIdAndUpdate(
        req.channel._id,
        {
            ...req.body
        },
        {
            new: true
        }
    )

    res.status(200).json(new APIresponse(200, channel, "Channel details updated"));
})

const isSubscribed = asyncHandler(async (req, res) => {
    const channelId = req.params.id;
    const userId = req.user._id;

    const user = await Channel.findOne(
        {
            _id: channelId,
            subscribers: userId
        }
    )

    if (user) {
        res.status(200).json(
            new APIresponse(
                200,
                { subscribed: true },
                "User subscribed"
            )
        )
    } else {
        res.status(200).json(
            new APIresponse(
                200,
                { subscribed: false },
                "User not subscribed"
            )
        )
    }
})

export {
    createChannel,
    updateAvatar,
    updateBanner,
    getSelfChannel,
    getChannelById,
    subscribeChannel,
    deleteChannel,
    updateChannel,
    isSubscribed,
    unsubscribeChannel
};