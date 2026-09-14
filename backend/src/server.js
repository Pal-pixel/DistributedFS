const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const fileRoutes =
    require("./routes/fileRoutes");

const nodeRoutes =
    require("./routes/nodeRoutes");

const {
    startReplicationMonitor
} = require("./services/replicationMonitor");

const {
    getFileById
} = require("./services/fileService");

const {
    repairFileReplication
} = require("./services/replicationService");

dotenv.config();

const app =
    express();

const PORT =
    process.env.PORT || 5000;

const SERVER_ID =
    process.env.SERVER_ID || "server-1";


app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


/*
 * =========================================
 * Root endpoint
 * =========================================
 */

app.get("/", (req, res) => {

    res.json({

        name:
            "DistributedFS",

        version:
            "1.0.0",

        status:
            "running",

        serverId:
            SERVER_ID
    });
});


/*
 * =========================================
 * Coordinator health
 * =========================================
 */

app.get(
    "/health",
    (req, res) => {

        res.status(200).json({

            status:
                "healthy",

            serverId:
                SERVER_ID,

            timestamp:
                new Date().toISOString()
        });
    }
);


/*
 * =========================================
 * MANUAL REPLICATION REPAIR
 * =========================================
 *
 * Used for repairing a file whose replica
 * is missing or corrupted.
 *
 * Example:
 *
 * POST
 * /api/files/:fileId/repair-replication
 *
 * This uses the same replication service
 * used by the automatic health monitor.
 *
 * It does NOT manually modify Firestore.
 */

app.post(
    "/api/files/:fileId/repair-replication",
    async (req, res) => {

        try {

            const fileId =
                req.params.fileId;


            /*
             * Get file metadata.
             */

            const file =
                await getFileById(
                    fileId
                );


            if (!file) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "File not found",

                    fileId:
                        fileId
                });
            }


            /*
             * Only storage-node files can
             * be repaired by this service.
             */

            if (
                file.storageProvider !==
                "STORAGE_NODE"
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "File is not stored on a storage node",

                    fileId:
                        fileId
                });
            }


            console.log(
                "================================="
            );

            console.log(
                "Manual Replication Repair"
            );

            console.log(
                `File ID: ${fileId}`
            );

            console.log(
                `File: ${file.fileName}`
            );

            console.log(
                `Primary: ${file.primaryNodeId}`
            );

            console.log(
                "================================="
            );


            /*
             * Use the existing replication
             * repair logic.
             *
             * For demo2.pdf:
             *
             * Primary = node-2
             * Replica = missing
             *
             * The service will verify the
             * primary checksum and recreate
             * the missing replica.
             */

            const result =
                await repairFileReplication(
                    file
                );


            /*
             * Get updated metadata after
             * repair.
             */

            const updatedFile =
                await getFileById(
                    fileId
                );


            res.status(200).json({

                success:
                    true,

                message:
                    result.repaired
                        ? "Replication repair completed"
                        : "No replication repair was required",

                fileId:
                    fileId,

                result:
                    result,

                file:
                    updatedFile
            });


        } catch (error) {

            console.error(
                "Manual replication repair failed:",
                error
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Replication repair failed",

                error:
                    error.message
            });
        }
    }
);


/*
 * =========================================
 * File routes
 * =========================================
 */

app.use(
    "/api/files",
    fileRoutes
);


/*
 * =========================================
 * Storage-node management routes
 * =========================================
 */

app.use(
    "/api/nodes",
    nodeRoutes
);


/*
 * =========================================
 * Start coordinator
 * =========================================
 */

app.listen(
    PORT,
    () => {

        console.log(
            "================================="
        );

        console.log(
            "       DistributedFS Backend"
        );

        console.log(
            "================================="
        );

        console.log(
            `Server ID  : ${SERVER_ID}`
        );

        console.log(
            `Port       : ${PORT}`
        );

        console.log(
            `Environment: ${process.env.NODE_ENV}`
        );

        console.log(
            "================================="
        );


        startReplicationMonitor(
            30000
        );
    }
);