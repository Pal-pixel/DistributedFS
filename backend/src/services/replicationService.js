const axios = require("axios");


/*
 * =========================================
 * Node Manager
 * =========================================
 */

const {
    getHealthyNodes,
    getStorageNodes
} = require("./nodeManager");


/*
 * =========================================
 * Storage Service
 * =========================================
 */

const {
    selectStorageNode,
    replicateFileToNode
} = require("./storageService");


/*
 * =========================================
 * File Service
 * =========================================
 */

const {
    getAllFiles,
    updateFileMetadata
} = require("./fileService");


/*
 * =========================================
 * Get checksum from storage node
 * =========================================
 */

const getNodeChecksum = async (
    node,
    storageName
) => {

    if (
        !node ||
        !node.host ||
        !node.port ||
        !storageName
    ) {

        throw new Error(
            "Invalid node or storage information"
        );
    }


    const response =
        await axios.get(

            `http://${node.host}:${node.port}` +
            `/api/storage/checksum/` +
            `${encodeURIComponent(storageName)}`,

            {
                timeout:
                    5000
            }
        );


    return response.data.checksum;
};


/*
 * =========================================
 * Check whether a copy is healthy
 * =========================================
 */

const checkCopy = async (
    copy,
    expectedChecksum
) => {

    /*
     * Missing copy metadata.
     */

    if (
        !copy ||
        !copy.nodeId ||
        !copy.host ||
        !copy.port ||
        !copy.storageName
    ) {

        return {

            available:
                false,

            checksum:
                null,

            valid:
                false,

            error:
                "Copy metadata is missing"
        };
    }


    try {

        const checksum =
            await getNodeChecksum(
                copy,
                copy.storageName
            );


        return {

            available:
                true,

            checksum:
                checksum,

            valid:
                checksum ===
                expectedChecksum
        };


    } catch (error) {

        return {

            available:
                false,

            checksum:
                null,

            valid:
                false,

            error:
                error.message
        };
    }
};


/*
 * =========================================
 * Get Firestore status of a node
 * =========================================
 */

const getNodeStatus = async (
    nodeId
) => {

    if (!nodeId) {

        return null;
    }


    const nodes =
        await getStorageNodes();


    const node =
        nodes.find(
            item =>
                item.nodeId ===
                nodeId
        );


    if (!node) {

        return null;
    }


    return (
        node.status ||
        null
    );
};


/*
 * =========================================
 * Repair corrupted / missing replica
 * =========================================
 */

const repairReplica = async (
    file,
    primary
) => {

    console.log(
        "================================="
    );

    console.log(
        `Replica repair: ${file.fileId}`
    );

    console.log(
        `Source primary: ${primary.nodeId}`
    );

    console.log(
        "================================="
    );


    /*
     * Select a healthy target node.
     */

    let target =
        await selectStorageNode();


    /*
     * Never put the replica on the
     * same node as the primary.
     */

    if (
        target.nodeId ===
        primary.nodeId
    ) {

        const healthyNodes =
            await getHealthyNodes();


        const alternative =
            healthyNodes.find(
                node =>
                    node.nodeId !==
                    primary.nodeId
            );


        if (!alternative) {

            throw new Error(
                "No healthy node available for replica repair"
            );
        }


        target =
            alternative;
    }


    /*
     * Copy the primary to the target.
     */

    console.log(
        `Replicating ${file.fileId}: ` +
        `${primary.nodeId} → ${target.nodeId}`
    );


    const newStorage =
        await replicateFileToNode(
            primary,
            primary.storageName,
            target
        );


    /*
     * Verify checksum of the new copy.
     */

    const newChecksum =
        await getNodeChecksum(
            target,
            newStorage.storageName
        );


    if (
        newChecksum !==
        file.checksum
    ) {

        throw new Error(
            "New replica checksum does not match expected checksum"
        );
    }


    /*
     * Update Firestore.
     *
     * IMPORTANT:
     * Also write primaryStorageName.
     *
     * This upgrades older metadata that
     * only had "storageName".
     */

    await updateFileMetadata(
        file.fileId,
        {

            primaryNodeId:
                primary.nodeId,

            primaryNodeHost:
                primary.host,

            primaryNodePort:
                primary.port,

            primaryStorageName:
                primary.storageName,

            replicaNodeId:
                target.nodeId,

            replicaNodeHost:
                target.host,

            replicaNodePort:
                target.port,

            replicaStorageName:
                newStorage.storageName,

            replicationFactor:
                2
        }
    );


    console.log(
        `Replica repaired: ${target.nodeId}`
    );


    return {

        repaired:
            true,

        repairedNode:
            target.nodeId,

        newStorageName:
            newStorage.storageName
    };
};


