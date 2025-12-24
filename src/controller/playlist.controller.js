import { Channel } from "../models/Channel.model.js";
import { Playlist } from "../models/Playlist.model.js";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// create playlist contorller
const createPlaylist = asyncHandler(async (req, res) => {
    const { title } = req.body;

    if (!title) {
        throw new APIerror(400, "title must be required to create playlist")
    }

    // only adding title to playlist filed(newly created)
    const playlist = await Playlist.create(
        {
            title,
            createdBy: req.channel._id
        }
    )

    await Channel.findByIdAndUpdate(
        req.channel._id,
        {
            $push: {
                playlist: playlist._id
            }
        }
    )

    res.status(201).json(new APIresponse(201, playlist, "Playlist created"));
})

// updating playlist controlelr
const updatePlaylistVideoAdd = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { videoId } = req.body;

    if (!videoId) {
        throw new APIerror(400, "video must be required to add to playlist")
    }

    // checking for video
    const isVideoExists = await Playlist.findOne(
        {
            videos: videoId,
            _id: id
        }
    )

    if (isVideoExists) {
        throw new APIerror(400, "Video is already in playlist")
    }

    //adding video for playlist
    const playlist = await Playlist.findByIdAndUpdate(
        id,
        {
            $push: {
                videos: videoId
            }
        },
        {
            new: true
        }
    )

    res.status(201).json(new APIresponse(201, playlist, "Playlist updated"));
})

// removing video from playlist
const updatePlaylistVideoRemove = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { videoId } = req.body;

    if (!videoId) {
        throw new APIerror(400, "video must be required to delete from playlist")
    }

    // removing video from playlist
    const playlist = await Playlist.findByIdAndUpdate(
        id,
        {
            $pull: { videos: videoId },
        },
        {
            new: true
        }
    )

    if (!playlist) {
        throw new APIerror(400, "Video is not part of the playlist");
    }

    res.status(201).json(new APIresponse(201, playlist, "Playlist updated"));
})

// get all playlists by user
const getPlaylists = asyncHandler(async (req, res) => {
    const { id } = req.params;

    //created by is a channel
    const playlists = await Playlist.find(
        {
            createdBy: id
        }
    ).populate("videos")

    res.status(200).json(new APIresponse(200, playlists, "playlist fetched"));
})

//delete playlist contorller
const deletePlaylist = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const playlists = await Playlist.findByIdAndDelete(id)

    if (!playlists) {
        throw new APIerror(404, "No playlsit found");
    }

    //delting playlist from playlist id
    await Channel.findByIdAndUpdate(
        req.channel._id,
        {
            $pull: { playlist: id }
        }
    )

    res.status(200).json(new APIresponse(200, {}, "playlist deleted"));
})

export { createPlaylist, updatePlaylistVideoAdd, updatePlaylistVideoRemove, getPlaylists, deletePlaylist };