import crypto from "crypto";

export const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8);

  const random = crypto.randomBytes(3).toString("hex").toUpperCase();

  return `CBNK-${timestamp}-${random}`;
};
