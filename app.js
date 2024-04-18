const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cron = require("node-cron");

app.use(bodyParser.json());
app.use(express.json());

//database connection

const mongourl =
  "mongodb://jojosonyezharakath:Josephmathew2002@ac-ffzhipi-shard-00-00.gj8xiez.mongodb.net:27017,ac-ffzhipi-shard-00-01.gj8xiez.mongodb.net:27017,ac-ffzhipi-shard-00-02.gj8xiez.mongodb.net:27017/?ssl=true&replicaSet=atlas-148en6-shard-0&authSource=admin&retryWrites=true&w=majority";

mongoose
  .connect(mongourl)
  .then(() => {
    console.log("Database Connnected");
  })
  .catch((err) => {
    console.error(err);
  });
require("./Schemas/UserDetails");

const Chemical = mongoose.model("Chemical");

const authRoutes = require("./Routes/Authroutes");
const chemicalRoute = require("./Routes/chemicalRoute");
const reagentRoutes = require("./Routes/reagentRoutes");
const experimentRoutes = require("./Routes/experimentRoutes");
const commonRoutes = require("./Routes/commonRoutes");

app.get("/", (req, res) => {
  res.send({ status: "started" });
});

//User Authentication Routes

app.post("/login-user", authRoutes);
app.post("/register", authRoutes);
app.post("/forgotpass", authRoutes);
app.post("/resetpass", authRoutes);
app.post("/userdata", authRoutes);

//Chemical routes

app.post("/add-chemical", chemicalRoute);
app.post("/update-chemical", chemicalRoute);
app.post("/use-chemical", chemicalRoute);
app.get("/chemicals", chemicalRoute);
app.get("/avialablestock", chemicalRoute);
app.post("/chemical-usage-history", chemicalRoute);
app.get("/recently-used-chemicals", chemicalRoute);
app.post("/chemicals/search", chemicalRoute);
app.get("/gethistory", chemicalRoute);

//Reagent routes

app.post("/add-reagent", reagentRoutes);
app.get("/reagents", reagentRoutes);
app.post("/use-reagent", reagentRoutes);
app.get("/recently-used-reagents", reagentRoutes);

//Experiment routes

app.post("/add-experiment", experimentRoutes);
app.get("/experiments", experimentRoutes);
app.get("/getexperiment/:name", experimentRoutes);
app.use("/use-experiment", experimentRoutes);
app.get("/chemicals-reagent", commonRoutes);

//common routes

app.get("/chemicals-reagent", commonRoutes);
app.get("/chemical-reagent-experiment", commonRoutes);

//schedule runs every day at midnight to remove expired chemicals from data base

cron.schedule("0 0 * * *", async () => {
  try {
    // Find chemicals with expiry date less than or equal to the current date
    const expiredChemicals = await Chemical.find({
      expirydate: { $lte: new Date() },
    });

    // Delete the expired chemicals
    await Chemical.deleteMany({
      _id: { $in: expiredChemicals.map((chem) => chem._id) },
    });

    console.log(`${expiredChemicals.length} expired chemicals deleted.`);
  } catch (error) {
    console.error("Error deleting expired chemicals:", error);
  }
});

app.listen(5001, () => {
  console.log("Node js server started.");
});
