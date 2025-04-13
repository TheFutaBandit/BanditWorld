import express from "express";
import {indexRouter} from "./routes/v1/index";
import client from "@repo/db/client";

const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.use("/api/v1", indexRouter);

app.listen(port, () => {
    console.log("server started");
})