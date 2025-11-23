import { Router } from "express";
import { verifyJwt } from "../middleware/verifyJwt.js"
import {
    commentOnCommnent,
    commentOnPost,
    commentOnVideo,
    deleteComment,
    getCommentOfComment,
    getCommentOfPost,
    getCommentOfVideo,
    updateComment,
} from "../controller/comment.controller.js";

const router = Router();

router
    .route('/:id')
    .put(verifyJwt, updateComment)
    .delete(verifyJwt, deleteComment)

router
    .route('/video/:id')
    .get(getCommentOfVideo)
    .post(verifyJwt, commentOnVideo)

router
    .route('/comment/:id')
    .get(getCommentOfComment)
    .post(verifyJwt, commentOnCommnent)

router
    .route('/post/:id')
    .get(getCommentOfPost)
    .post(verifyJwt, commentOnPost)

export default router;