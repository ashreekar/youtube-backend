import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Routes
import userRouter from "./route/User.route.js"
import channelRouter from "./route/Channel.route.js"
import vidoeRouter from "./route/Video.route.js"

const app = express();

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
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
app.use('/api/v1/post', userRouter);

export { app };