const fs = require("fs");
const path = require("path");

const files = [];

const uploadDirectory = path.join(process.cwd(), "uploads");

const saveMetadata = (metadata) => {
    files.push(metadata);
    return metadata;
};

const getAllFiles = () => {
    return files;
};

const getFileById = (fileId) => {
    return files.find(file => file.fileId === fileId);
};

const deleteFile = (fileId) => {
    const index = files.findIndex(file => file.fileId === fileId);

    if (index === -1) {
        return null;
    }

    const file = files[index];

    const filePath = path.join(uploadDirectory, file.storageName);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    files.splice(index, 1);

    return file;
};

module.exports = {
    saveMetadata,
    getAllFiles,
    getFileById,
    deleteFile
};