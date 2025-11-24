import { Channel } from "../model/Channel.model.js";
import { Playlist } from "../model/Playlist.model.js";
import { APIerror } from "../util/APIerror.js";
import { APIresponse } from "../util/APIresponse.js";
import { asyncHandler } from "../util/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { title, videoId } = req.body;

    if (!title || !videoId) {
        throw new APIerror(400, "title and video must be required to create playlist")
    }

    const playlist = await Playlist.create(
        {
            title,
            videos: {
                $push: videoId
            },
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

const updatePlaylistVideoAdd = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { videoId } = req.body;

    if (!title || !videoId) {
        throw new APIerror(400, "title and video must be required to create playlist")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        {
            id
        },
        {
            videos: {
                $push: videoId
            }
        },
        {
            new: true
        }
    )

    res.status(201).json(new APIresponse(201, playlist, "Playlist updated"));
})

const updatePlaylistVideRemove = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { videoId } = req.body;

    if (!title || !videoId) {
        throw new APIerror(400, "title and video must be required to create playlist")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        {
            id
        },
        {
            videos: {
                $pull: videoId
            }
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

const getPlaylists = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const playlists = await Playlist.find(
        {
            createdBy: id
        }
    ).populate("videos")

    if (!playlists) {
        throw new APIerror(404, "No playlsit found");
    }

    res.status(200).json(new APIresponse(200, playlists, "playlist fetched"));
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const playlists = await Playlist.findByIdAndDelete(
        id
    )

    if (!playlists) {
        throw new APIerror(404, "No playlsit found");
    }

    await Channel.findByIdAndUpdate(
        req.channel._id,
        {
            $pull: {
                id
            }
        }
    )

    res.status(200).json(new APIresponse(200, {}, "playlist deleted"));
})

export { createPlaylist, updatePlaylistVideoAdd, updatePlaylistVideRemove, getPlaylists, deletePlaylist };