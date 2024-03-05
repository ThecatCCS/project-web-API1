import express from "express";
import bodyParser from "body-parser";
import {router as user} from "./api/user";
import {router as pictrue} from "./api/pictrue";
import {router as vote} from "./api/vote";
import cors from "cors";
export const app = express();
app.use(bodyParser.text());
app.use(bodyParser.json());

app.use(
    cors({
      origin: "*",
    })
  );
app.use("/", user);
app.use("/pictrue", pictrue);
app.use("/vote", vote)