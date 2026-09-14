const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

const {
    getHealthyNodes
} = require("./nodeManager");


/*
 * =========================================
 * Get load information for storage nodes
 * =========================================
 */

const getScoredStorageNodes = async () => {

    const nodes =
        await getHealthyNodes();


    if (
        nodes.length === 0
    ) {

        throw new Error(
            "No healthy storage nodes available"
        );
    }


    /*
     * Get current load from every healthy
     * storage node.
     */

    const nodeStats =
        await Promise.all(

            nodes.map(
                async (node) => {

                    try {

                        const response =
                            await axios.get(

                                `http://${node.host}:${node.port}` +
                                `/api/storage/stats`,

                                {
                                    timeout:
                                        3000
                                }
                            );


                        return {

                            ...node,

                            stats:
                                response.data

                        };


                    } catch (error) {

                        console.error(
                            `Failed to get load for ${node.nodeId}:`,
                            error.message
                        );


                        return null;
                    }
                }
            )
        );


    const availableNodes =
        nodeStats.filter(
            node =>
                node !== null
        );


    if (
        availableNodes.length === 0
    ) {

        throw new Error(
            "Unable to retrieve storage node load"
        );
    }


    /*
     * =====================================
     * Calculate load score
     * =====================================
     *
     * Lower score = better node.
     *
     * Active requests:
     *     70%
     *
     * Storage usage:
     *     30%
     */

    const scoredNodes =
        availableNodes.map(
            node => {

                const activeRequests =
                    node.stats.activeRequests ||
                    0;


                const usedBytes =
                    node.stats.usedBytes ||
                    0;


                const usedMB =
                    usedBytes /
                    (1024 * 1024);


                const loadScore =
                    (activeRequests * 0.7) +
                    (usedMB * 0.3);


                return {

                    ...node,

                    loadScore
                };
            }
        );


    /*
     * Lowest load first.
     */

    scoredNodes.sort(
        (a, b) =>
            a.loadScore -
            b.loadScore
    );


    return scoredNodes;
};


/*
 * =========================================
 * Select one storage node
 * =========================================
 */

const selectStorageNode = async () => {

    const scoredNodes =
        await getScoredStorageNodes();


    const selectedNode =
        scoredNodes[0];


    console.log(
        "================================="
    );

    console.log(
        "Storage Node Load Balancing"
    );


    scoredNodes.forEach(
        node => {

            console.log(

                `${node.nodeId} | ` +

                `Active: ` +
                `${node.stats.activeRequests} | ` +

                `Files: ` +
                `${node.stats.fileCount} | ` +

                `Used: ` +
                `${node.stats.usedBytes} bytes | ` +

                `Score: ` +
                `${node.loadScore.toFixed(2)}`
            );
        }
    );


    console.log(
        `Selected node: ${selectedNode.nodeId}`
    );

    console.log(
        "================================="
    );


    return selectedNode;
};


/*
 * =========================================
 * Select multiple storage nodes
 * =========================================
 *
 * First node:
 *     PRIMARY
 *
 * Remaining nodes:
 *     REPLICAS
 *
 * All selected nodes are different.
 */

const selectStorageNodes = async (
    count = 2
) => {

    const scoredNodes =
        await getScoredStorageNodes();


    if (
        scoredNodes.length <
        count
    ) {

        throw new Error(

            `Not enough healthy storage nodes. ` +
            `Required: ${count}, ` +
            `Available: ${scoredNodes.length}`
        );
    }


    const selectedNodes =
        scoredNodes.slice(
            0,
            count
        );


    console.log(
        "================================="
    );

    console.log(
        "Replication Node Selection"
    );


    selectedNodes.forEach(
        (node, index) => {

            console.log(

                `${index === 0
                    ? "PRIMARY"
                    : "REPLICA"} → ` +

                `${node.nodeId} | ` +

                `Score: ` +
                `${node.loadScore.toFixed(2)}`
            );
        }
    );


    console.log(
        "================================="
    );


    return selectedNodes;
};


/*
 * =========================================
 * Upload to automatically selected node
 * =========================================
 */

const uploadToStorageNode = async (
    filePath,
    originalName
) => {

    const node =
        await selectStorageNode();


    const form =
        new FormData();


    form.append(
        "file",
        fs.createReadStream(
            filePath
        ),
        {
            filename:
                originalName
        }
    );


    const response =
        await axios.post(

            `http://${node.host}:${node.port}` +
            `/api/storage/upload`,

            form,

            {

                headers:
                    {
                        ...form.getHeaders(),

                        "x-storage-role":
                            "primary"
                    },

                maxContentLength:
                    Infinity,

                maxBodyLength:
                    Infinity,

                timeout:
                    30000
            }
        );


    return {

        node,

        storage:
            response.data.file
    };
};


