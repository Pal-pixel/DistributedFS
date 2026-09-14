const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

const {
    saveMetadata,
    getAllFiles,
    getFileById,
    deleteFileMetadata
} = require("../services/fileService");

const {
    calculateChecksum
} = require("../utils/checksum");

const {
    selectStorageNodes,
    uploadFileToNode,
    downloadFromStorageNode,
    deleteFromStorageNode
} = require("../services/storageService");


/**
 * Safely delete a file from a storage node.
 *
 * Used for rollback.
 */
const safeDeleteFromNode = async (
    node,
    storageName,
    label
) => {

    if (
        !node ||
        !storageName
    ) {
        return false;
    }

    try {

        await deleteFromStorageNode(
            node,
            storageName
        );

        console.log(
            `Rollback: ${label} deleted from ${node.nodeId}`
        );

        return true;

    } catch (error) {

        console.error(
            `Rollback failed: could not delete ${label} from ${node.nodeId}:`,
            error.message
        );

        return false;
    }
};


/**
 * =========================================
 * UPLOAD FILE
 * =========================================
 *
 * Distributed upload:
 *
 * Client
 *   ↓
 * Coordinator
 *   ↓
 * Select primary + replica
 *   ↓
 * Upload primary
 *   ↓
 * Upload replica
 *   ↓
 * Save Firestore metadata
 *
 *
 * Failure handling:
 *
 * Primary fails
 *   → upload fails
 *
 * Replica fails
 *   → delete primary
 *
 * Firestore fails
 *   → delete primary + replica
 */
const uploadFile = async (
    req,
    res
) => {

    let temporaryFilePath = null;

    let primaryNode = null;
    let replicaNode = null;

    let primaryStorage = null;
    let replicaStorage = null;

    let metadataSaved = false;


    try {

        /*
         * =====================================
         * Validate upload
         * =====================================
         */

        if (!req.file) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "No file uploaded"
            });
        }


        temporaryFilePath =
            req.file.path;


        /*
         * =====================================
         * Generate file information
         * =====================================
         */

        const fileId =
            uuidv4();


        const checksum =
            calculateChecksum(
                req.file.path
            );


        /*
         * =====================================
         * Select two healthy nodes
         * =====================================
         */

        const selectedNodes =
            await selectStorageNodes(2);


        primaryNode =
            selectedNodes[0];


        replicaNode =
            selectedNodes[1];


        console.log(
            `Primary selected: ${primaryNode.nodeId}`
        );

        console.log(
            `Replica selected: ${replicaNode.nodeId}`
        );


        /*
         * =====================================
         * Upload PRIMARY
         * =====================================
         */

        try {

            primaryStorage =
                await uploadFileToNode(
                    primaryNode,
                    req.file.path,
                    req.file.originalname,
                    "primary"
                );

        } catch (error) {

            console.error(
                "Primary upload failed:",
                error.message
            );


            throw new Error(
                `Primary storage upload failed: ${error.message}`
            );
        }


        /*
         * =====================================
         * Upload REPLICA
         * =====================================
         */

        try {

            replicaStorage =
                await uploadFileToNode(
                    replicaNode,
                    req.file.path,
                    req.file.originalname,
                    "replica"
                );

        } catch (error) {

            console.error(
                "Replica upload failed:",
                error.message
            );


            /*
             * =================================
             * ROLLBACK PRIMARY
             * =================================
             */

            if (
                primaryStorage &&
                primaryStorage.storageName
            ) {

                await safeDeleteFromNode(
                    primaryNode,
                    primaryStorage.storageName,
                    "primary copy"
                );
            }


            throw new Error(
                `Replica storage upload failed: ${error.message}`
            );
        }


        /*
         * =====================================
         * Build metadata
         * =====================================
         */

        const metadata = {

            fileId:
                fileId,

            fileName:
                req.file.originalname,

            size:
                req.file.size,

            contentType:
                req.file.mimetype,

            checksum:
                checksum,

            storageProvider:
                "STORAGE_NODE",

            replicationFactor:
                2,


            /*
             * PRIMARY
             */

            primaryNodeId:
                primaryNode.nodeId,

            primaryNodeHost:
                primaryNode.host,

            primaryNodePort:
                primaryNode.port,

            primaryStorageName:
                primaryStorage.storageName,


            /*
             * REPLICA
             */

            replicaNodeId:
                replicaNode.nodeId,

            replicaNodeHost:
                replicaNode.host,

            replicaNodePort:
                replicaNode.port,

            replicaStorageName:
                replicaStorage.storageName,


            createdAt:
                new Date().toISOString()
        };


        /*
         * =====================================
         * Save Firestore metadata
         * =====================================
         */

        try {

            await saveMetadata(
                metadata
            );

            metadataSaved =
                true;

        } catch (error) {

            console.error(
                "Firestore metadata save failed:",
                error.message
            );


            /*
             * =================================
             * ROLLBACK PRIMARY
             * =================================
             */

            if (
                primaryStorage &&
                primaryStorage.storageName
            ) {

                await safeDeleteFromNode(
                    primaryNode,
                    primaryStorage.storageName,
                    "primary copy"
                );
            }


            /*
             * =================================
             * ROLLBACK REPLICA
             * =================================
             */

            if (
                replicaStorage &&
                replicaStorage.storageName
            ) {

                await safeDeleteFromNode(
                    replicaNode,
                    replicaStorage.storageName,
                    "replica copy"
                );
            }


            throw new Error(
                `Metadata save failed: ${error.message}`
            );
        }


        /*
         * =====================================
         * Delete temporary coordinator file
         * =====================================
         */

        if (
            temporaryFilePath &&
            fs.existsSync(
                temporaryFilePath
            )
        ) {

            fs.unlinkSync(
                temporaryFilePath
            );

            temporaryFilePath =
                null;
        }


        /*
         * =====================================
         * SUCCESS
         * =====================================
         */

        res.status(201).json({

            success:
                true,

            message:
                "File replicated successfully",

            file:
                metadata
        });


    } catch (error) {

        console.error(
            "Replication upload error:",
            error.message
        );


        /*
         * =====================================
         * FINAL SAFETY ROLLBACK
         * =====================================
         *
         * If metadata was NOT saved,
         * remove any known physical copies.
         */

        if (
            !metadataSaved
        ) {

            if (
                primaryStorage &&
                primaryStorage.storageName
            ) {

                await safeDeleteFromNode(
                    primaryNode,
                    primaryStorage.storageName,
                    "primary copy"
                );
            }


            if (
                replicaStorage &&
                replicaStorage.storageName
            ) {

                await safeDeleteFromNode(
                    replicaNode,
                    replicaStorage.storageName,
                    "replica copy"
                );
            }
        }


        /*
         * =====================================
         * Temporary file cleanup
         * =====================================
         */

        if (
            temporaryFilePath &&
            fs.existsSync(
                temporaryFilePath
            )
        ) {

            try {

                fs.unlinkSync(
                    temporaryFilePath
                );

            } catch (cleanupError) {

                console.error(
                    "Temporary file cleanup failed:",
                    cleanupError.message
                );
            }
        }


        res.status(500).json({

            success:
                false,

            message:
                "Replicated upload failed",

            error:
                error.message
        });
    }
};


