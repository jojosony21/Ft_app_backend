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
const ChemicalUsage = mongoose.model("ChemicalUsage");

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
//to get 3 recently used chemical
router.get("/recently-used", async (req, res) => {
  try {
    // Fetch the 3 most recent experiments
    const recentExperiments = await ChemicalUsage.aggregate([
      { $match: { usedAs: "Experiment" } },
      { $sort: { createdAt: -1 } }, // Sort by createdAt field in descending order
      { $group: { _id: "$name", date: { $first: "$createdAt" } } }, // Group by name and get the date of the first entry
      { $sort: { date: -1 } }, // Sort again by date in descending order
      { $limit: 3 },
    ]);

    // Fetch the 3 most recent reagents
    const recentReagents = await ChemicalUsage.aggregate([
      { $match: { usedAs: "Reagent" } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$name", date: { $first: "$createdAt" } } },
      { $sort: { date: -1 } },
      { $limit: 3 },
    ]);

    // Fetch the 3 most recent chemicals
    const recentChemicals = await ChemicalUsage.aggregate([
      { $match: { usedAs: "Chemical" } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$chemicalname", date: { $first: "$createdAt" } } },
      { $sort: { date: -1 } },
      { $limit: 3 },
    ]);

    // Extract only the names from the fetched data
    const experimentNames = recentExperiments.map((experiment) => experiment._id);
    const reagentNames = recentReagents.map((reagent) => reagent._id);
    const chemicalNames = recentChemicals.map((chemical) => chemical._id);

    // Combine the names into a single array
    const recentlyUsed = {
      experiments: experimentNames,
      reagents: reagentNames,
      chemicals: chemicalNames,
    };

    res.status(200).json({ status: "success", data: recentlyUsed });
  } catch (error) {
    console.error("Error fetching recently used data:", error);
    res.status(500).json({ status: "fail", data: "Internal server error" });
  }
});

module.exports = router;
