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


/*
 * =========================================
 * Load environment variables
 * =========================================
 */

dotenv.config();


/*
 * =========================================
 * Create Express application
 * =========================================
 */

const app =
    express();


/*
 * =========================================
 * Server configuration
 * =========================================
 *
 * Render provides PORT automatically.
 *
 * Local development:
 * PORT = 5000
 *
 * Render:
 * PORT = assigned automatically
 */

const PORT =
    process.env.PORT || 5000;

const SERVER_ID =
    process.env.SERVER_ID || "server-1";


/*
 * =========================================
 * Middleware
 * =========================================
 */

app.use(
    cors()
);

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);


/*
 * =========================================
 * Root endpoint
 * =========================================
 *
 * GET /
 *
 * Used to verify that the coordinator
 * is running.
 */

app.get(
    "/",
    (req, res) => {

        res.status(200).json({

            name:
                "DistributedFS",

            version:
                "1.0.0",

            status:
                "running",

            serverId:
                SERVER_ID

        });

    }
);


/*
 * =========================================
 * Coordinator health endpoint
 * =========================================
 *
 * GET /health
 *
 * Used by:
 * - Render health checks
 * - Monitoring
 * - Frontend
 * - Manual testing
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
 * POST
 * /api/files/:fileId/repair-replication
 *
 * Repairs a file whose replica is:
 * - missing
 * - corrupted
 * - invalid
 *
 * This uses the same replication service
 * used by the automatic replication monitor.
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


            /*
             * File does not exist.
             */

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
             * Only files stored on storage
             * nodes can be repaired.
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


            /*
             * Log repair operation.
             */

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
                `Replica: ${file.replicaNodeId || "None"}`
            );

            console.log(
                "================================="
            );


            /*
             * Run replication repair.
             */

            const result =
                await repairFileReplication(
                    file
                );


            /*
             * Fetch updated metadata.
             */

            const updatedFile =
                await getFileById(
                    fileId
                );


            /*
             * Return repair result.
             */

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
 *
 * GET
 * /api/files
 *
 * POST
 * /api/files/upload
 *
 * GET
 * /api/files/:id
 *
 * GET
 * /api/files/:id/download
 *
 * DELETE
 * /api/files/:id
 */

app.use(
    "/api/files",
    fileRoutes
);


/*
 * =========================================
 * Storage-node management routes
 * =========================================
 *
 * GET
 * /api/nodes
 *
 * GET
 * /api/nodes/healthy
 *
 * GET
 * /api/nodes/status
 *
 * POST
 * /api/nodes/repair
 */

app.use(
    "/api/nodes",
    nodeRoutes
);


/*
 * =========================================
 * Start coordinator
 * =========================================
 *
 * IMPORTANT FOR RENDER:
 *
 * The server must listen on:
 *
 *     0.0.0.0
 *
 * and use:
 *
 *     process.env.PORT
 *
 * instead of hardcoding a port.
 */

app.listen(
    PORT,
    "0.0.0.0",
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
            `Environment: ${process.env.NODE_ENV || "development"}`
        );

        console.log(
            "Host       : 0.0.0.0"
        );

        console.log(
            "================================="
        );


        /*
         * Start automatic replication
         * monitoring.
         *
         * Runs every 30 seconds.
         */

        startReplicationMonitor(
            30000
        );

    }
);