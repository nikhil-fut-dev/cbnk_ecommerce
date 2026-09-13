import User from "../models/User.js";

// ===============================
// GET ALL CUSTOMERS
// ===============================
export const getAdminUsers = async (req, res) => {
  try {
    const {
      search = "",
      status = "all",
      page = 1,
      limit = 20,
      sort = "-createdAt",
    } = req.query;

    const currentPage = Math.max(Number(page) || 1, 1);
    const currentLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const filter = {
      role: "CUSTOMER",
    };

    // Search
    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");

      filter.$or = [
        { fullName: searchRegex },
        { username: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    // Active / inactive filter
    if (status === "active") {
      filter.isActive = true;
    }

    if (status === "inactive") {
      filter.isActive = false;
    }

    const skip = (currentPage - 1) * currentLimit;

    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select(
          "-password -refreshToken -resetPasswordToken -resetPasswordExpires",
        )
        .sort(sort)
        .skip(skip)
        .limit(currentLimit)
        .lean(),

      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: currentPage,
          limit: currentLimit,
          totalUsers,
          totalPages: Math.ceil(totalUsers / currentLimit),
          hasNext: currentPage < Math.ceil(totalUsers / currentLimit),
          hasPrev: currentPage > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get admin users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
};

// ===============================
// GET CUSTOMER BY ID
// ===============================
export const getAdminUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      _id: id,
      role: "CUSTOMER",
    })
      .select(
        "-password -refreshToken -resetPasswordToken -resetPasswordExpires",
      )
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get admin user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
    });
  }
};

// ===============================
// TOGGLE CUSTOMER STATUS
// ===============================
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      _id: id,
      role: "CUSTOMER",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    user.isActive = !user.isActive;

    await user.save();

    return res.status(200).json({
      success: true,
      message: user.isActive
        ? "Customer activated successfully"
        : "Customer deactivated successfully",
      data: {
        _id: user._id,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Toggle user status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update customer status",
    });
  }
};
