const path = require("path");

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const serviceAccountPath = path.join(
    __dirname,
    "../../distributedfs-backend-key.json"
);

console.log("Firebase service account:", serviceAccountPath);

const serviceAccount = require(serviceAccountPath);

const app = initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore(app);

module.exports = {
    app,
    db
};