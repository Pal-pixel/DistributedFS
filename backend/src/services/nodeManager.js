const { db } =
    require("../config/firebase");


/**
 * =========================================
 * GET ALL REGISTERED STORAGE NODES
 * =========================================
 */
const getStorageNodes = async () => {

    const snapshot =
        await db
            .collection("storageNodes")
            .get();

    const nodes = [];

    snapshot.forEach((doc) => {

        nodes.push({
            id: doc.id,
            ...doc.data()
        });

    });

    return nodes;
};


/**
 * =========================================
 * CHECK NODE HEALTH
 * =========================================
 *
 * Returns true only when:
 *
 * 1. Node responds
 * 2. HTTP status is successful
 * 3. Node reports "healthy"
 * 4. Returned nodeId matches expected node
 *
 * A timeout prevents a dead/hanging node
 * from blocking the health monitor.
 */
const checkNodeHealth = async (node) => {

    if (
        !node ||
        !node.host ||
        !node.port ||
        !node.nodeId
    ) {

        return false;
    }


    const controller =
        new AbortController();

    const timeout =
        setTimeout(
            () => controller.abort(),
            5000
        );


    try {

        const response =
            await fetch(
                `http://${node.host}:${node.port}/health`,
                {
                    signal:
                        controller.signal
                }
            );


        if (!response.ok) {

            return false;
        }


        const data =
            await response.json();


        return (
            data.status === "healthy" &&
            data.nodeId === node.nodeId
        );

    } catch (error) {

        return false;

    } finally {

        clearTimeout(timeout);
    }
};


/**
 * =========================================
 * GET HEALTHY NODES
 * =========================================
 *
 * Performs health checks concurrently.
 */
const getHealthyNodes = async () => {

    const nodes =
        await getStorageNodes();


    const results =
        await Promise.all(

            nodes.map(
                async (node) => {

                    const healthy =
                        await checkNodeHealth(
                            node
                        );


                    return {

                        ...node,

                        healthy
                    };

                }
            )
        );


    return results.filter(
        node =>
            node.healthy
    );
};


/**
 * =========================================
 * CHECK ALL NODE STATUSES
 * =========================================
 *
 * Detects:
 *
 * ONLINE  → OFFLINE
 * OFFLINE → ONLINE
 *
 * State transition is detected BEFORE
 * Firestore is updated.
 */
const checkAllNodeStatuses = async () => {

    const nodes =
        await getStorageNodes();


    /*
     * Check all nodes concurrently.
     */
    const healthResults =
        await Promise.all(

            nodes.map(
                async (node) => {

                    const healthy =
                        await checkNodeHealth(
                            node
                        );


                    return {

                        node,

                        healthy
                    };

                }
            )
        );


    const results = [];

    const recoveredNodes = [];

    const offlineNodes = [];


    /*
     * Process each health result.
     */
    for (
        const {
            node,
            healthy
        }
        of healthResults
    ) {

        /*
         * Current actual state.
         */
        const currentStatus =
            healthy
                ? "ONLINE"
                : "OFFLINE";


        /*
         * Previous Firestore state.
         */
        const previousStatus =
            node.status ||
            currentStatus;


        /*
         * Detect recovery.
         */
        const recovered =
            previousStatus === "OFFLINE" &&
            currentStatus === "ONLINE";


        /*
         * Detect failure.
         */
        const wentOffline =
            previousStatus === "ONLINE" &&
            currentStatus === "OFFLINE";


        /*
         * Log recovery.
         */
        if (recovered) {

            console.log(
                `Node recovered: ` +
                `${node.nodeId} ` +
                `OFFLINE → ONLINE`
            );
        }


        /*
         * Log failure.
         */
        if (wentOffline) {

            console.log(
                `Node went offline: ` +
                `${node.nodeId} ` +
                `ONLINE → OFFLINE`
            );
        }


        /*
         * Update Firestore.
         */
        await db
            .collection("storageNodes")
            .doc(node.id)
            .update({

                status:
                    currentStatus,

                lastCheckedAt:
                    new Date().toISOString()

            });


        /*
         * Build result.
         */
        const result = {

            ...node,

            healthy,

            status:
                currentStatus,

            previousStatus,

            recovered,

            wentOffline

        };


        results.push(result);


        /*
         * Store recovered nodes.
         */
        if (recovered) {

            recoveredNodes.push(
                result
            );
        }


        /*
         * Store failed nodes.
         */
        if (wentOffline) {

            offlineNodes.push(
                result
            );
        }

    }


    return {

        nodes:
            results,

        recoveredNodes,

        offlineNodes

    };
};


/**
 * =========================================
 * EXPORTS
 * =========================================
 */
module.exports = {

    getStorageNodes,

    checkNodeHealth,

    getHealthyNodes,

    checkAllNodeStatuses

};