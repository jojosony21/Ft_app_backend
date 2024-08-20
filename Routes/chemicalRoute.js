const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

router.use(bodyParser.json());
router.use(express.json());

require("../Schemas/UserDetails");

const Chemical = mongoose.model("Chemical");
const ChemicalUsage = mongoose.model("ChemicalUsage");
const moment = require("moment");

//route to add a chemical
router.post("/add-chemical", async (req, res) => {
  try {
    const { chemicalname, addquantity, expirydate, sellername, sellernum } =
      req.body;

    // Check if any of the required fields are empty
    if (
      !chemicalname ||
      !addquantity ||
      !expirydate ||
      !sellername ||
      !sellernum
    ) {
      return res.status(400).json({
        status: "fail",
        data: "Chemical name, quantity, and expiry date are required",
      });
    }
    // Check if the date format is valid using moment.js
   
    // Check if a chemical with the same name already exists
    const existingChemical = await Chemical.findOne({
      chemicalname: chemicalname,
    });
    if (existingChemical) {
      return res.status(400).json({
        status: "fail",
        data: "Chemical with this name already exists",
      });
    }

    // Create a new chemical
    const newChemical = await Chemical.create({
      chemicalname,
      addquantity,
      expirydate,
      sellername,
      sellernum,
    });

    // Send success response
    res
      .status(200)
      .json({ status: "ok", data: { chemical: newChemical, input: req.body } });
  } catch (error) {
    // Handle errors
    console.error("Error adding chemical:", error);
    res
      .status(500)
      .json({ status: "fail", data: "Failed to create a new chemical" });
  }
});

//route to update a chemical

router.post("/update-chemical", async (req, res) => {
  const { chemicalname, addquantity, expirydate, sellername, sellernum } =
    req.body;

  if (
    !chemicalname ||
    !addquantity ||
    !expirydate ||
    !sellername ||
    !sellernum
  ) {
    return res
      .status(400)
      .send({ status: "fail", data: "Missing or null values in request body" });
  }
  // Check if the date format is valid using moment.js
 

  try {
    const existingChemical = await Chemical.findOne({ chemicalname });

    if (!existingChemical) {
      return res
        .status(404)
        .send({ status: "fail", data: "Chemical not found" });
    }

    existingChemical.addquantity += parseInt(addquantity);
    existingChemical.expirydate = expirydate;
    existingChemical.sellername = sellername;
    existingChemical.sellernum = sellernum;

    await existingChemical.save();

    res.status(200).send({ status: "ok", data: "update successfull" });
  } catch (error) {
    console.error("Error updating chemical:", error);
    res.status(500).send({ status: "fail", data: "internal server error" });
  }
});
// Routes to be implemented into the app 
// Route to delete a chemical
router.post("/delete-chemical", async (req, res) => {
  try {
    const { chemicalname } = req.body;

    // Check if chemicalname is provided
    if (!chemicalname) {
      return res.status(400).json({
        status: "fail",
        data: "Chemical name is required",
      });
    }

    // Delete the chemical directly using the model
    const deleteResult = await Chemical.deleteOne({ chemicalname });

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({
        status: "fail",
        data: "Chemical not found",
      });
    }

    // Send success response
    res
      .status(200)
      .json({ status: "ok", data: "Chemical deleted successfully" });
  } catch (error) {
    // Handle errors
    console.error("Error deleting chemical:", error);
    res.status(500).json({ status: "fail", data: "Internal server error" });
  }
});

