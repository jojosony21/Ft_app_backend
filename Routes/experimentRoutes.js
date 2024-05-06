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

// router.use("/use-experiment", async (req, res) => {
//   try {
//     const { expname, batch, date, remark } = req.body;

//     // Find the experiment by name
//     const experiment = await Experiment.findOne({
//       name: expname,
//     });

//     if (!experiment) {
//       return res
//         .status(404)
//         .json({ status: "fail", message: "Experiment not found" });
//     }

//     const chemicals = experiment.chemicalsUsed;
//     const reagents = experiment.reagentsUsed;

//     chemicals.forEach(async (chemical) => {
//       const quantity = chemical.quantity;
//       const chemicalname = chemical.chemicalName;
//       if (chemical.addquantity < quantity) {
//         return res.status(400).json({
//           status: "fail",
//           data: "Not enough quantity of the chemical available",
//         });
//       }

//       chemical.addquantity -= quantity;

//       const chemicalUsageSchema = new ChemicalUsage({
//         chemicalname,
//         quantity: quantity,
//         batch,
//         date,
//         remark,
//         usedAs: "Chemical",
//         name: "chemical",
//       });

//       await chemicalUsageSchema.save();
//       await chemical.save();
//     });

//     //For all the reagents in the experiment
//     reagents.forEach(async (reag) => {
//       const usedquantity = reag.quantity;
//       const reagentname = reag.reagentNameName;

//       const reagent = await Reagent.findOne({ reagentname });

//       // Check if the chemical exists
//       if (!reagent) {
//         return res
//           .status(404)
//           .json({ status: "fail", data: "Reagent not found" });
//       }

//       // Get all chemicals for that reagent
//       const chemicals = reagent.chemicals;

//       // Check if required quantity of chemicals is present
//       for (const chemical of chemicals) {
//         const chemicalname = chemical.chemicalname;
//         const chem = await Chemical.findOne({ chemicalname });

//         // Quantity of chemical needed = amount of reagent * chemical need for 1 reagent
//         const neededQuantity = usedquantity * chemical.quantity;

//         if (chem.addquantity < neededQuantity) {
//           return res.status(400).json({
//             status: "fail",
//             data: `${chemicalname} quantity not sufficient`,
//           });
//         }
//       }

//       // Deduct the required quantities of chemicals
//       for (const chemical of chemicals) {
//         const chemicalname = chemical.chemicalname;
//         const chem = await Chemical.findOne({ chemicalname });

//         // Quantity of chemical needed = amount of reagent * chemical need for 1 reagent
//         const neededQuantity = usedquantity * chemical.quantity;
//         chem.addquantity -= neededQuantity;

//         const chemicalUsageSchema = new ChemicalUsage({
//           chemicalname,
//           quantity: neededQuantity,
//           batch,
//           date,
//           remark,
//           usedAs: "Reagent",
//           name: reagentname,
//         });

//         await chemicalUsageSchema.save();
//         await chem.save();
//       }
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ status: "fail", message: "Internal server error" });
//   }
// });
router.post("/use-experiment", async (req, res) => {
  try {
    const { expname, batch, date, remark } = req.body;

    // Find the experiment by name
    const experiment = await Experiment.findOne({ name: expname });

    if (!experiment) {
      return res.status(404).json({ status: "fail", message: "Experiment not found" });
    }

    const chemicalsPromises = experiment.chemicalsUsed.map(async (chemical) => {
      const { chemicalName, quantity } = chemical;
      const chem = await Chemical.findOne({ chemicalname: chemicalName });

      if (!chem || chem.addquantity < quantity) {
        throw new Error(`Not enough quantity of ${chemicalName} available`);
      }

      chem.addquantity -= quantity;

      const chemicalUsage = new ChemicalUsage({
        chemicalname: chemicalName,
        quantity,
        batch,
        date,
        remark,
        usedAs: "Experiment",
        name: "chemical",
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

        if (!chem || chem.addquantity < quantity * chemQuantity) {
          throw new Error(`Not enough quantity of ${chemicalname} available`);
        }

        chem.addquantity -= quantity * chemQuantity;

        const chemicalUsage = new ChemicalUsage({
          chemicalname,
          quantity: quantity * chemQuantity,
          batch,
          date,
          remark,
          usedAs: "Experiment",
          name: reagentName,
        });

        await Promise.all([chem.save(), chemicalUsage.save()]);
      }
    });

    await Promise.all([...chemicalsPromises, ...reagentsPromises]);

    res.status(200).json({ status: "success", message: "Experiment data updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ status: "fail", message: err.message });
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
