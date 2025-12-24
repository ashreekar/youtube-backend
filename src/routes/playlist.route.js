import { Router } from "express";
import { verifyJwt } from "../middleware/verifyJwt.js";
import { verifyChannel } from "../middleware/verifyChannel.js";
import { verifyOwner } from "../middleware/verify.owner.js";
import { createPlaylist, deletePlaylist, getPlaylists, updatePlaylistVideoAdd, updatePlaylistVideoRemove } from "../controller/playlist.controller.js";

const router = Router();

// create playlist route
router
    .route('/')
    .post(verifyJwt, verifyChannel, createPlaylist)

// can update playlist,getplaylist,delteplaylist
router
    .route('/:id')
    .get(getPlaylists)  //get playlist by user id
    .put(verifyJwt, verifyChannel, verifyOwner, updatePlaylistVideoAdd)
    .delete(verifyJwt, verifyChannel, verifyOwner, deletePlaylist)

//route to remove a video from a playlist
router
    .route('/remove/:id')
    .put(verifyJwt, verifyChannel, verifyOwner, updatePlaylistVideoRemove)

export default router;