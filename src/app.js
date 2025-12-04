import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Routes
import userRouter from "./route/user.route.js"
import channelRouter from "./route/channel.route.js"
import vidoeRouter from "./route/video.route.js"
import postRouter from "./route/post.route.js"
import commentRouter from "./route/comment.route.js"
import reactionRouter from "./route/reaction.route.js"
import playlistRouter from "./route/playlist.route.js"
import searchRouter from "./route/search.route.js"

//  global error handler
import { errorHandler } from "./middleware/error.middleware.js"

const app = express();

// allowing cors of 5173 and 3317
app.use(cors(
    {
        origin: ["http://localhost:5173", "http://localhost:3317"],
        credentials: true
    }
));

// express json and urlencoded middleware to parse request bodies
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

// serving a static server from public
app.use(express.static('public'));
app.use(cookieParser());

// registering all routes
app.use('/api/v1/user', userRouter);
app.use('/api/v1/video', vidoeRouter);
app.use('/api/v1/channel', channelRouter);
app.use('/api/v1/post', postRouter);
app.use('/api/v1/comment', commentRouter);
app.use('/api/v1/reaction', reactionRouter);
app.use('/api/v1/playlist', playlistRouter);
app.use('/api/v1/search', searchRouter);

// registering global error handling middleware
app.use(errorHandler);

export { app };