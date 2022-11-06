require("dotenv").config();

const mongoose = require("mongoose");

function connectDB() {
  mongoose
    .connect(process.env.MONGO_CONNECTION_URL)
    .then((result) => console.log("connected"))
    .catch((err) => console.log(err));
  //   mongoose.connect(process.env.MONGO_CONNECTION_URL, {
  // });

  // const connection = mongoose.connection;

  // connection.once('open', () => {
  //     console.log("Database connected");
  //   }).on('error', (err) => {
  //     console.log(err);
  //   });
}

module.exports = connectDB;
