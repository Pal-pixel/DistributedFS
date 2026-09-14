const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const crypto = require("crypto");

const { db } = require("../config/firebase");

const app = express();

const NODE_ID =
    process.env.NODE_ID || "node-1";

const PORT =
    Number(process.env.NODE_PORT || 5001);

const STORAGE_DIR =
    process.env.STORAGE_DIR ||
    path.join(
        process.cwd(),
        "storage-nodes",
        NODE_ID
    );

let activeRequests = 0;


/*
 * =========================================
 * Basic middleware
 * =========================================
 */

app.use(cors());

app.use(express.json());


/*
 * =========================================
 * Active request tracking
 * =========================================
 */

app.use((req, res, next) => {

    if (
        req.path !==
        "/api/storage/stats"
    ) {

        activeRequests++;

        res.on(
            "finish",
            () => {
                activeRequests--;
            }
        );
    }

    next();
});


/*
 * =========================================
 * Storage directory
 * =========================================
 */

fs.mkdirSync(
    STORAGE_DIR,
    {
        recursive: true
    }
);


/*
 * =========================================
 * Multer configuration
 * =========================================
 */

const storage =
    multer.diskStorage({

        destination: (
            req,
            file,
            cb
        ) => {

            cb(
                null,
                STORAGE_DIR
            );
        },

        filename: (
            req,
            file,
            cb
        ) => {

            const uniqueName =
                Date.now().toString(36) +
                "-" +
                Math.random()
                    .toString(36)
                    .substring(2, 15);

            cb(
                null,
                uniqueName
            );
        }
    });


const upload =
    multer({
        storage:
            storage
    });


/*
 * =========================================
 * Root endpoint
 * =========================================
 */

app.get(
    "/",
    (req, res) => {

        res.json({

            name:
                "DistributedFS Storage Node",

            nodeId:
                NODE_ID,

            port:
                PORT,

            storageDirectory:
                STORAGE_DIR,

            status:
                "running"
        });
    }
);


/*
 * =========================================
 * Health endpoint
 * =========================================
 */

app.get(
    "/health",
    (req, res) => {

        res.status(200).json({

            status:
                "healthy",

            nodeId:
                NODE_ID,

            port:
                PORT,

            timestamp:
                new Date().toISOString()
        });
    }
);


/*
 * =========================================
 * Storage information
 * =========================================
 */

app.get(
    "/api/storage/info",
    (req, res) => {

        try {

            const files =
                fs.readdirSync(
                    STORAGE_DIR
                );


            const fileCount =
                files.filter(
                    file => {

                        const filePath =
                            path.join(
                                STORAGE_DIR,
                                file
                            );

                        return fs
                            .statSync(
                                filePath
                            )
                            .isFile();

                    }
                ).length;


            res.status(200).json({

                success:
                    true,

                nodeId:
                    NODE_ID,

                storageDirectory:
                    STORAGE_DIR,

                fileCount:
                    fileCount
            });


        } catch (error) {

            console.error(
                "Storage info error:",
                error
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Failed to read storage information"
            });
        }
    }
);


/*
 * =========================================
 * Storage statistics
 * =========================================
 */

app.get(
    "/api/storage/stats",
    (req, res) => {

        try {

            const files =
                fs.readdirSync(
                    STORAGE_DIR
                );

            let totalBytes = 0;

            let fileCount = 0;


            for (
                const file of files
            ) {

                const filePath =
                    path.join(
                        STORAGE_DIR,
                        file
                    );

                const stats =
                    fs.statSync(
                        filePath
                    );


                if (
                    stats.isFile()
                ) {

                    fileCount++;

                    totalBytes +=
                        stats.size;
                }
            }


            res.status(200).json({

                success:
                    true,

                nodeId:
                    NODE_ID,

                activeRequests:
                    activeRequests,

                fileCount:
                    fileCount,

                usedBytes:
                    totalBytes
            });


        } catch (error) {

            console.error(
                "Storage stats error:",
                error
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Failed to get storage statistics"
            });
        }
    }
);


/*
 * =========================================
 * CHECKSUM
 * =========================================
 */

app.get(
    "/api/storage/checksum/:storageName",
    (req, res) => {

        try {

            const storageName =
                req.params.storageName;


            /*
             * Prevent path traversal.
             */

            if (
                storageName.includes("..") ||
                storageName.includes("/") ||
                storageName.includes("\\")
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Invalid storage name"
                });
            }


            const filePath =
                path.join(
                    STORAGE_DIR,
                    storageName
                );


            if (
                !fs.existsSync(
                    filePath
                )
            ) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "File not found on storage node"
                });
            }


            const hash =
                crypto.createHash(
                    "sha256"
                );


            const fileBuffer =
                fs.readFileSync(
                    filePath
                );


            hash.update(
                fileBuffer
            );


            const checksum =
                hash.digest(
                    "hex"
                );


            res.status(200).json({

                success:
                    true,

                nodeId:
                    NODE_ID,

                storageName:
                    storageName,

                checksum:
                    checksum
            });


        } catch (error) {

            console.error(
                "Checksum error:",
                error
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Failed to calculate checksum"
            });
        }
    }
);


/*
 * =========================================
 * Upload file
 * =========================================
 */

