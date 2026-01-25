import express from "express";
import { getMenu, seedMenu } from "../controllers/menuController.js";

const router = express.Router();

router.get("/", getMenu);
router.post("/seed", seedMenu);

export default router;
