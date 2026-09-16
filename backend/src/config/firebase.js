const fs = require("fs");
const path = require("path");

const {
    initializeApp,
    cert
} = require("firebase-admin/app");

const {
    getFirestore
} = require("firebase-admin/firestore");


/*
 * =========================================
 * Firebase service-account paths
 * =========================================
 *
 * Local development:
 * backend/distributedfs-backend-key.json
 *
 * Render:
 * /etc/secrets/distributedfs-backend-key.json
 */

const localPath = path.join(
    __dirname,
    "../../distributedfs-backend-key.json"
);

const renderPath = path.join(
    "/etc/secrets",
    "distributedfs-backend-key.json"
);


let serviceAccountPath;


/*
 * Prefer Render Secret File when deployed.
 */

if (fs.existsSync(renderPath)) {

    serviceAccountPath =
        renderPath;

    console.log(
        "Firebase service account: Render secret file"
    );

}


/*
 * Otherwise use local development file.
 */

else if (fs.existsSync(localPath)) {

    serviceAccountPath =
        localPath;

    console.log(
        "Firebase service account: local file"
    );

}


/*
 * No Firebase credentials found.
 */

else {

    throw new Error(
        "Firebase service-account file not found."
    );

}


/*
 * Load the service-account JSON.
 */

const serviceAccount =
    require(serviceAccountPath);


/*
 * Initialize Firebase Admin.
 */

const app =
    initializeApp({
        credential: cert(serviceAccount)
    });


/*
 * Initialize Firestore.
 */

const db =
    getFirestore(app);


module.exports = {
    app,
    db
};