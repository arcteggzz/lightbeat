import { Router } from "express";
import * as controller from "../controllers/history.controller";

const router = Router();

router.get("/", controller.getHistory);

export default router;
