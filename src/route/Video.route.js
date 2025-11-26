import { Router } from "express";
import { verifyJwt } from "../middleware/verifyJwt.js"
import {
    changeThumbnail,
    deleteVideo,
    getallvideos,
    getCategories,
    getVideoById,
    getVideosByCategories,
    updateVideo,
    uploadVideo
} from "../controller/video.controller.js";
import { verifyChannel } from "../middleware/verifyChannel.js";
import { verifyOwner } from "../middleware/verify.owner.js";
import { upload } from "../middleware/multer.middleware.js"
import { checkForFiles } from '../middleware/checkforfile.middleware.js';

const router = Router();

router
    .route('/')
    .get(getallvideos)
    .post(verifyJwt, verifyChannel, upload.fields([{ name: "thumbnail", maxCount: 1 }]), checkForFiles, uploadVideo)

router
    .route('/category')
    .get(getCategories)

router
    .route('/category/:id')
    .get(getVideosByCategories)

router
    .route('/thumbnail/:id')
    .put(verifyJwt, verifyChannel, verifyOwner, upload.fields([{ name: "thumbnail", maxCount: 1 }]), checkForFiles, changeThumbnail)

router
    .route('/:id')
    .get(getVideoById)
    .put(verifyJwt, verifyChannel, verifyOwner, updateVideo)
    .delete(verifyJwt, verifyChannel, verifyOwner, deleteVideo)

export default router;