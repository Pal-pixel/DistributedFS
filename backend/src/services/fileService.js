const { db } = require("../config/firebase");

const filesCollection = db.collection("files");

/**
 * Save file metadata to Firestore.
 */
const saveMetadata = async (metadata) => {
    await filesCollection
        .doc(metadata.fileId)
        .set(metadata);

    return metadata;
};

/**
 * Get all file metadata.
 */
const getAllFiles = async () => {
    const snapshot = await filesCollection.get();

    const files = [];

    snapshot.forEach((doc) => {
        files.push(doc.data());
    });

    return files;
};

/**
 * Get a file by ID.
 */
const getFileById = async (fileId) => {
    const doc = await filesCollection
        .doc(fileId)
        .get();

    if (!doc.exists) {
        return null;
    }

    return doc.data();
};

/**
 * Delete only the Firestore metadata.
 *
 * Physical file deletion is handled
 * by the storage node.
 */
const deleteFileMetadata = async (fileId) => {
    const doc = await filesCollection
        .doc(fileId)
        .get();

    if (!doc.exists) {
        return null;
    }

    const file = doc.data();

    await filesCollection
        .doc(fileId)
        .delete();

    return file;
};

/**
 * Update file metadata.
 */
const updateFileMetadata = async (
    fileId,
    updates
) => {
    await filesCollection
        .doc(fileId)
        .update(updates);

    return getFileById(fileId);
};

module.exports = {
    saveMetadata,
    getAllFiles,
    getFileById,
    updateFileMetadata,
    deleteFileMetadata
};