/*
 * =========================================
 * Repair corrupted / missing primary
 * =========================================
 */

const repairPrimary = async (
    file,
    replica
) => {

    console.log(
        "================================="
    );

    console.log(
        `Primary repair: ${file.fileId}`
    );

    console.log(
        `Source replica: ${replica.nodeId}`
    );

    console.log(
        "================================="
    );


    /*
     * Select a healthy target node.
     */

    let target =
        await selectStorageNode();


    /*
     * Never use the existing replica
     * as the new primary destination.
     */

    if (
        target.nodeId ===
        replica.nodeId
    ) {

        const healthyNodes =
            await getHealthyNodes();


        const alternative =
            healthyNodes.find(
                node =>
                    node.nodeId !==
                    replica.nodeId
            );


        if (!alternative) {

            throw new Error(
                "No healthy node available for primary repair"
            );
        }


        target =
            alternative;
    }


    /*
     * Copy the healthy replica to
     * the new target.
     */

    const newStorage =
        await replicateFileToNode(
            replica,
            replica.storageName,
            target
        );


    /*
     * Verify checksum.
     */

    const newChecksum =
        await getNodeChecksum(
            target,
            newStorage.storageName
        );


    if (
        newChecksum !==
        file.checksum
    ) {

        throw new Error(
            "New primary checksum does not match expected checksum"
        );
    }


    /*
     * The healthy replica becomes
     * the new primary.
     *
     * The newly created copy becomes
     * the replica.
     */

    await updateFileMetadata(
        file.fileId,
        {

            primaryNodeId:
                replica.nodeId,

            primaryNodeHost:
                replica.host,

            primaryNodePort:
                replica.port,

            primaryStorageName:
                replica.storageName,

            replicaNodeId:
                target.nodeId,

            replicaNodeHost:
                target.host,

            replicaNodePort:
                target.port,

            replicaStorageName:
                newStorage.storageName,

            replicationFactor:
                2
        }
    );


    console.log(
        `Primary repaired. ` +
        `New primary: ${replica.nodeId} | ` +
        `New replica: ${target.nodeId}`
    );


    return {

        repaired:
            true,

        newPrimaryNode:
            replica.nodeId,

        newReplicaNode:
            target.nodeId
    };
};


/*
 * =========================================
 * Repair one file's replication
 * =========================================
 */

