import Inventory from "../models/Inventory.js";

import {
  getInventoryByProduct,
  createOrSyncInventory,
} from "../services/inventoryService.js";

export const getProductInventory = async (req, res) => {
  try {
    const inventory = await getInventoryByProduct(req.params.productId);

    return res.status(200).json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const syncProductInventory = async (req, res) => {
  try {
    const inventory = await createOrSyncInventory(req.params.productId);

    return res.status(200).json({
      success: true,
      message: "Inventory synchronized successfully",
      data: inventory,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getLowStockProducts = async (req, res) => {
  try {
    const inventories = await Inventory.find({
      $or: [
        {
          $expr: {
            $lte: [
              {
                $subtract: ["$totalStock", "$reservedStock"],
              },
              "$lowStockThreshold",
            ],
          },
        },
        {
          "variants.0": {
            $exists: true,
          },
        },
      ],
    })
      .populate("product", "name slug SKU price images")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: inventories.length,
      data: inventories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch low-stock products",
    });
  }
};
