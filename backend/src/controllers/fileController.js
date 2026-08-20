const { v4: uuidv4 } = require("uuid");

const {
    saveMetadata,
    getAllFiles,
    getFileById,
    deleteFile
} = require("../services/fileService");
const { calculateChecksum } = require("../utils/checksum");

const uploadFile = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }
        const fileId = uuidv4();
        const checksum = calculateChecksum(req.file.path);

        const metadata = {
            fileId: fileId,
            fileName: req.file.originalname,
            storageName: req.file.filename,
            size: req.file.size,
            contentType: req.file.mimetype,
            checksum: checksum,
            storageProvider: "LOCAL_DEV",
            createdAt: new Date().toISOString()
        };

        saveMetadata(metadata);

        res.status(201).json({
            success: true,
            message: "File uploaded successfully",
            file: metadata
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "File upload failed"
        });
    }
};

const getFiles = (req, res) => {
    try {
        const files = getAllFiles();

        res.status(200).json({
            success: true,
            count: files.length,
            files: files
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve files"
        });
    }
};

const downloadFile = (req, res) => {
    try {
        const file = getFileById(req.params.id);

        if (!file) {
            return res.status(404).json({
                success: false,
                message: "File not found"
            });
        }

        const filePath = require("path").join(
            process.cwd(),
            "uploads",
            file.storageName
        );

        res.download(filePath, file.fileName);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Download failed"
        });
    }
};

const deleteUploadedFile = (req, res) => {
    try {
        const file = deleteFile(req.params.id);

        if (!file) {
            return res.status(404).json({
                success: false,
                message: "File not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "File deleted successfully",
            fileId: file.fileId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Delete failed"
        });
    }
};

module.exports = {
    uploadFile,
    getFiles,
    downloadFile,
    deleteUploadedFile
};