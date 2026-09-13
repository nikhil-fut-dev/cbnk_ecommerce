import dotenv from "dotenv";
dotenv.config();

const { default: connectDB } = await import("./config/database.js");
const { default: app } = await import("./app.js");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `🚀 CBNK E-Commerce Server running on http://localhost:${PORT}`,
      );
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
