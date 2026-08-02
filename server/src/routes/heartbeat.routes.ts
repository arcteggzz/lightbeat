import { Router } from "express";
import * as controller from "../controllers/heartbeat.controller";

const router = Router();

router.post("/", controller.heartbeat);

export default router;