const repairFileReplication = async (
    file
) => {

    /*
     * =====================================
     * Validate storage provider
     * =====================================
     */

    if (
        file.storageProvider !==
        "STORAGE_NODE"
    ) {

        return {

            repaired:
                false,

            reason:
                "File does not use storage-node storage"
        };
    }


    /*
     * =====================================
     * Determine replica state
     * =====================================
     *
     * Older files may not have:
     *
     * replicationFactor
     *
     * or replica metadata.
     *
     * Such files are treated as needing
     * replication.
     */

    const hasReplica =
        Boolean(
            file.replicaNodeId &&
            file.replicaNodeHost &&
            file.replicaNodePort &&
            file.replicaStorageName
        );


    const needsReplication =
        file.replicationFactor ===
            2 ||
        !hasReplica;


    if (!needsReplication) {

        return {

            repaired:
                false,

            reason:
                "File does not require replication repair"
        };
    }


    /*
     * =====================================
     * Build primary information
     * =====================================
     *
     * New metadata:
     *     primaryStorageName
     *
     * Older metadata:
     *     storageName
     *
     * Support both.
     */

    const primary = {

        nodeId:
            file.primaryNodeId,

        host:
            file.primaryNodeHost,

        port:
            file.primaryNodePort,

        storageName:
            file.primaryStorageName ||
            file.storageName
    };


    /*
     * A file must have a primary before
     * we can repair replication.
     */

    if (
        !primary.nodeId ||
        !primary.host ||
        !primary.port ||
        !primary.storageName
    ) {

        return {

            repaired:
                false,

            reason:
                "Primary metadata is incomplete"
        };
    }


    /*
     * =====================================
     * Build replica information
     * =====================================
     */

    const replica =
        hasReplica
            ? {

                nodeId:
                    file.replicaNodeId,

                host:
                    file.replicaNodeHost,

                port:
                    file.replicaNodePort,

                storageName:
                    file.replicaStorageName

            }
            : null;


    /*
     * =====================================
     * Check node status
     * =====================================
     *
     * This prevents the automatic repair
     * monitor from replacing copies merely
     * because a node is temporarily offline.
     */

    const primaryStatus =
        await getNodeStatus(
            primary.nodeId
        );


    let replicaStatus =
        null;


    if (replica) {

        replicaStatus =
            await getNodeStatus(
                replica.nodeId
            );
    }


    /*
     * =====================================
     * Primary offline
     * =====================================
     *
     * Do not move or replace the file.
     *
     * Wait for node recovery.
     */

    if (
        primaryStatus ===
        "OFFLINE"
    ) {

        return {

            repaired:
                false,

            reason:
                "Primary node offline; waiting for node recovery"
        };
    }


    /*
     * =====================================
     * Replica offline
     * =====================================
     *
     * Preserve metadata and wait for
     * the node to recover.
     */

    if (
        replica &&
        replicaStatus ===
        "OFFLINE"
    ) {

        return {

            repaired:
                false,

            reason:
                "Replica node offline; waiting for node recovery"
        };
    }


    /*
     * =====================================
     * Check primary copy
     * =====================================
     */

    const primaryCheck =
        await checkCopy(
            primary,
            file.checksum
        );


    /*
     * =====================================
     * Check replica copy
     * =====================================
     */

    const replicaCheck =
        replica
            ? await checkCopy(
                replica,
                file.checksum
            )
            : {

                available:
                    false,

                checksum:
                    null,

                valid:
                    false,

                error:
                    "Replica metadata is missing"
            };


    /*
     * =====================================
     * Both copies are healthy
     * =====================================
     */

    if (
        primaryCheck.available &&
        primaryCheck.valid &&

        replicaCheck.available &&
        replicaCheck.valid
    ) {

        /*
         * Normalize older metadata.
         */

        const updates = {};


        if (
            file.replicationFactor !==
            2
        ) {

            updates.replicationFactor =
                2;
        }


        if (
            !file.primaryStorageName
        ) {

            updates.primaryStorageName =
                primary.storageName;
        }


        if (
            Object.keys(updates).length >
            0
        ) {

            await updateFileMetadata(
                file.fileId,
                updates
            );
        }


        return {

            repaired:
                false,

            reason:
                "Replication healthy",

            primaryChecksum:
                primaryCheck.checksum,

            replicaChecksum:
                replicaCheck.checksum
        };
    }


    /*
     * =====================================
     * Primary is healthy
     * =====================================
     *
     * Important case for demo2.pdf:
     *
     * Primary:
     *     node-2
     *
     * Replica:
     *     missing
     *
     * Create a new replica.
     */

    if (
        primaryCheck.available &&
        primaryCheck.valid
    ) {

        console.log(
            `Primary healthy for ${file.fileId}`
        );


        const result =
            await repairReplica(
                file,
                primary
            );


        return {

            repaired:
                true,

            reason:
                replicaCheck.available
                    ? "Replica checksum mismatch repaired"
                    : "Missing replica repaired",

            sourceNode:
                primary.nodeId,

            newReplicaNode:
                result.repairedNode,

            newStorageName:
                result.newStorageName
        };
    }


    /*
     * =====================================
     * Replica is healthy
     * =====================================
     *
     * If primary is corrupted or missing,
     * use the replica as the source.
     */

    if (
        replica &&
        replicaCheck.available &&
        replicaCheck.valid
    ) {

        const result =
            await repairPrimary(
                file,
                replica
            );


        return {

            repaired:
                true,

            reason:
                primaryCheck.available
                    ? "Primary checksum mismatch repaired"
                    : "Missing primary repaired",

            sourceNode:
                replica.nodeId,

            newPrimaryNode:
                result.newPrimaryNode,

            newReplicaNode:
                result.newReplicaNode
        };
    }


    /*
     * =====================================
     * Neither copy is trustworthy
     * =====================================
     */

    return {

        repaired:
            false,

        reason:
            "Both primary and replica failed checksum verification"
    };
};


