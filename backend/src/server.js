const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const fileRoutes = require("./routes/fileRoutes");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const SERVER_ID = process.env.SERVER_ID || "server-1";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.json({
        name: "DistributedFS",
        version: "1.0.0",
        status: "running",
        serverId: SERVER_ID
    });
});

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        serverId: SERVER_ID,
        timestamp: new Date().toISOString()
    });
});

app.use("/api/files", fileRoutes);

app.listen(PORT, () => {
    console.log("=================================");
    console.log("       DistributedFS Backend     ");
    console.log("=================================");
    console.log(`Server ID  : ${SERVER_ID}`);
    console.log(`Port       : ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log("=================================");
});