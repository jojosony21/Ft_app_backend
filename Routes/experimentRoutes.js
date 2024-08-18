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

router.post("/add-experiment", async (req, res) => {
  const { name, chemicalsUsed, reagentsUsed } = req.body;

  try {
    // Check if required fields are empty
    if (!name || !chemicalsUsed || !reagentsUsed) {
      return res.status(400).json({
        status: "fail",
        data: "Name, chemicalsUsed, and reagentsUsed are required",
      });
    }

    // Check if chemicalsUsed and reagentsUsed are arrays
    if (!Array.isArray(chemicalsUsed) || !Array.isArray(reagentsUsed)) {
      return res.status(400).json({
        status: "fail",
        data: "ChemicalsUsed and reagentsUsed must be arrays",
      });
    }

    // Create a new experiment object with the provided information
    const newExperiment = new Experiment({
      name,
      chemicalsUsed: chemicalsUsed.map((chemical) => ({
        chemicalName: chemical.chemicalname,
        quantity: chemical.quantity || 0, // Set quantity to 0 if not provided
      })),
      reagentsUsed: reagentsUsed.map((reagent) => ({
        reagentName: reagent.reagentname,
        quantity: reagent.quantity || 0, // Set quantity to 0 if not provided
      })),
    });

    // Save the experiment to the database
    await newExperiment.save();

    res.status(201).json({ status: "success", data: newExperiment });
  } catch (error) {
    console.error("Error adding experiment:", error);
    res.status(500).json({ status: "fail", data: "Internal server error" });
  }
});

//update chemical stock

