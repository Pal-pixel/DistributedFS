const {
    checkAllNodeStatuses
} = require("./nodeManager");

const {
    repairAllFiles,
    recoverNode
} = require("./replicationService");


let repairRunning = false;

let monitorInterval = null;


/**
 * =========================================
 * RUN ONE REPLICATION HEALTH CYCLE
 * =========================================
 */
const runReplicationRepair = async () => {

    /*
     * Prevent overlapping repair cycles.
     */
    if (repairRunning) {

        console.log(
            "Replication repair already running..."
        );

        return;
    }


    repairRunning = true;


    try {

        console.log(
            "================================="
        );

        console.log(
            "DistributedFS Health Monitor"
        );

        console.log(
            new Date().toISOString()
        );

        console.log(
            "================================="
        );


        /*
         * =====================================
         * STEP 1
         * Check storage-node status.
         * =====================================
         */

        const statusResults =
            await checkAllNodeStatuses();


        console.log(
            `Storage nodes checked: ` +
            `${statusResults.nodes.length}`
        );


        /*
         * =====================================
         * STEP 2
         * Recover nodes that came back online.
         * =====================================
         */

        const recoveredNodes =
            statusResults.recoveredNodes;


        if (
            recoveredNodes.length > 0
        ) {

            console.log(
                "================================="
            );

            console.log(
                "Storage Node Recovery"
            );

            console.log(
                "================================="
            );


            for (
                const node of recoveredNodes
            ) {

                try {

                    console.log(
                        `Starting recovery for ` +
                        `${node.nodeId}`
                    );


                    const recoveryResults =
                        await recoverNode(
                            node
                        );


                    const recoveredFiles =
                        recoveryResults.filter(
                            result =>
                                result.recovered === true
                        );


                    console.log(
                        `Recovery completed for ` +
                        `${node.nodeId}`
                    );


                    console.log(
                        `Files recovered: ` +
                        `${recoveredFiles.length}`
                    );


                } catch (error) {

                    console.error(
                        `Node recovery failed for ` +
                        `${node.nodeId}:`,
                        error.message
                    );

                }

            }

        } else {

            console.log(
                "No storage nodes recovered."
            );

        }


        /*
         * =====================================
         * STEP 3
         * Verify normal replication.
         * =====================================
         */

        const results =
            await repairAllFiles();


        const repaired =
            results.filter(
                result =>
                    result.repaired === true
            );


        console.log(
            `Checked ${results.length} files`
        );


        console.log(
            `Repaired ${repaired.length} files`
        );


        repaired.forEach(
            result => {

                console.log(
                    `Repaired ${result.fileId}: ` +
                    `${result.sourceNode || "unknown"} → ` +
                    `${
                        result.newReplicaNode ||
                        result.newPrimaryNode ||
                        "unknown"
                    }`
                );

            }
        );


    } catch (error) {

        console.error(
            "Automatic replication monitor failed:",
            error.message
        );

    } finally {

        repairRunning = false;
    }
};


/**
 * =========================================
 * START REPLICATION MONITOR
 * =========================================
 *
 * Default interval = 30 seconds.
 */
const startReplicationMonitor = (
    intervalMs = 30000
) => {

    /*
     * Prevent starting the monitor twice.
     */
    if (monitorInterval) {

        console.log(
            "Replication monitor is already running."
        );

        return;
    }


    console.log(
        `Replication monitor started. ` +
        `Interval: ${intervalMs / 1000}s`
    );


    /*
     * Run immediately.
     */
    runReplicationRepair();


    /*
     * Run periodically.
     */
    monitorInterval =
        setInterval(
            runReplicationRepair,
            intervalMs
        );
};


/**
 * =========================================
 * STOP REPLICATION MONITOR
 * =========================================
 */
const stopReplicationMonitor = () => {

    if (!monitorInterval) {

        return;
    }


    clearInterval(
        monitorInterval
    );


    monitorInterval =
        null;


    console.log(
        "Replication monitor stopped."
    );
};


/**
 * =========================================
 * EXPORTS
 * =========================================
 */
module.exports = {

    runReplicationRepair,

    startReplicationMonitor,

    stopReplicationMonitor

};