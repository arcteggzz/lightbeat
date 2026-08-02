import { Router } from "express";
import * as controller from "../controllers/status.controller";

const router = Router();

router.get("/", controller.getStatus);

export default router;