// Define the route to get all experiments
router.get("/experiments", async (req, res) => {
  try {
    // Query the database for all experiments and select only the experimentname field
    const experiments = await Experiment.find().select("name");

    // Send the experiment names as a response
    res.status(200).json({ status: "success", data: experiments });
  } catch (error) {
    // Handle errors
    console.error("Error fetching experiments:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

//Get a single experiment by name
router.get("/getexperiment/:name", async (req, res) => {
  try {
    const { name } = req.params;

    // Find the experiment by name
    const experiment = await Experiment.findOne({
      name: name,
    });

    if (!experiment) {
      return res
        .status(404)
        .json({ status: "fail", message: "Experiment not found" });
    }

    // If found, return the experiment data
    res.json({ status: "ok", experiment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "fail", message: "Internal server error" });
  }
});

router.post("/delete-experiment", async (req, res) => {
  try {
    const { name } = req.body;

    // Check if experiment name is provided
    if (!name) {
      return res.status(400).json({
        status: "fail",
        data: "Experiment name is required",
      });
    }

    // Find and delete the experiment by name
    const deleteResult = await Experiment.deleteOne({ name });

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({
        status: "fail",
        data: "Experiment not found",
      });
    }

    // Send success response
    res
      .status(200)
      .json({ status: "ok", data: "Experiment deleted successfully" });
  } catch (error) {
    console.error("Error deleting experiment:", error);
    res.status(500).json({ status: "fail", data: "Internal server error" });
  }
});

router.post("/edit-experiment", async (req, res) => {
  try {
    const { name, chemicalsUsed, reagentsUsed } = req.body;

    // Check if experiment name is provided
    if (!name) {
      return res.status(400).json({
        status: "fail",
        data: "Experiment name is required",
      });
    }

    // Find the existing experiment by name
    const existingExperiment = await Experiment.findOne({ name });

    if (!existingExperiment) {
      return res.status(404).json({
        status: "fail",
        data: "Experiment not found",
      });
    }

    // Update chemicalsUsed and reagentsUsed if provided
    if (chemicalsUsed && Array.isArray(chemicalsUsed)) {
      existingExperiment.chemicalsUsed = chemicalsUsed.map((chemical) => ({
        chemicalName: chemical.chemicalname,
        quantity: chemical.quantity || 0,
      }));
    }

    if (reagentsUsed && Array.isArray(reagentsUsed)) {
      existingExperiment.reagentsUsed = reagentsUsed.map((reagent) => ({
        reagentName: reagent.reagentname,
        quantity: reagent.quantity || 0,
      }));
    }

    // Save the updated experiment to the database
    await existingExperiment.save();

    // Send success response
    res
      .status(200)
      .json({ status: "ok", data: "Experiment updated successfully" });
  } catch (error) {
    console.error("Error editing experiment:", error);
    res.status(500).json({ status: "fail", data: "Internal server error" });
  }
});

router.post("/display-experiment", async (req, res) => {
  try {
    const { name } = req.body;

    // Check if experiment name is provided
    if (!name) {
      return res.status(400).json({
        status: "fail",
        data: "Experiment name is required",
      });
    }

    // Find the experiment by name
    const experiment = await Experiment.findOne({ name });

    if (!experiment) {
      return res.status(404).json({
        status: "fail",
        data: "Experiment not found",
      });
    }

    // Send the experiment details in the response
    res.status(200).json({ status: "ok", data: experiment });
  } catch (error) {
    console.error("Error displaying experiment:", error);
    res.status(500).json({ status: "fail", data: "Internal server error" });
  }
});

// router.post("/use-experiment", async (req, res) => {
//   try {
//     const { expname, batch, date, remark } = req.body;
      
//     // Find the experiment by name
//     const experiment = await Experiment.findOne({ name: expname });

//     if (!experiment) {
//       return res.status(404).json({ status: "fail", message: "Experiment not found" });
//     }

//     const chemicalsPromises = experiment.chemicalsUsed.map(async (chemical) => {
//       const { chemicalName, quantity } = chemical;
//       const chem = await Chemical.findOne({ chemicalname: chemicalName });

//       if (!chem || chem.addquantity < quantity) {
//         throw new Error(`Not enough quantity of ${chemicalName} available`);
//       }

//       chem.addquantity -= quantity;

//       const chemicalUsage = new ChemicalUsage({
//         chemicalname: chemicalName,
//         quantity,
//         batch,
//         date,
//         remark,
//         usedAs: "Experiment",
//         name: expname,
//       });

//       return Promise.all([chem.save(), chemicalUsage.save()]);
//     });

//     const reagentsPromises = experiment.reagentsUsed.map(async (reagent) => {
//       const { reagentName, quantity } = reagent;
//       const reagentData = await Reagent.findOne({ reagentname: reagentName });

//       if (!reagentData) {
//         throw new Error(`Reagent ${reagentName} not found`);
//       }

//       const chemicals = reagentData.chemicals;

//       for (const chemical of chemicals) {
//         const { chemicalname, quantity: chemQuantity } = chemical;
//         const chem = await Chemical.findOne({ chemicalname });

//         if (!chem || chem.addquantity < quantity * chemQuantity) {
//           throw new Error(`Not enough quantity of ${chemicalname} available`);
//         }

//         chem.addquantity -= quantity * chemQuantity;

//         const chemicalUsage = new ChemicalUsage({
//           chemicalname,
//           quantity: quantity * chemQuantity,
//           batch,
//           date,
//           remark,
//           usedAs: "Experiment",
//           name: expname,
//         });

//         await Promise.all([chem.save(), chemicalUsage.save()]);
//       }
//     });

//     await Promise.all([...chemicalsPromises, ...reagentsPromises]);

//     res.status(200).json({ status: "success", message: "Experiment data updated successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(400).json({ status: "fail", message: err.message });
//   }
// });

router.post("/use-experiment", async (req, res) => {
  try {
    const { expname, batch, date, remark, num } = req.body;

    // Find the experiment by name
    const experiment = await Experiment.findOne({ name: expname });

    if (!experiment) {
      return res
        .status(404)
        .json({ status: "fail", message: "Experiment not found" });
    }

    const chemicalsPromises = experiment.chemicalsUsed.map(async (chemical) => {
      const { chemicalName, quantity } = chemical;
      const chem = await Chemical.findOne({ chemicalname: chemicalName });

      if (!chem || chem.addquantity < num * quantity) {
        throw new Error(`Not enough quantity of ${chemicalName} available`);
      }
      const used = num * quantity;
      chem.addquantity -= used;

      const chemicalUsage = new ChemicalUsage({
        chemicalname: chemicalName,
        quantity: used,
        batch,
        date,
        remark,
        usedAs: "Experiment",
        name: expname,
      });

      return Promise.all([chem.save(), chemicalUsage.save()]);
    });

    const reagentsPromises = experiment.reagentsUsed.map(async (reagent) => {
      const { reagentName, quantity } = reagent;
      const reagentData = await Reagent.findOne({ reagentname: reagentName });

      if (!reagentData) {
        throw new Error(`Reagent ${reagentName} not found`);
      }

      const chemicals = reagentData.chemicals;

      for (const chemical of chemicals) {
        const { chemicalname, quantity: chemQuantity } = chemical;
        const chem = await Chemical.findOne({ chemicalname });

        if (!chem || chem.addquantity < num * (quantity * chemQuantity)) {
          throw new Error(`Not enough quantity of ${chemicalname} available`);
        }
        const usedRe = num * (quantity * chemQuantity);
        chem.addquantity -= usedRe;

        const chemicalUsage = new ChemicalUsage({
          chemicalname,
          quantity: usedRe,
          batch,
          date,
          remark,
          usedAs: "Experiment",
          name: expname,
        });

        await Promise.all([chem.save(), chemicalUsage.save()]);
      }
    });

    await Promise.all([...chemicalsPromises, ...reagentsPromises]);

    res.status(200).json({
      status: "success",
      message: "Experiment data updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "fail", message: "Internal server error" });
  }
});

router.get("/recently-used-experiments", async (req, res) => {
  try {
    // Aggregate pipeline to group experiments, sort them by date, and limit to 3
    const recentExperiments = await Experiment.aggregate([
      { $group: { _id: "$name", date: { $max: "$createdAt" } } }, // Group by experiment name and get max date
      { $sort: { date: -1 } }, // Sort by date in descending order
      { $limit: 3 }, // Limit to 3 results
    ]);

    // Extract only the experiment names from the fetched data
    const experimentNames = recentExperiments.map((experiment) => experiment._id);

    res.status(200).json({ status: "success", data: experimentNames });
  } catch (error) {
    console.error("Error fetching recently used experiments:", error);
    res.status(500).json({ status: "fail", data: "Internal server error" });
  }
});

module.exports = router;
