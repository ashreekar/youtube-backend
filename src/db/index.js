import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`mongodb://127.0.0.1:27017/youtube-backend`);
        console.log(`🗄️  Database connected: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("❌ Database connection failed:", error);
        process.exit(1);
    }
}

export { connectDB };