import { Router } from "express";
import { searchVideos } from "../controller/search.controller.js";

const router = Router();

router.route('/').get(searchVideos);

export default router;