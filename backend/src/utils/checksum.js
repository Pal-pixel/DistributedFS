const crypto = require("crypto");
const fs = require("fs");

const calculateChecksum = (filePath) => {
    const fileBuffer = fs.readFileSync(filePath);

    return crypto
        .createHash("sha256")
        .update(fileBuffer)
        .digest("hex");
};

module.exports = {
    calculateChecksum
};