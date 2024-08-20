const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

router.use(bodyParser.json());
router.use(express.json());

require("../Schemas/UserDetails");

const Chemical = mongoose.model("Chemical");
const Reagent = mongoose.model("Reagent");
const ChemicalUsage = mongoose.model("ChemicalUsage");
const moment = require("moment");

router.post("/add-reagent", async (req, res) => {
  const { reagentname, chemicals } = req.body;

  try {
    // Check if required fields are empty
    if (!reagentname || !chemicals || chemicals.length === 0) {
      return res.status(400).send({
        status: "fail",
        data: "Reagent name and at least one chemical are required",
      });
    }
    // Check if the reagent with the same name already exists
    const existingReagent = await Reagent.findOne({ reagentname });
    if (existingReagent) {
      return res.status(400).send({
        status: "fail",
        data: "Reagent with this name already exists",
      });
    }

    const chemicalObjects = [];
    let totalReagentQuantity = 0; // Total quantity of the reagent

    for (const chemical of chemicals) {
      if (!chemical.chemicalname || !chemical.addquantity) {
        return res.status(400).send({
          status: "fail",
          data: "Chemical name and quantity are required",
        });
      }

      // Push the chemical object to the array
      chemicalObjects.push({
        chemicalname: chemical.chemicalname,
        quantity: chemical.addquantity,
      });

      // Add the quantity of the chemical to the total reagent quantity
      totalReagentQuantity += chemical.addquantity;
    }

    // Create the reagent document
    const newReagent = await Reagent.create({
      reagentname,
      chemicals: chemicalObjects,
      quantity: totalReagentQuantity, // Store the total reagent quantity
    });

    res.status(201).send({ status: "ok", data: newReagent });
  } catch (error) {
    console.error("Error adding reagent:", error);
    res.status(500).send({ status: "fail", data: "Internal server error" });
  }
});

