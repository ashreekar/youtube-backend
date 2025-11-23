import { Router } from "express";
import { verifyJwt } from "../middleware/verifyJwt.js"
import { changeThumbnail, deleteVideo, getallvideos, getVideoById, updateVideo, uploadVideo } from "../controller/video.controller.js";
import { verifyChannel } from "../middleware/verifyChannel.js";
import { verifyOwner } from "../middleware/verify.owner.js";

const router = Router();

router
    .route('/')
    .get(getallvideos)
    .post(verifyJwt, verifyChannel, uploadVideo)

router
    .route('/:id/thumbnail')
    .put(verifyJwt, verifyChannel, verifyOwner, changeThumbnail)

router
    .route('/:id')
    .get(getVideoById)
    .put(verifyJwt, verifyChannel, verifyOwner, updateVideo)
    .delete(verifyJwt, verifyChannel, verifyOwner, deleteVideo)

export default router;