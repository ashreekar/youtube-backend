import { Router } from "express";
import { verifyChannel } from "../middleware/verifyChannel.js";
import { verifyJwt } from "../middleware/verifyJwt.js";

import {
    addPost,
    deletePost,
    getallPosts,
    getPostById,
    updatePost
} from "../controller/post.controller.js";
import { verifyOwner } from "../middleware/verify.owner.js";

const router = Router();

router
    .route('/')
    .get(getallPosts)
    .post(verifyJwt, verifyChannel, addPost)


router
    .route('/:id')
    .get(getPostById)
    .put(verifyJwt, verifyChannel, verifyOwner, updatePost)
    .delete(verifyJwt, verifyChannel, verifyOwner, deletePost)

export { router };