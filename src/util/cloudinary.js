import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        console.log("✅ File uploaded securely 🌐", response.url);
        fs.unlinkSync(localFilePath);
        return response;

    } catch (err) {
        fs.unlinkSync(localFilePath);
        return null;
    }

}

const deleteOnCloudinary = async (fileUrl) => {
    try {
        if (!fileUrl) return null;

        const cleanUrl = fileUrl.split("?")[0];

        const parts = cleanUrl.split("/upload/")[1];

        const withoutVersion = parts.substring(parts.indexOf("/") + 1);

        const publicId = withoutVersion.replace(/\.[^/.]+$/, "");

        const deletedKey = await cloudinary.uploader.destroy(publicId);
        console.log("✅ File deleted securely 🌐", deletedKey);
        return deletedKey;

    } catch (err) {
        console.error("❌ Error deleting file from Cloudinary:", err);
        return null;
    }
};

export { uploadOnCloudinary, deleteOnCloudinary };