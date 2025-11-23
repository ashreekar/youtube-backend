import { Router } from "express";
import { verifyJwt } from "../middleware/verifyJwt.js"
import { changeThumbnail, deleteVideo, getallvideos, getVideoById, updateVideo, uploadVideo } from "../controller/video.controller.js";
import { verifyChannel } from "../middleware/verifyChannel.js";

const router = Router();

router
    .route('/')
    .get(getallvideos)
    .post(verifyJwt, verifyChannel, uploadVideo)

router
    .route('/:id/thumbnail')
    .put(verifyJwt, verifyChannel, changeThumbnail)

router
    .route('/:id')
    .get(getVideoById)
    .put(verifyJwt, verifyChannel, updateVideo)
    .delete(verifyJwt, verifyChannel, deleteVideo)

export default router;