/*
 * =========================================
 * Upload to a specific node
 * =========================================
 */

const uploadFileToNode = async (
    node,
    filePath,
    originalName,
    role = "primary"
) => {

    if (
        !node ||
        !node.host ||
        !node.port
    ) {

        throw new Error(
            "Invalid target storage node"
        );
    }


    const form =
        new FormData();


    form.append(
        "file",
        fs.createReadStream(
            filePath
        ),
        {
            filename:
                originalName
        }
    );


    const response =
        await axios.post(

            `http://${node.host}:${node.port}` +
            `/api/storage/upload`,

            form,

            {

                headers:
                    {
                        ...form.getHeaders(),

                        "x-storage-role":
                            role
                    },

                maxContentLength:
                    Infinity,

                maxBodyLength:
                    Infinity,

                timeout:
                    30000
            }
        );


    return response.data.file;
};


/*
 * =========================================
 * Download from storage node
 * =========================================
 */

const downloadFromStorageNode = async (
    node,
    storageName
) => {

    if (
        !node ||
        !node.host ||
        !node.port
    ) {

        throw new Error(
            "Invalid storage node"
        );
    }


    if (
        !storageName
    ) {

        throw new Error(
            "Storage name is required"
        );
    }


    const response =
        await axios.get(

            `http://${node.host}:${node.port}` +
            `/api/storage/download/` +
            `${encodeURIComponent(storageName)}`,

            {
                responseType:
                    "stream",

                timeout:
                    10000
            }
        );


    return response;
};


/*
 * =========================================
 * Delete from storage node
 * =========================================
 */

const deleteFromStorageNode = async (
    node,
    storageName
) => {

    if (
        !node ||
        !node.host ||
        !node.port
    ) {

        throw new Error(
            "Invalid storage node"
        );
    }


    if (
        !storageName
    ) {

        throw new Error(
            "Storage name is required"
        );
    }


    const response =
        await axios.delete(

            `http://${node.host}:${node.port}` +
            `/api/storage/delete/` +
            `${encodeURIComponent(storageName)}`,

            {
                timeout:
                    10000
            }
        );


    return response.data;
};


/*
 * =========================================
 * Replicate file between storage nodes
 * =========================================
 *
 * Source:
 *     Existing healthy copy
 *
 * Target:
 *     New replica/recovered copy
 */

const replicateFileToNode = async (
    sourceNode,
    sourceStorageName,
    targetNode
) => {

    if (
        !sourceNode ||
        !sourceNode.host ||
        !sourceNode.port
    ) {

        throw new Error(
            "Invalid source storage node"
        );
    }


    if (
        !targetNode ||
        !targetNode.host ||
        !targetNode.port
    ) {

        throw new Error(
            "Invalid target storage node"
        );
    }


    if (
        !sourceStorageName
    ) {

        throw new Error(
            "Source storage name is required"
        );
    }


    /*
     * =====================================
     * Download source
     * =====================================
     */

    const response =
        await axios.get(

            `http://${sourceNode.host}:${sourceNode.port}` +
            `/api/storage/download/` +
            `${encodeURIComponent(sourceStorageName)}`,

            {

                responseType:
                    "stream",

                timeout:
                    10000
            }
        );


    /*
     * =====================================
     * Create multipart form
     * =====================================
     */

    const form =
        new FormData();


    form.append(
        "file",
        response.data,
        {
            filename:
                sourceStorageName
        }
    );


    /*
     * =====================================
     * Upload to target
     * =====================================
     *
     * Mark this explicitly as a replica
     * upload.
     *
     * This also keeps the temporary failure
     * injection mechanism functional for
     * testing if needed.
     */

    const uploadResponse =
        await axios.post(

            `http://${targetNode.host}:${targetNode.port}` +
            `/api/storage/upload`,

            form,

            {

                headers:
                    {
                        ...form.getHeaders(),

                        "x-storage-role":
                            "replica"
                    },

                maxContentLength:
                    Infinity,

                maxBodyLength:
                    Infinity,

                timeout:
                    30000
            }
        );


    return uploadResponse.data.file;
};


/*
 * =========================================
 * Exports
 * =========================================
 */

module.exports = {

    selectStorageNode,

    selectStorageNodes,

    uploadToStorageNode,

    uploadFileToNode,

    replicateFileToNode,

    downloadFromStorageNode,

    deleteFromStorageNode
};  