// Route to edit a chemical
router.post("/edit-chemical", async (req, res) => {
  try {
    const {
      id,
      newChemicalName,
      addquantity,
      expirydate,
      sellername,
      sellernum,
    } = req.body;

    // Check if the chemical ID is provided
    if (!id) {
      return res.status(400).json({
        status: "fail",
        data: "Chemical ID is required",
      });
    }

    // Find the chemical by ID
    const existingChemical = await Chemical.findById(id);

    if (!existingChemical) {
      return res.status(404).json({
        status: "fail",
        data: "Chemical not found",
      });
    }

    // Update the chemical name if a new one is provided and does not already exist
    if (newChemicalName) {
      const duplicateChemical = await Chemical.findOne({
        chemicalname: newChemicalName,
      });
      if (duplicateChemical) {
        return res.status(400).json({
          status: "fail",
          data: "Chemical with the new name already exists",
        });
      }
      existingChemical.chemicalname = newChemicalName;
    }

    // Update other fields if they are provided in the request
    if (addquantity !== undefined) {
      existingChemical.addquantity = addquantity;
    }
    if (expirydate) {
      existingChemical.expirydate = expirydate;
    }
    if (sellername) {
      existingChemical.sellername = sellername;
    }
    if (sellernum) {
      existingChemical.sellernum = sellernum;
    }

    // Save the updated chemical
    await existingChemical.save();

    // Send success response
    res.status(200).json({
      status: "ok",
      data: "Chemical updated successfully",
    });
  } catch (error) {
    // Handle errors
    console.error("Error editing chemical:", error);
    res.status(500).json({
      status: "fail",
      data: "Internal server error",
    });
  }
});

// Route to display a chemical by name
router.post("/display-chemical", async (req, res) => {
  try {
    const { chemicalname } = req.body;

    // Check if chemicalname is provided
    if (!chemicalname) {
      return res.status(400).json({
        status: "fail",
        data: "Chemical name is required",
      });
    }

    // Find the chemical by name
    const chemical = await Chemical.findOne({ chemicalname });

    if (!chemical) {
      return res
        .status(404)
        .json({ status: "fail", data: "Chemical not found" });
    }

    // Send success response with chemical details
    res.status(200).json({ status: "ok", data: chemical });
  } catch (error) {
    // Handle errors
    console.error("Error displaying chemical:", error);
    res.status(500).json({ status: "fail", data: "Internal server error" });
  }
});
// Route to use a chemical by name
// router.post("/use-chemical", async (req, res) => {
//   const { chemicalname, quantity, batch, date, remark } = req.body;
 
//   try {
//     // Find the chemical by name
//     const chemical = await Chemical.findOne({ chemicalname });

//     // Check if the chemical exists
//     if (!chemical) {
//       return res
//         .status(404)
//         .json({ status: "fail", data: "Chemical not found" });
//     }

//     // Check if there is enough quantity of the chemical available
//     if (chemical.addquantity < quantity) {
//       return res.status(400).json({
//         status: "fail",
//         data: "Not enough quantity of the chemical available",
//       });
//     }

//     chemical.addquantity -= quantity;

//     const chemicalUsageSchema = new ChemicalUsage({
//       chemicalname,
//       quantity: quantity,
//       batch,
//       date,
//       remark,
//       usedAs: "Chemical",
//       name: "chemical",
//     });

//     await chemicalUsageSchema.save();
//     await chemical.save();

//     // Create a new usage history entry

//     res.status(200).json({ status: "success", data: { chemical } });
//   } catch (error) {
//     console.error("Error using chemical:", error);
//     res.status(500).json({ status: "fail", data: "Internal server error" });
//   }
// });
router.post("/use-chemical", async (req, res) => {
  const { chemicalname, quantity, batch, date, remark, Nos } = req.body;

  try {
    // Find the chemical by name
    const chemical = await Chemical.findOne({ chemicalname });

    // Check if the chemical exists
    if (!chemical) {
      return res
        .status(404)
        .json({ status: "fail", data: "Chemical not found" });
    }

    // Check if there is enough quantity of the chemical available
    const totalquant = quantity * Nos;
    if (chemical.addquantity < totalquant) {
      return res.status(400).json({
        status: "fail",
        data: "Not enough quantity of the chemical available",
      });
    }

    chemical.addquantity -= totalquant;

    const chemicalUsageSchema = new ChemicalUsage({
      chemicalname,
      quantity: totalquant,
      batch,
      date,
      remark,
      usedAs: "Chemical",
      name: chemicalname,
    });

    await chemicalUsageSchema.save();
    await chemical.save();

    // Create a new usage history entry

    res.status(200).json({ status: "success", data: { chemical } });
  } catch (error) {
    console.error("Error using chemical:", error);
    res.status(500).json({ status: "fail", data: "Internal server error" });
  }
});
//route to get all chemicals by name

