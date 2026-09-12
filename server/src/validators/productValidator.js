const allowedGenders = ["MEN", "WOMEN", "UNISEX", "KIDS"];

const allowedAgeGroups = ["ADULT", "TEEN", "KIDS"];

export const validateProductInput = ({
  name,
  description,
  category,
  price,
  SKU,
  gender,
  ageGroup,
}) => {
  const errors = {};

  if (!name || name.trim().length < 2) {
    errors.name = "Product name must be at least 2 characters";
  }

  if (!description || description.trim().length < 10) {
    errors.description = "Product description must be at least 10 characters";
  }

  if (!category) {
    errors.category = "Category is required";
  }

  if (price === undefined || price === null || price === "") {
    errors.price = "Price is required";
  } else if (Number.isNaN(Number(price)) || Number(price) < 0) {
    errors.price = "Price must be a valid positive number";
  }

  if (!SKU || SKU.trim().length < 2) {
    errors.SKU = "SKU is required";
  }

  if (gender && !allowedGenders.includes(gender)) {
    errors.gender = `Gender must be one of: ${allowedGenders.join(", ")}`;
  }

  if (ageGroup && !allowedAgeGroups.includes(ageGroup)) {
    errors.ageGroup = `Age group must be one of: ${allowedAgeGroups.join(
      ", ",
    )}`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
