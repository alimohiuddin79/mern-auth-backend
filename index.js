// IMPORTS
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import userRoutes from "./routes/userRoutes.js";

// CONFIRGURATIONS
dotenv.config();
connectDB();

// CONSTANTS || VARIABLES
const app = express();
const port = process.env.PORT || 8000;

// MIDDILEWARES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// ROUTES
app.use('/api/users', userRoutes);
app.get('/', (req, res) => {
    res.send("hello from vercel server");
});

// ERROR MIDDLEWARES
app.use(notFound);
app.use(errorHandler);

// SERVER
app.listen(5000, () => console.log(`server is running on port: ${port}`));