app.post(
    "/api/storage/upload",

    /*
     * =====================================
     * TEMPORARY FAILURE INJECTION
     * =====================================
     *
     * Only reject replica uploads.
     *
     * Primary uploads continue normally.
     *
     * Enable with:
     *
     * $env:FAIL_UPLOADS="true"
     */

    (req, res, next) => {

        if (
            process.env.FAIL_UPLOADS === "true" &&
            req.headers["x-storage-role"] === "replica"
        ) {

            console.log(
                `SIMULATED REPLICA UPLOAD FAILURE: ${NODE_ID}`
            );

            return res.status(503).json({

                success:
                    false,

                message:
                    "Simulated replica upload failure",

                nodeId:
                    NODE_ID
            });
        }

        next();
    },


    upload.single("file"),


    (req, res) => {

        try {

            if (
                !req.file
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "No file uploaded"
                });
            }


            res.status(201).json({

                success:
                    true,

                message:
                    "File stored successfully",

                nodeId:
                    NODE_ID,

                file: {

                    storageName:
                        req.file.filename,

                    originalName:
                        req.file.originalname,

                    size:
                        req.file.size,

                    contentType:
                        req.file.mimetype
                }
            });


        } catch (error) {

            console.error(
                "Storage upload error:",
                error
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Storage upload failed"
            });
        }
    }
);


/*
 * =========================================
 * Download file
 * =========================================
 */

app.get(
    "/api/storage/download/:storageName",
    (req, res) => {

        try {

            const storageName =
                req.params.storageName;


            if (
                storageName.includes("..") ||
                storageName.includes("/") ||
                storageName.includes("\\")
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Invalid storage name"
                });
            }


            const filePath =
                path.join(
                    STORAGE_DIR,
                    storageName
                );


            if (
                !fs.existsSync(
                    filePath
                )
            ) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "File not found on storage node"
                });
            }


            res.download(
                filePath
            );


        } catch (error) {

            console.error(
                "Storage download error:",
                error
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Storage download failed"
            });
        }
    }
);


/*
 * =========================================
 * Delete file
 * =========================================
 */

app.delete(
    "/api/storage/delete/:storageName",
    (req, res) => {

        try {

            const storageName =
                req.params.storageName;


            if (
                storageName.includes("..") ||
                storageName.includes("/") ||
                storageName.includes("\\")
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Invalid storage name"
                });
            }


            const filePath =
                path.join(
                    STORAGE_DIR,
                    storageName
                );


            if (
                !fs.existsSync(
                    filePath
                )
            ) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "File not found on storage node"
                });
            }


            fs.unlinkSync(
                filePath
            );


            res.status(200).json({

                success:
                    true,

                message:
                    "File deleted from storage node",

                nodeId:
                    NODE_ID,

                storageName:
                    storageName
            });


        } catch (error) {

            console.error(
                "Storage delete error:",
                error
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Storage delete failed"
            });
        }
    }
);


/*
 * =========================================
 * Register node in Firestore
 * =========================================
 *
 * IMPORTANT:
 *
 * Existing node status is NOT overwritten.
 *
 * This allows the coordinator to detect:
 *
 * OFFLINE → ONLINE
 *
 * and trigger automatic recovery.
 *
 * New nodes are created as ONLINE.
 *
 * Existing nodes keep their current
 * Firestore status until the coordinator's
 * health monitor updates it.
 */

const registerNode =
    async () => {

        const nodeRef =
            db
                .collection("storageNodes")
                .doc(NODE_ID);


        const existingNode =
            await nodeRef.get();


        /*
         * =====================================
         * New node
         * =====================================
         */

        if (
            !existingNode.exists
        ) {

            await nodeRef.set({

                nodeId:
                    NODE_ID,

                host:
                    "localhost",

                port:
                    PORT,

                status:
                    "ONLINE",

                storageDirectory:
                    STORAGE_DIR,

                createdAt:
                    new Date()
                        .toISOString(),

                updatedAt:
                    new Date()
                        .toISOString()

            });


            console.log(
                `Storage node registered: ${NODE_ID}`
            );

            return;
        }


        /*
         * =====================================
         * Existing node
         * =====================================
         *
         * DO NOT update status here.
         *
         * The coordinator must detect the
         * recovery transition.
         */

        await nodeRef.update({

            nodeId:
                NODE_ID,

            host:
                "localhost",

            port:
                PORT,

            storageDirectory:
                STORAGE_DIR,

            updatedAt:
                new Date()
                    .toISOString()

        });


        console.log(
            `Storage node reconnected: ${NODE_ID}`
        );
    };


/*
 * =========================================
 * Start storage node
 * =========================================
 */

app.listen(
    PORT,
    async () => {

        console.log(
            "================================="
        );

        console.log(
            "      DistributedFS Storage Node"
        );

        console.log(
            "================================="
        );

        console.log(
            `Node ID   : ${NODE_ID}`
        );

        console.log(
            `Port      : ${PORT}`
        );

        console.log(
            `Storage   : ${STORAGE_DIR}`
        );

        console.log(
            "================================="
        );


        try {

            await registerNode();

        } catch (error) {

            console.error(
                "Failed to register storage node:",
                error.message
            );
        }
    }
);