import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

console.log("Razorpay Key ID loaded:", keyId ? "YES" : "NO");

console.log("Razorpay Key Secret loaded:", keySecret ? "YES" : "NO");

if (!keyId || !keySecret) {
  throw new Error("Razorpay credentials are missing. Check server/.env");
}

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

export default razorpay;
