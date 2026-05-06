import { Router } from "express";
import { shortenURL,getURL,analytics,downloadAnalytics,bulkExport } from "../controllers/urls.controller.js";

const urlRouter=Router();

urlRouter.post("/",shortenURL);
urlRouter.post("/bulk-export",bulkExport);
urlRouter.get("/:shortCode",getURL);
urlRouter.get("/:shortCode/stats",analytics);
urlRouter.get("/:shortCode/export",downloadAnalytics);
export {urlRouter};