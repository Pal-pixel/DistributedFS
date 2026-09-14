const express = require("express");

const {
    getStorageNodes,
    getHealthyNodes,
    checkAllNodeStatuses
} = require("../services/nodeManager");

const {
    repairAllFiles
} = require("../services/replicationService");

const router = express.Router();


/*
 * =========================================
 * GET ALL STORAGE NODES
 * =========================================
 *
 * Returns all nodes registered in Firestore.
 */
router.get(
    "/",
    async (req, res) => {

        try {

            const nodes =
                await getStorageNodes();

            res.status(200).json({

                success: true,

                count:
                    nodes.length,

                nodes:
                    nodes
            });

        } catch (error) {

            console.error(
                "Failed to get storage nodes:",
                error.message
            );

            res.status(500).json({

                success: false,

                message:
                    "Failed to retrieve storage nodes"
            });
        }
    }
);


/*
 * =========================================
 * GET HEALTHY STORAGE NODES
 * =========================================
 *
 * Checks which storage nodes are currently
 * reachable and healthy.
 */
router.get(
    "/healthy",
    async (req, res) => {

        try {

            const nodes =
                await getHealthyNodes();

            res.status(200).json({

                success: true,

                count:
                    nodes.length,

                nodes:
                    nodes
            });

        } catch (error) {

            console.error(
                "Failed to check storage nodes:",
                error.message
            );

            res.status(500).json({

                success: false,

                message:
                    "Failed to check storage nodes"
            });
        }
    }
);


/*
 * =========================================
 * CHECK ALL NODE STATUSES
 * =========================================
 *
 * Detects:
 *
 * ONLINE  → OFFLINE
 * OFFLINE → ONLINE
 *
 * Also updates Firestore status.
 */
router.get(
    "/status",
    async (req, res) => {

        try {

            const result =
                await checkAllNodeStatuses();

            res.status(200).json({

                success: true,

                count:
                    result.nodes.length,

                nodes:
                    result.nodes,

                recoveredNodes:
                    result.recoveredNodes,

                offlineNodes:
                    result.offlineNodes
            });

        } catch (error) {

            console.error(
                "Failed to check node statuses:",
                error.message
            );

            res.status(500).json({

                success: false,

                message:
                    "Failed to check node statuses",

                error:
                    error.message
            });
        }
    }
);


/*
 * =========================================
 * MANUAL REPLICATION REPAIR
 * =========================================
 *
 * Checks all files and repairs:
 *
 * - Missing replicas
 * - Offline replicas
 * - Corrupted replicas
 * - Offline primaries
 */
router.post(
    "/repair",
    async (req, res) => {

        try {

            const results =
                await repairAllFiles();

            const repaired =
                results.filter(
                    result =>
                        result.repaired === true
                );

            res.status(200).json({

                success: true,

                message:
                    "Replication repair completed",

                checked:
                    results.length,

                repaired:
                    repaired.length,

                results:
                    results
            });

        } catch (error) {

            console.error(
                "Replication repair error:",
                error.message
            );

            res.status(500).json({

                success: false,

                message:
                    "Replication repair failed",

                error:
                    error.message
            });
        }
    }
);


module.exports = router;