/*
 * =========================================
 * Recover a storage node
 * =========================================
 *
 * Called when:
 *
 * OFFLINE → ONLINE
 *
 * The recovered node is restored to the
 * role it had before failure.
 * =========================================
 */

const recoverNode = async (
    recoveredNode
) => {

    console.log(
        "================================="
    );

    console.log(
        `Node Recovery: ${recoveredNode.nodeId}`
    );

    console.log(
        "================================="
    );


    const files =
        await getAllFiles();


    const recoveryResults = [];


    /*
     * Only properly replicated files can
     * participate in node recovery.
     */

    const replicatedFiles =
        files.filter(
            file =>
                file.storageProvider ===
                    "STORAGE_NODE" &&

                file.replicationFactor ===
                    2
        );


    for (
        const file of replicatedFiles
    ) {

        /*
         * Determine the original role.
         */

        const wasPrimary =
            file.primaryNodeId ===
            recoveredNode.nodeId;


        const wasReplica =
            file.replicaNodeId ===
            recoveredNode.nodeId;


        /*
         * This recovered node did not
         * previously hold this file.
         */

        if (
            !wasPrimary &&
            !wasReplica
        ) {

            continue;
        }


        console.log(
            `Checking recovery for ${file.fileId}`
        );


        /*
         * =====================================
         * Expected copy on recovered node
         * =====================================
         *
         * IMPORTANT:
         *
         * If recovered node was the primary,
         * use primaryStorageName.
         *
         * If recovered node was the replica,
         * use replicaStorageName.
         */

        const recoveredStorageName =
            wasPrimary
                ? (
                    file.primaryStorageName ||
                    file.storageName
                )
                : file.replicaStorageName;


        /*
         * If metadata is incomplete, recovery
         * cannot safely reconstruct the
         * original copy.
         */

        if (!recoveredStorageName) {

            recoveryResults.push({

                fileId:
                    file.fileId,

                recovered:
                    false,

                reason:
                    "Recovered node storage metadata is missing"
            });

            continue;
        }


        const recoveredCopy = {

            nodeId:
                recoveredNode.nodeId,

            host:
                recoveredNode.host,

            port:
                recoveredNode.port,

            storageName:
                recoveredStorageName
        };


        /*
         * =====================================
         * Check whether copy already exists
         * =====================================
         */

        const existingCopy =
            await checkCopy(
                recoveredCopy,
                file.checksum
            );


        if (
            existingCopy.available &&
            existingCopy.valid
        ) {

            console.log(
                `Recovery not required: ${file.fileId}`
            );


            recoveryResults.push({

                fileId:
                    file.fileId,

                recovered:
                    false,

                reason:
                    "Valid copy already exists"
            });


            continue;
        }


        /*
         * =====================================
         * Determine healthy source
         * =====================================
         */

        const sourceNode =
            wasPrimary
                ? {

                    nodeId:
                        file.replicaNodeId,

                    host:
                        file.replicaNodeHost,

                    port:
                        file.replicaNodePort,

                    storageName:
                        file.replicaStorageName

                }
                : {

                    nodeId:
                        file.primaryNodeId,

                    host:
                        file.primaryNodeHost,

                    port:
                        file.primaryNodePort,

                    storageName:
                        file.primaryStorageName ||
                        file.storageName
                };


        /*
         * Validate source metadata.
         */

        if (
            !sourceNode.nodeId ||
            !sourceNode.host ||
            !sourceNode.port ||
            !sourceNode.storageName
        ) {

            console.error(
                `Cannot recover ${file.fileId}: ` +
                `healthy source metadata unavailable`
            );


            recoveryResults.push({

                fileId:
                    file.fileId,

                recovered:
                    false,

                reason:
                    "Healthy source copy metadata unavailable"
            });


            continue;
        }


        /*
         * =====================================
         * Verify source checksum
         * =====================================
         */

        const sourceCheck =
            await checkCopy(
                sourceNode,
                file.checksum
            );


        if (
            !sourceCheck.available ||
            !sourceCheck.valid
        ) {

            console.error(
                `Cannot recover ${file.fileId}: ` +
                `healthy source unavailable`
            );


            recoveryResults.push({

                fileId:
                    file.fileId,

                recovered:
                    false,

                reason:
                    "Healthy source copy unavailable"
            });


            continue;
        }


        console.log(
            `Recovering ${file.fileId}: ` +
            `${sourceNode.nodeId} → ` +
            `${recoveredNode.nodeId}`
        );


        try {

            /*
             * =================================
             * Copy source to recovered node
             * =================================
             */

            const newStorage =
                await replicateFileToNode(
                    sourceNode,
                    sourceNode.storageName,
                    recoveredNode
                );


            /*
             * =================================
             * Verify recovered checksum
             * =================================
             */

            const recoveredChecksum =
                await getNodeChecksum(
                    recoveredNode,
                    newStorage.storageName
                );


            if (
                recoveredChecksum !==
                file.checksum
            ) {

                throw new Error(
                    "Recovered file checksum does not match"
                );
            }


            /*
             * =================================
             * Restore original role
             * =================================
             */

            if (wasPrimary) {

                await updateFileMetadata(
                    file.fileId,
                    {

                        primaryNodeId:
                            recoveredNode.nodeId,

                        primaryNodeHost:
                            recoveredNode.host,

                        primaryNodePort:
                            recoveredNode.port,

                        primaryStorageName:
                            newStorage.storageName,

                        replicationFactor:
                            2
                    }
                );

            } else {

                await updateFileMetadata(
                    file.fileId,
                    {

                        replicaNodeId:
                            recoveredNode.nodeId,

                        replicaNodeHost:
                            recoveredNode.host,

                        replicaNodePort:
                            recoveredNode.port,

                        replicaStorageName:
                            newStorage.storageName,

                        replicationFactor:
                            2
                    }
                );
            }


            console.log(
                `Recovery successful: ${file.fileId}`
            );


            recoveryResults.push({

                fileId:
                    file.fileId,

                recovered:
                    true,

                role:
                    wasPrimary
                        ? "primary"
                        : "replica",

                sourceNode:
                    sourceNode.nodeId,

                recoveredNode:
                    recoveredNode.nodeId,

                storageName:
                    newStorage.storageName
            });


        } catch (error) {

            console.error(
                `Recovery failed for ${file.fileId}:`,
                error.message
            );


            recoveryResults.push({

                fileId:
                    file.fileId,

                recovered:
                    false,

                reason:
                    error.message
            });
        }
    }


    console.log(
        "================================="
    );

    console.log(
        `Node recovery completed: ` +
        `${recoveredNode.nodeId}`
    );

    console.log(
        `Files checked: ` +
        `${recoveryResults.length}`
    );

    console.log(
        `Files recovered: ` +
        `${recoveryResults.filter(
            result =>
                result.recovered
        ).length}`
    );

    console.log(
        "================================="
    );


    return recoveryResults;
};


/*
 * =========================================
 * Repair all files
 * =========================================
 */

const repairAllFiles = async () => {

    const files =
        await getAllFiles();


    const results = [];


    for (
        const file of files
    ) {

        try {

            const result =
                await repairFileReplication(
                    file
                );


            results.push({

                fileId:
                    file.fileId,

                ...result
            });


        } catch (error) {

            console.error(
                `Replication repair failed for ${file.fileId}:`,
                error.message
            );


            results.push({

                fileId:
                    file.fileId,

                repaired:
                    false,

                reason:
                    error.message
            });
        }
    }


    return results;
};


/*
 * =========================================
 * Exports
 * =========================================
 */

module.exports = {

    repairFileReplication,

    repairAllFiles,

    recoverNode
};