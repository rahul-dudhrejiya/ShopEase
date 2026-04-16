// WHAT: Handles file uploads from frontend
// WHY: Express cannot read files/images by default
//      Multer adds that ability
// HOW: Multer reads the file, stores in memory as buffer
//      Then our controller uploads it to Cloudinary

import multer from 'multer';

// WHAT: memoryStorage stores file in RAM temporarily
// WHY: We don't want to save files to our server disk
//      We immediately upload to Cloudinary and discard
// Real analogy: Like holding a package briefly before
//               handing it to courier (Cloudinary)
const storage = multer.memoryStorage();

// File filter — only allow images
const fileFilter = (req, file, cb) => {
    // WHAT: Check if uploaded file is an image
    // WHY: Prevent uploading PDFs, ZIPs, viruses etc.
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);  // null = no error, true = accept file
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
        // WHY limit? Prevent huge file uploads that slow server
    },
});

export default upload;