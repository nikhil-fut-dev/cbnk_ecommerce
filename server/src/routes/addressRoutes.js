import express from "express";

import {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} from "../controllers/addressController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getAddresses);

router.get("/:id", getAddressById);

router.post("/", createAddress);

router.put("/:id", updateAddress);

router.patch("/:id/default", setDefaultAddress);

router.delete("/:id", deleteAddress);

export default router;
