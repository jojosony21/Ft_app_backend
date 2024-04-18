const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

router.use(bodyParser.json());
router.use(express.json());

require("../Schemas/UserDetails");

const Chemical = mongoose.model("Chemical");
const Reagent = mongoose.model("Reagent");
const Experiment = mongoose.model("Experiment");

router.get("/chemicals-reagent", async (req, res) => {
  try {
    // Query chemicals from the database
    const chemicals = await Chemical.find({}, "chemicalname");

    // Query reagents from the database
    const reagents = await Reagent.find({}, "reagentname");

    // Combine the results
    const combinedList = {
      chemicals: chemicals.map((chemical) => chemical.chemicalname),
      reagents: reagents.map((reagent) => reagent.reagentname),
    };

    // Send the combined list as a response
    res.status(200).json({ status: "success", data: combinedList });
  } catch (error) {
    // Handle errors
    console.error("Error fetching combined list:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

router.get("/chemical-reagent-experiment", async (req, res) => {
  try {
    // Query chemicals from the database
    const chemicals = await Chemical.find({}, "chemicalname");

    // Query reagents from the database
    const reagents = await Reagent.find({}, "reagentname");

    // Query experiments from the database
    const experiments = await Experiment.find({}, "name");

    // Combine the results
    const combinedList = {
      chemicals: chemicals.map((chemical) => chemical.chemicalname),
      reagents: reagents.map((reagent) => reagent.reagentname),
      experiments: experiments.map((experiment) => experiment.name),
    };

    // Send the combined list as a response
    res.status(200).json({ status: "success", data: combinedList });
  } catch (error) {
    // Handle errors
    console.error("Error fetching combined list:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});
module.exports = router;
