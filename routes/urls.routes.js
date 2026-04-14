import { Router } from "express";
import { shortenURL,getURL,analytics } from "../controllers/urls.controller.js";

const urlRouter=Router();

urlRouter.post("/",shortenURL);
urlRouter.get("/:shortCode",getURL);
urlRouter.get("/:shortCode/stats",analytics);

export {urlRouter};