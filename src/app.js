import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Routes
import userRouter from './routes/user.route.js'
import channelRouter from './routes/channel.route.js'
import videoRouter from './routes/video.route.js'
import postRouter from './routes/post.route.js'
import commentRouter from './routes/comment.route.js'
import reactionRouter from './routes/reaction.route.js'
import playlistRouter from './routes/playlist.route.js'
import searchRouter from './routes/search.route.js'

//  global error handler
import { errorHandler } from './middleware/error.middleware.js'

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
app.use('/api/v1/video', videoRouter);
app.use('/api/v1/channel', channelRouter);
app.use('/api/v1/post', postRouter);
app.use('/api/v1/comment', commentRouter);
app.use('/api/v1/reaction', reactionRouter);
app.use('/api/v1/playlist', playlistRouter);
app.use('/api/v1/search', searchRouter);

// registering global error handling middleware
app.use(errorHandler);

export { app };