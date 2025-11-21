import { app } from "./app.js";
import dotenv from 'dotenv';

dotenv.config({
    path: "./env"
})

app.listen(3000, () => {
    console.log("App is listnign on port 3000");
})