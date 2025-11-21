import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Routes
import userRouter from "./route/User.route.js"

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

app.get('/', (req, res) => {
    res.send("Server is runnig");
})

app.use('/api/v1/user', userRouter);

export { app };