/**
 * =========================================
 * GET ALL FILES
 * =========================================
 */

const getFiles = async (
    req,
    res
) => {

    try {

        const files =
            await getAllFiles();


        res.status(200).json({

            success:
                true,

            count:
                files.length,

            files:
                files
        });


    } catch (error) {

        console.error(
            "Get files error:",
            error
        );


        res.status(500).json({

            success:
                false,

            message:
                "Failed to retrieve files"
        });
    }
};


/**
 * =========================================
 * GET FILE METADATA
 * =========================================
 */

const getFile = async (
    req,
    res
) => {

    try {

        const file =
            await getFileById(
                req.params.id
            );


        if (!file) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "File not found"
            });
        }


        res.status(200).json({

            success:
                true,

            file:
                file
        });


    } catch (error) {

        console.error(
            "Get file error:",
            error
        );


        res.status(500).json({

            success:
                false,

            message:
                "Failed to retrieve file"
        });
    }
};


/**
 * =========================================
 * DOWNLOAD FILE
 * =========================================
 *
 * Primary is attempted first.
 *
 * If primary fails,
 * replica is used.
 */
const downloadFile = async (
    req,
    res
) => {

    try {

        const file =
            await getFileById(
                req.params.id
            );


        if (!file) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "File not found"
            });
        }


        if (
            file.storageProvider !==
            "STORAGE_NODE"
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "File is not stored on a storage node"
            });
        }


        /*
         * =====================================
         * PRIMARY
         * =====================================
         */

        const primaryNode = {

            nodeId:
                file.primaryNodeId,

            host:
                file.primaryNodeHost,

            port:
                file.primaryNodePort
        };


        try {

            console.log(
                `Trying primary node: ${primaryNode.nodeId}`
            );


            const response =
                await downloadFromStorageNode(
                    primaryNode,
                    file.primaryStorageName
                );


            console.log(
                `Primary node ${primaryNode.nodeId} is available`
            );


            res.setHeader(
                "Content-Type",
                file.contentType ||
                "application/octet-stream"
            );


            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${file.fileName}"`
            );


            response.data.pipe(
                res
            );


            return;


        } catch (primaryError) {

            console.error(
                `Primary node ${primaryNode.nodeId} failed:`,
                primaryError.message
            );
        }


        /*
         * =====================================
         * REPLICA FAILOVER
         * =====================================
         */

        if (
            !file.replicaNodeId ||
            !file.replicaNodeHost ||
            !file.replicaNodePort ||
            !file.replicaStorageName
        ) {

            return res.status(503).json({

                success:
                    false,

                message:
                    "Primary storage node unavailable and no replica is available"
            });
        }


        const replicaNode = {

            nodeId:
                file.replicaNodeId,

            host:
                file.replicaNodeHost,

            port:
                file.replicaNodePort
        };


        try {

            console.log(
                `Failover: trying replica node: ${replicaNode.nodeId}`
            );


            const response =
                await downloadFromStorageNode(
                    replicaNode,
                    file.replicaStorageName
                );


            console.log(
                `Replica node ${replicaNode.nodeId} successfully served the file`
            );


            res.setHeader(
                "Content-Type",
                file.contentType ||
                "application/octet-stream"
            );


            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${file.fileName}"`
            );


            response.data.pipe(
                res
            );


        } catch (replicaError) {

            console.error(
                `Replica node ${replicaNode.nodeId} failed:`,
                replicaError.message
            );


            if (
                !res.headersSent
            ) {

                res.status(503).json({

                    success:
                        false,

                    message:
                        "Both primary and replica storage nodes are unavailable"
                });
            }
        }


    } catch (error) {

        console.error(
            "Failover download error:",
            error
        );


        if (
            !res.headersSent
        ) {

            res.status(500).json({

                success:
                    false,

                message:
                    "Distributed download failed",

                error:
                    error.message
            });
        }
    }
};


