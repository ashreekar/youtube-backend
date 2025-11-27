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
import { errorHandler } from "./middleware/error.middleware.js"

const app = express();

app.use(cors(
    {
        origin: ["http://localhost:5173", "http://localhost:3317"],
        credentials: true
    }
));

app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(express.static('public'));
app.use(cookieParser());

app.use('/api/v1/user', userRouter);
app.use('/api/v1/video', vidoeRouter);
app.use('/api/v1/channel', channelRouter);
app.use('/api/v1/post', postRouter);
app.use('/api/v1/comment', commentRouter);
app.use('/api/v1/reaction', reactionRouter);
app.use('/api/v1/playlist', playlistRouter);
app.use('/api/v1/search', searchRouter);

// app.use(errorHandler);

export { app };