router.get("/reagents", async (req, res) => {
  try {
    // Query the database for all reagents and select only the reagentname field
    const reagents = await Reagent.find().select("reagentname");

    // Send the reagent names as a response
    res.status(200).json({ status: "success", data: reagents });
  } catch (error) {
    // Handle errors
    console.error("Error fetching reagents:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});
//Routes to be included into the app and their is a logical confusion in edit-reagent(is to be solved)
// Route to delete a reagent
router.post("/delete-reagent", async (req, res) => {
  try {
    const { reagentname } = req.body;

    // Check if reagentname is provided
    if (!reagentname) {
      return res.status(400).json({
        status: "fail",
        data: "Reagent name is required",
      });
    }

    // Find and delete the reagent by name
    const deleteResult = await Reagent.deleteOne({ reagentname });

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({
        status: "fail",
        data: "Reagent not found",
      });
    }

    // Send success response
    res
      .status(200)
      .json({ status: "ok", data: "Reagent deleted successfully" });
  } catch (error) {
    // Handle errors
    console.error("Error deleting reagent:", error);
    res.status(500).json({ status: "fail", data: "Internal server error" });
  }
});
router.post("/edit-reagent", async (req, res) => {
  try {
    const { id, newReagentName, chemicals } = req.body;

    // Check if reagent ID is provided
    if (!id) {
      return res.status(400).json({
        status: "fail",
        data: "Reagent ID is required",
      });
    }

    // Find the reagent by ID
    const existingReagent = await Reagent.findById(id);

    if (!existingReagent) {
      return res.status(404).json({
        status: "fail",
        data: "Reagent not found",
      });
    }

    // Update the reagent name if a new one is provided and does not already exist
    if (newReagentName) {
      const duplicateReagent = await Reagent.findOne({ reagentname: newReagentName });
      if (duplicateReagent) {
        return res.status(400).json({
          status: "fail",
          data: "Reagent with the new name already exists",
        });
      }
      existingReagent.reagentname = newReagentName;
    }

    let totalReagentQuantity = 0; // Initialize total reagent quantity
    const chemicalObjects = [];

    // If chemicals are provided, update the chemical list and recalculate the total quantity
    if (chemicals && chemicals.length > 0) {
      for (const chemical of chemicals) {
        if (!chemical.chemicalname || !chemical.addquantity) {
          return res.status(400).json({
            status: "fail",
            data: "Chemical name and quantity are required",
          });
        }

        // Add each chemical to the list
        chemicalObjects.push({
          chemicalname: chemical.chemicalname,
          quantity: chemical.addquantity,
        });

        // Add the quantity of each chemical to the total reagent quantity
        totalReagentQuantity += chemical.addquantity;
      }

      // Update the chemicals and quantity in the existing reagent
      existingReagent.chemicals = chemicalObjects;
      existingReagent.quantity = totalReagentQuantity;
    }

    // Save the updated reagent
    await existingReagent.save();

    // Send success response
    res.status(200).json({
      status: "ok",
      data: "Reagent updated successfully",
    });
  } catch (error) {
    // Handle errors
    console.error("Error editing reagent:", error);
    res.status(500).json({
      status: "fail",
      data: "Internal server error",
    });
  }
});

router.post("/display-reagent", async (req, res) => {
  try {
    const { reagentname } = req.body;

    // Check if reagentname is provided
    if (!reagentname) {
      return res.status(400).json({
        status: "fail",
        data: "Reagent name is required",
      });
    }

    // Find the reagent by name
    const reagent = await Reagent.findOne({ reagentname });

    if (!reagent) {
      return res.status(404).json({
        status: "fail",
        data: "Reagent not found",
      });
    }

    // Send the reagent details in the response
    res.status(200).json({ status: "ok", data: reagent });
  } catch (error) {
    // Handle errors
    console.error("Error displaying reagent:", error);
    res.status(500).json({ status: "fail", data: "Internal server error" });
  }
});
// router.post("/use-reagent", async (req, res) => {
//   const { reagentname, usedquantity, batch, date, remark } = req.body;

  
//   try {
//     // Find the chemical by name
//     const reagent = await Reagent.findOne({ reagentname });

//     // Check if the chemical exists
//     if (!reagent) {
//       return res
//         .status(404)
//         .json({ status: "fail", data: "Reagent not found" });
//     }

//     // Get all chemicals for that reagent
//     const chemicals = reagent.chemicals;

//     // Check if required quantity of chemicals is present
//     for (const chemical of chemicals) {
//       const chemicalname = chemical.chemicalname;
//       const chem = await Chemical.findOne({ chemicalname });

//       // Quantity of chemical needed = amount of reagent * chemical need for 1 reagent
//       const neededQuantity = usedquantity * chemical.quantity;

//       if (chem.addquantity < neededQuantity) {
//         return res.status(400).json({
//           status: "fail",
//           data: `${chemicalname} quantity not sufficient`,
//         });
//       }
//     }

//     // Deduct the required quantities of chemicals
//     for (const chemical of chemicals) {
//       const chemicalname = chemical.chemicalname;
//       const chem = await Chemical.findOne({ chemicalname });

//       // Quantity of chemical needed = amount of reagent * chemical need for 1 reagent
//       const neededQuantity = usedquantity * chemical.quantity;
//       chem.addquantity -= neededQuantity;

//       const chemicalUsageSchema = new ChemicalUsage({
//         chemicalname,
//         quantity: neededQuantity,
//         batch,
//         date,
//         remark,
//         usedAs: "Reagent",
//         name: reagentname,
//       });

//       await chemicalUsageSchema.save();
//       await chem.save();
//     }

//     res.status(200).json({ status: "ok", data: "Reagent usage recorded" });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ status: "fail", data: "Internal server error" });
//   }
// });
router.post("/use-reagent", async (req, res) => {
  const { reagentname, usedquantity, batch, date, remark, Nos } = req.body;
  try {
    // Find the chemical by name
    const reagent = await Reagent.findOne({ reagentname });

    // Check if the chemical exists
    if (!reagent) {
      return res
        .status(404)
        .json({ status: "fail", data: "Reagent not found" });
    }

    // Get all chemicals for that reagent
    const chemicals = reagent.chemicals;

    // Check if required quantity of chemicals is present
    for (const chemical of chemicals) {
      const chemicalname = chemical.chemicalname;
      const chem = await Chemical.findOne({ chemicalname });

      // Quantity of chemical needed = amount of reagent * chemical need for 1 reagent
      const neededQuantity = Nos * (usedquantity * chemical.quantity);

      if (chem.addquantity < neededQuantity) {
        return res.status(400).json({
          status: "fail",
          data: `${chemicalname} quantity not sufficient`,
        });
      }
    }

    // Deduct the required quantities of chemicals
    for (const chemical of chemicals) {
      const chemicalname = chemical.chemicalname;
      const chem = await Chemical.findOne({ chemicalname });

      // Quantity of chemical needed = amount of reagent * chemical need for 1 reagent
      const neededQuantity = Nos * (usedquantity * chemical.quantity);
      chem.addquantity -= neededQuantity;

      const chemicalUsageSchema = new ChemicalUsage({
        chemicalname,
        quantity: neededQuantity,
        batch,
        date,
        remark,
        usedAs: "Reagent",
        name: reagentname,
      });

      await chemicalUsageSchema.save();
      await chem.save();
    }

    res.status(200).json({ status: "ok", data: "Reagent usage recorded" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: "fail", data: "Internal server error" });
  }
});
//recently used reagents
router.get("/recently-used-reagents", async (req, res) => {
  try {
    // Aggregate pipeline to group reagents, sort them by date, and limit to 3
    const recentReagents = await ChemicalUsage.aggregate([
      { $match: { usedAs: "Reagent" } }, // Filter reagent usage entries
      { $group: { _id: "$chemicalname", date: { $max: "$date" } } }, // Group by reagent name and get max date
      { $sort: { date: -1 } }, // Sort by date in descending order
      { $limit: 3 }, // Limit to 3 results
    ]);

    // Extract only the reagent names from the fetched data
    const reagentNames = recentReagents.map((reagent) => reagent._id);

    res.status(200).json({ status: "success", data: reagentNames });
  } catch (error) {
    console.error("Error fetching recently used reagents:", error);
    res.status(500).json({ status: "fail", data: "Internal server error" });
  }
});


module.exports = router;