/**
 * =========================================
 * DELETE FILE
 * =========================================
 *
 * Deletes physical copies first.
 *
 * Firestore metadata is deleted only when
 * the required physical deletions succeed.
 */
const deleteUploadedFile = async (
    req,
    res
) => {

    try {

        const file =
            await getFileById(
                req.params.id
            );


        if (!file) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "File not found"
            });
        }


        let primaryDeleted =
            false;

        let replicaDeleted =
            false;


        /*
         * =====================================
         * DELETE PRIMARY
         * =====================================
         */

        if (
            file.primaryNodeId &&
            file.primaryNodeHost &&
            file.primaryNodePort &&
            file.primaryStorageName
        ) {

            const primaryNode = {

                nodeId:
                    file.primaryNodeId,

                host:
                    file.primaryNodeHost,

                port:
                    file.primaryNodePort
            };


            try {

                await deleteFromStorageNode(
                    primaryNode,
                    file.primaryStorageName
                );


                primaryDeleted =
                    true;


                console.log(
                    `Primary copy deleted from ${primaryNode.nodeId}`
                );


            } catch (error) {

                console.error(
                    `Failed to delete primary copy from ${primaryNode.nodeId}:`,
                    error.message
                );
            }
        }


        /*
         * =====================================
         * DELETE REPLICA
         * =====================================
         */

        if (
            file.replicaNodeId &&
            file.replicaNodeHost &&
            file.replicaNodePort &&
            file.replicaStorageName
        ) {

            const replicaNode = {

                nodeId:
                    file.replicaNodeId,

                host:
                    file.replicaNodeHost,

                port:
                    file.replicaNodePort
            };


            try {

                await deleteFromStorageNode(
                    replicaNode,
                    file.replicaStorageName
                );


                replicaDeleted =
                    true;


                console.log(
                    `Replica copy deleted from ${replicaNode.nodeId}`
                );


            } catch (error) {

                console.error(
                    `Failed to delete replica copy from ${replicaNode.nodeId}:`,
                    error.message
                );
            }
        }


        /*
         * =====================================
         * Validate deletion
         * =====================================
         */

        const hasReplica =
            file.replicaNodeId &&
            file.replicaStorageName;


        if (
            !primaryDeleted &&
            file.primaryStorageName
        ) {

            return res.status(503).json({

                success:
                    false,

                message:
                    "Primary file could not be deleted",

                primaryDeleted:
                    primaryDeleted,

                replicaDeleted:
                    replicaDeleted
            });
        }


        if (
            hasReplica &&
            !replicaDeleted
        ) {

            return res.status(503).json({

                success:
                    false,

                message:
                    "Replica file could not be deleted",

                primaryDeleted:
                    primaryDeleted,

                replicaDeleted:
                    replicaDeleted
            });
        }


        /*
         * =====================================
         * Delete Firestore metadata
         * =====================================
         */

        await deleteFileMetadata(
            req.params.id
        );


        /*
         * =====================================
         * SUCCESS
         * =====================================
         */

        res.status(200).json({

            success:
                true,

            message:
                "File and all replicas deleted successfully",

            fileId:
                file.fileId,

            primaryDeleted:
                primaryDeleted,

            replicaDeleted:
                replicaDeleted
        });


    } catch (error) {

        console.error(
            "Distributed delete error:",
            error
        );


        res.status(500).json({

            success:
                false,

            message:
                "Distributed delete failed",

            error:
                error.message
        });
    }
};


/*
 * =========================================
 * EXPORTS
 * =========================================
 */

module.exports = {

    uploadFile,

    getFiles,

    getFile,

    downloadFile,

    deleteUploadedFile
};