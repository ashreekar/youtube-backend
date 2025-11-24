import { Router } from "express";
import { verifyJwt } from "../middleware/verifyJwt.js";
import { verifyChannel } from "../middleware/verifyChannel.js";
import { verifyOwner } from "../middleware/verify.owner.js";
import { createPlaylist, deletePlaylist, getPlaylists, updatePlaylist, updatePlaylistVideoAdd, updatePlaylistVideRemove } from "../controller/playlist.controller.js";

const router = Router();

router
    .route('/')
    .post(verifyJwt, verifyChannel, createPlaylist)

router
    .route('/:id')
    .get(getPlaylists)  //get playlist by user id
    .put(verifyJwt, verifyChannel, verifyOwner, updatePlaylistVideoAdd)
    .delete(verifyJwt, verifyChannel, verifyOwner, deletePlaylist)

router
    .route('/remove/:id')
    .put(verifyJwt, verifyChannel, verifyOwner, updatePlaylistVideRemove)

export default router;