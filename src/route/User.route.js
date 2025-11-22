import { Router } from 'express';
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from '../middleware/verifyJwt.js';

import { 
    createUser, 
    getUser, 
    loginUser, 
    logoutUser, 
    updateAvatar, 
    updateCoverImage, 
    updateUserDetails } from '../controller/user.controller.js';


const router = Router();

router
    .route('/')
    .get(verifyJwt, getUser)
    .put(verifyJwt, updateUserDetails)
    .delete(verifyJwt);

router
    .route('/create')
    .post(upload.fields([{
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }]), createUser);

router.route('/login').post(loginUser);
router.route('/logout').post(verifyJwt, logoutUser);

router
    .route('/avatar')
    .put(verifyJwt, upload.fields([{ name: "avatar", maxCount: 1 }]), updateAvatar);
router
    .route('/cover')
    .put(verifyJwt, upload.fields([{ name: "coverImage", maxCount: 1 }]), updateCoverImage);

export default router;