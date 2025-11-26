import { Router } from 'express';
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from '../middleware/verifyJwt.js';

import {
    createUser,
    deleteUser,
    getUser,
    loginUser,
    logoutUser,
    updateAvatar,
    updateCoverImage,
    updateUserDetails
} from '../controller/user.controller.js';
import { verifyCreateUser } from '../middleware/input.userfields.verify.js';
import { checkForFiles } from '../middleware/checkforfile.middleware.js';

const router = Router();

router
    .route('/')
    .get(verifyJwt, getUser)
    .put(verifyJwt, updateUserDetails)
    .delete(verifyJwt, deleteUser);

router
    .route('/create')
    .post(upload.fields([{
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }]),
        verifyCreateUser,
        checkForFiles,
        createUser);

router.route('/login').post(loginUser);
router.route('/logout').post(verifyJwt, logoutUser);

router
    .route('/avatar')
    .put(verifyJwt, upload.fields([{ name: "avatar", maxCount: 1 }]), checkForFiles, updateAvatar);
router
    .route('/cover')
    .put(verifyJwt, upload.fields([{ name: "coverImage", maxCount: 1 }]), checkForFiles, updateCoverImage);

export default router;