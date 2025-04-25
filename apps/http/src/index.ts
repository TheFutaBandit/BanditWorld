import express from "express";
import {indexRouter} from "./routes/v1/index";
import client from "@repo/db/client";
import cors from 'cors';

const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.use(cors({ origin : "*" }));

app.use("/api/v1", indexRouter);

app.listen(port, () => {
    console.log("server started");
})