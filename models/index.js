require("dotenv").config();

let mongoose = require("mongoose");
let User = require("./user");

const connectDB = () => {
  console.log("DB URL", process.env.DATABASE_URL);
  return mongoose
    .connect(process.env.DATABASE_URL)
    .then(() => console.log("Database connection succesful"))
    .catch((err) => console.error("Database connection error", err));
};

module.exports = {
  user: User,
  connectDB: connectDB,
};
