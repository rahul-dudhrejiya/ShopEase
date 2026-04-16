// WHAT: Connects our backend to Cloudinary service
// WHY: Every image upload needs authentication with Cloudinary
// HOW: We use our credentials to configure the connection once

import { v2 as cloudinary } from 'cloudinary';

const connectCloudinary = () => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    console.log('✅ Cloudinary Connected');
};

export default connectCloudinary;
export { cloudinary };