const { spawn } = require("child_process");

const processes = [];


/*
 * =========================================
 * START PROCESS
 * =========================================
 */

function startProcess(name, script, env) {

    console.log(`Starting ${name}...`);

    const child = spawn(
        process.execPath,
        [script],
        {
            env: {
                ...process.env,
                ...env
            },

            stdio: "inherit"
        }
    );


    processes.push({
        name,
        child
    });


    child.on(
        "exit",
        (code, signal) => {

            console.log(
                `${name} exited. Code: ${code}, Signal: ${signal}`
            );
        }
    );


    child.on(
        "error",
        (error) => {

            console.error(
                `${name} failed to start:`,
                error.message
            );
        }
    );
}


/*
 * =========================================
 * COORDINATOR
 * =========================================
 */

startProcess(
    "Coordinator",
    "src/server.js",
    {
        PORT: process.env.PORT || "5000",
        SERVER_ID: "server-1"
    }
);


/*
 * =========================================
 * STORAGE NODE 1
 * =========================================
 */

startProcess(
    "Node 1",
    "src/storageNode/server.js",
    {
        NODE_ID: "node-1",
        PORT: "5001",
        STORAGE_DIR: "/app/storage-nodes/node-1"
    }
);


/*
 * =========================================
 * STORAGE NODE 2
 * =========================================
 */

startProcess(
    "Node 2",
    "src/storageNode/server.js",
    {
        NODE_ID: "node-2",
        PORT: "5002",
        STORAGE_DIR: "/app/storage-nodes/node-2"
    }
);


/*
 * =========================================
 * STORAGE NODE 3
 * =========================================
 */

startProcess(
    "Node 3",
    "src/storageNode/server.js",
    {
        NODE_ID: "node-3",
        PORT: "5003",
        STORAGE_DIR: "/app/storage-nodes/node-3"
    }
);


/*
 * =========================================
 * GRACEFUL SHUTDOWN
 * =========================================
 */

function shutdown() {

    console.log(
        "\nStopping DistributedFS..."
    );


    for (
        const processInfo of processes
    ) {

        console.log(
            `Stopping ${processInfo.name}...`
        );

        processInfo.child.kill(
            "SIGTERM"
        );
    }


    setTimeout(
        () => {
            process.exit(0);
        },
        2000
    );
}


process.on(
    "SIGINT",
    shutdown
);

process.on(
    "SIGTERM",
    shutdown
);