router.get("/chemicals", async (req, res) => {
  try {
    // Fetch all chemicals from the database and project only the chemicalname field
    const chemicals = await Chemical.find({}, "chemicalname");

    res.status(200).send({ status: "ok", data: { chemicals } });
  } catch (error) {
    console.error("Error fetching chemicals:", error);
    res.status(500).send({ status: "fail", data: "Internal server error" });
  }
});

//route to get available stock of chemicals

router.get("/avialablestock", async (req, res) => {
  try {
    const chemicals = await Chemical.find(
      {},
      "chemicalname addquantity expirydate"
    );

    res.status(200).send({ status: "ok", data: { chemicals } });
  } catch (error) {
    console.error("Error fetching chemicals:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

//route to get chemical usage history

router.post("/chemical-usage-history", async (req, res) => {
  try {
    const usageHistory = await ChemicalUsage.find();
    res.status(200).json({ status: "success", data: usageHistory });
  } catch (error) {
    console.error("Error fetching chemical usage history:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

//route to get recently used chemicals

router.get("/recently-used-chemicals", async (req, res) => {
  try {
    // Fetch all unique chemical names from the chemical usage entries
    const uniqueChemicalNames = await ChemicalUsage.distinct("chemicalname", {
      usedAs: "Chemical",
    });

    // Get the first three elements from the array
    const recentChemicals = uniqueChemicalNames.slice(0, 3);

    res.status(200).json({ status: "success", data: recentChemicals });
  } catch (error) {
    console.error("Error fetching recently used chemicals:", error);
    res.status(500).json({ status: "fail", data: "Internal server error" });
  }
});

//to search chemicals

router.post("/chemicals/search", async (req, res) => {
  const { name } = req.body;

  try {
    // Build the filter based on the provided name
    const filter = {};
    if (name) {
      filter.chemicalname = name;
    }

    // Fetch chemicals matching the filter
    const chemicals = await Chemical.find(
      filter,
      "chemicalname addquantity expirydate"
    );

    res.status(200).send({ status: "ok", data: { chemicals } });
  } catch (error) {
    console.error("Error searching chemicals:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

//to get chemical usage history

router.get("/gethistory", async (req, res) => {
  try {
    const histories = await ChemicalUsage.find();

    res.json({ status: "ok", histories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "fail", message: "Internal server error" });
  }
});

router.post('/check-low-stock', async (req, res) => {
    const { quantity } = req.body;
    try {
        const lowStockChemicals = await Chemical.find({
            addquantity: { $lt: quantity }, 
        },
        { chemicalname: 1, addquantity: 1}
    );

        if (lowStockChemicals.length > 0) {
            res.status(200).send({ status: 'ok', data: { lowStockChemicals } });
        } else {
            res.status(200).send({ status: 'ok', message: 'No low stock chemicals found.' });
        }
    } catch (error) {
        console.error('Error fetching low stock chemicals:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});
router.post('/check-expiry', async (req, res) => {
    const { date } = req.body;

    try {
        const currentDate = new Date(date);

        const expiringChemicals = await Chemical.find(
            {
                expirydate: { $lte: currentDate }, 
            },
            { chemicalname: 1, addquantity: 1, expirydate: 1 } 
        );

        res.status(200).send({ status: 'ok', data: { expiringChemicals } });
    } catch (error) {
        console.error('Error fetching expiring chemicals:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});
module.exports = router;
