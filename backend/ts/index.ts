import express, { type Request, type Response } from "express"
import cors from "cors"
import dotenv from "dotenv"
import axios from "axios"
dotenv.config()

const port = process.env.PORT || 8080
const app = express()
app.use(express.json())
app.use(cors())

app.get("/api/arbitrage", async (_req, res) => {
    try {
        const rustResponse = await axios.get("http://localhost:3030/arbitrage");
        res.json(rustResponse.data);
    }
    catch (error) {
        console.error("Error calling Rust service:", error);
        res.status(500).json(
            {
                error: "Failed to fetch arbitrage data"
            }
        );
    }
});

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});