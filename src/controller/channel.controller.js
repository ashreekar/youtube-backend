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

// crete channel controller
const createChannel = asyncHandler(async (req, res) => {
    const { name, handle } = req.body;

    // checking for avatr image(compulsary)
    const avatarLocalpath = req?.files?.avatar[0]?.path;

    if (!avatarLocalpath) {
        throw new APIerror(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalpath);

    // creating a channel
    const channel = await Channel.create(
        {
            name,
            handle,
            avatar: avatar.url,
            owner: req.user._id
        }
    )

    // pushing channel to user
    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $push: { channel: channel._id }
        },
        { new: true }
    )

    res.status(201).json(new APIresponse(201, { user }, "channel created"));
})

// contorller to update avatar
const updateAvatar = asyncHandler(async (req, res) => {
    const avatarFile = req?.files?.avatar

    if (!avatarFile || avatarFile.length === 0) {
        throw new APIerror(400, "Avatar is needed to update avatar");
    }

    // on update all files are must
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

// update banner controller
const updateBanner = asyncHandler(async (req, res) => {
    const bannerFile = req?.files?.banner

    //banner file is neded to update banner
    if (!bannerFile || bannerFile.length === 0) {
        throw new APIerror(400, "Cover image is needed to update cover image");
    }

    // expects a file from multur
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
    // getting channel of user
    const channel = await Channel.findOne({ owner: req.user._id })
        .select("-updatedAt")
        .populate({
            path: "videos",
            select: "title url thumbnail views createdAt description"
        })
        .populate({
            path: "playlist",
            select: "name description thumbnail createdAt"
        })
        .populate({
            path: "posts",
            select: "content images createdAt"
        })
        .lean();
    // populating important fields like title,url,thumbani,vies from vide
    // and selecting fields that need to render for playlist and post

    if (!channel) {
        throw new APIerror(404, "Channel not found");
    }

    // structurig the channel repsonse 
    const responseObject = {
        meta: {
            name: channel.name,
            handle: channel.handle,
            avatar: channel.avatar,
            banner: channel.banner,
            createdAt: channel.createdAt
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

// get channel by id contorller
const getChannelById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const channel = await Channel.findById(id)
        .select("-updatedAt")
        .populate({
            path: "videos",
            select: "title url thumbnail views createdAt"
        })
        .populate({
            path: "playlist",
            select: "name description thumbnail createdAt"
        })
        .populate({
            path: "posts",
            select: "content images createdAt"
        })
        .lean();

    if (!channel) {
        throw new APIerror(404, "Channel not found");
    }

    // structuring the response of object
    const responseObject = {
        meta: {
            name: channel.name,
            handle: channel.handle,
            avatar: channel.avatar,
            banner: channel.banner,
            createdAt: channel.createdAt
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
    await Video.deleteMany({ owner: req.channel._id });
    await Post.deleteMany({ postedBy: req.channel._id });
    await Playlist.deleteMany({ createdBy: req.channel._id });

    // deleting the channel and all resources from chanel
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                channel: []
            }
        },
        { new: true }
    )

    res.status(201).json(new APIresponse(201, user, "Channel deleted sucessfully"));
})

const subscribeChannel = asyncHandler(async (req, res) => {
    //contorller to subscribe to channel
    const { id } = req.params;

    const isOwner = await Channel.find(
        {
            $and: [
                { _id: id },
                { owner: req.user._id }
            ]
        }
    )

    if (isOwner.length > 0) {
        throw new APIerror(400, "Can't subscribe to own channel");
    }

    const isSubscribed = await Channel.findOne(
        {
            subscribers: req.user._id,
            _id: id
        }
    )

    // checking if user already subscribed to avoid duplicate
    if (isSubscribed) {
        throw new APIerror(400, "User already subscribed");
    }

    //pushing user to subscribers field
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
        throw new APIerror(404, "Channel not found");
    }

    // pushing channel to subscription field
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $push: { subscribedTo: id }
        },
        {
            new: true
        }
    ).select("-password")

    res.status(201).json(new APIresponse(201, user, "Subscribed"))
})

const unsubscribeChannel = asyncHandler(async (req, res) => {
    const { id } = req.params;

    //unsubscribing from channel by removing the user
    const channel = await Channel.findOneAndUpdate(
        { _id: id, subscribers: req.user._id },
        {
            $pull: { subscribers: req.user._id }
        },
        {
            new: true
        }
    )

    if (!channel) {
        throw new APIerror(404, "Channel is not found or user not subscribed");
    }

    // removing subscriptions from user
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $pull: { subscribedTo: id }
        },
        {
            new: true
        }
    ).select("-password")

    res.status(201).json(new APIresponse(201, user, "unsubscribed"))
})

const updateChannel = asyncHandler(async (req, res) => {
    if (Object.keys(req.body).length === 0) {
        throw new APIerror(400, "At least one field needs to be added");
    }

    // upating channel
    const handleRegex = /^[a-z][a-z0-9_]{2,15}$/;

    // chekcing for channel exists before updating
    if (req.body?.handle) {
        req.body.handle = req.body.handle.trim();

        if (!handleRegex.test(req.body.handle)) {
            throw new APIerror(400, "Invalid handle");
        }

        const channelExists = await Channel.findOne({
            owner: { $ne: req.user._id },
            handle: req.body.handle
        });

        if (channelExists) {
            throw new APIerror(400, "Handle name is already taken");
        }
    }


    // updating channel
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

    // chekcing if user is owner of channel
    const isOwner = await Channel.find(
        {
            $and: [
                { _id: channelId },
                { owner: userId }
            ]
        }
    )

    // if owner sending response
    if (isOwner.length > 0) {
        return res.status(200).json(
            new APIresponse(
                200,
                {
                    subscribed: false,
                    owner: true
                },
                "User is owner"
            )
        )
    }

    // checking for subscribed for channel
    const user = await Channel.findOne(
        {
            _id: channelId,
            subscribers: userId
        }
    )

    if (user) {
        return res.status(200).json(
            new APIresponse(
                200,
                {
                    subscribed: true,
                    owner: false
                },
                "User subscribed"
            )
        )
    } else {
        return res.status(200).json(
            new APIresponse(
                200,
                {
                    subscribed: false,
                    owner: false
                },
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