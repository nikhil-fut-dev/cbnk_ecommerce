import Address from "../models/Address.js";

const validateAddressInput = (data) => {
  const errors = {};

  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.fullName = "Full name is required";
  }

  if (!data.phone || !/^[6-9]\d{9}$/.test(data.phone)) {
    errors.phone = "Enter a valid 10-digit Indian mobile number";
  }

  if (!data.addressLine1 || data.addressLine1.trim().length < 5) {
    errors.addressLine1 = "Address is required";
  }

  if (!data.city || data.city.trim().length < 2) {
    errors.city = "City is required";
  }

  if (!data.state || data.state.trim().length < 2) {
    errors.state = "State is required";
  }

  if (!data.postalCode || !/^[1-9][0-9]{5}$/.test(data.postalCode)) {
    errors.postalCode = "Enter a valid 6-digit PIN code";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({
      user: req.user._id,
    }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error("Get addresses error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch addresses",
    });
  }
};

export const getAddressById = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    return res.status(200).json({
      success: true,
      address,
    });
  } catch (error) {
    console.error("Get address error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch address",
    });
  }
};

export const createAddress = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      addressLine1,
      addressLine2 = "",
      landmark = "",
      city,
      state,
      postalCode,
      country = "India",
      addressType = "HOME",
      isDefault = false,
    } = req.body;

    const validation = validateAddressInput({
      fullName,
      phone,
      addressLine1,
      city,
      state,
      postalCode,
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Address validation failed",
        errors: validation.errors,
      });
    }

    if (!["HOME", "WORK", "OTHER"].includes(addressType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address type",
      });
    }

    const existingAddressCount = await Address.countDocuments({
      user: req.user._id,
    });

    const shouldBeDefault = isDefault === true || existingAddressCount === 0;

    if (shouldBeDefault) {
      await Address.updateMany(
        { user: req.user._id },
        { $set: { isDefault: false } },
      );
    }

    const address = await Address.create({
      user: req.user._id,
      fullName: fullName.trim(),
      phone: phone.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim(),
      landmark: landmark.trim(),
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode.trim(),
      country: country.trim() || "India",
      addressType,
      isDefault: shouldBeDefault,
    });

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      address,
    });
  } catch (error) {
    console.error("Create address error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create address",
    });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const {
      fullName,
      phone,
      addressLine1,
      addressLine2 = "",
      landmark = "",
      city,
      state,
      postalCode,
      country = "India",
      addressType = "HOME",
      isDefault = false,
    } = req.body;

    const validation = validateAddressInput({
      fullName,
      phone,
      addressLine1,
      city,
      state,
      postalCode,
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Address validation failed",
        errors: validation.errors,
      });
    }

    if (!["HOME", "WORK", "OTHER"].includes(addressType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address type",
      });
    }

    if (isDefault === true) {
      await Address.updateMany(
        {
          user: req.user._id,
          _id: { $ne: address._id },
        },
        { $set: { isDefault: false } },
      );
    }

    address.fullName = fullName.trim();
    address.phone = phone.trim();
    address.addressLine1 = addressLine1.trim();
    address.addressLine2 = addressLine2.trim();
    address.landmark = landmark.trim();
    address.city = city.trim();
    address.state = state.trim();
    address.postalCode = postalCode.trim();
    address.country = country.trim() || "India";
    address.addressType = addressType;
    address.isDefault = isDefault === true;

    await address.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address,
    });
  } catch (error) {
    console.error("Update address error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update address",
    });
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    await Address.updateMany(
      { user: req.user._id },
      { $set: { isDefault: false } },
    );

    address.isDefault = true;

    await address.save();

    return res.status(200).json({
      success: true,
      message: "Default address updated",
      address,
    });
  } catch (error) {
    console.error("Set default address error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to set default address",
    });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const wasDefault = address.isDefault;

    await Address.deleteOne({
      _id: address._id,
    });

    if (wasDefault) {
      const nextAddress = await Address.findOne({
        user: req.user._id,
      }).sort({
        createdAt: -1,
      });

      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Delete address error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete address",
    });
  }
};
