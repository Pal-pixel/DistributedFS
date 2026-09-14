const express = require("express");

const upload = require("../middleware/uploadMiddleware");

const {
    uploadFile,
    getFiles,
    getFile,
    downloadFile,
    deleteUploadedFile
} = require("../controllers/fileController");

const router = express.Router();

router.post(
    "/upload",
    upload.single("file"),
    uploadFile
);

router.get(
    "/",
    getFiles
);

router.get(
    "/:id",
    getFile
);

router.get(
    "/:id/download",
    downloadFile
);

router.delete(
    "/:id",
    deleteUploadedFile
);

module.exports = router;