const express = require("express");
const app = express();
const bodyParser = require('body-parser');


const mongoose=require('mongoose');

const bcrypt = require('bcrypt');
const jwt=require("jsonwebtoken");
const cron = require('node-cron');
const nodemailer = require('nodemailer');

app.use(bodyParser.json());
app.use(express.json());



const mongourl="mongodb+srv://jojosonyezharakath:Josephmathew2002@cluster0.gj8xiez.mongodb.net/?retryWrites=true&w=majority"

const JWT_SECRET="jsfhskjfhkfskhfh()ayikfjdpo.02243243252313133543[]]sdfijsjd";


mongoose.connect(mongourl).then(()=>{
    console.log("Database Connnected");
}).catch((err)=>{console.error(err)
});
 require('./Schemas/UserDetails')
 

 const User=mongoose.model("UserInfo");
 const Chemical=mongoose.model( "Chemical" );
 const Reagent=mongoose.model("Reagent");
 const Experiment = mongoose.model('Experiment');
 const ChemicalUsage = mongoose.model('ChemicalUsage');
 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 const moment = require('moment');



app.get("/",(req,res)=>{
    res.send({status:"started"})

});


app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Check if password is provided
    if (!password || !username || !email) {
        return res.status(400).send({status:"error",data:"fill the fields" });
    }
    // Check if email is valid
    if (!emailRegex.test(email)) {
        return res.status(400).send({ status: "error", data: "Invalid email address" });
    }

    try {
        const oldUser = await User.findOne({ email: email });

        if (oldUser) {
            return res.status(409).send({ status:"error",data:"User already exists" });
        }

        const encryptedPassword = await bcrypt.hash(password, 10);

        await User.create({
            username: username,
            email: email,
            password: encryptedPassword,
        });

        res.status(201).send({ status: "ok", data: "User Created" });
    } catch (error) {
        console.error("Error occurred during registration:", error);
        res.status(500).send({ status: "error", data: "Internal server error" });
    }
});


app.post("/login-user", async (req, res) => {
    const { email, password } = req.body;
    // Check if email is valid
    if (!emailRegex.test(email)) {
        return res.status(400).send({ status: "error", data: "Invalid email address" });
    }
    try {
        const oldUser = await User.findOne({ email: email });

        if (!oldUser) {
            return res.status(404).send({ status:"error",data:"User doesn't exist" });
        }

        if (!password || !oldUser.password) {
            return res.status(400).send({status:"error",data:"Invalid password or user data" });
        }

        const isPasswordValid = await bcrypt.compare(password, oldUser.password);

        if (!isPasswordValid) {
            return res.status(401).send({status:"error",data:"Invalid password"});
        }

        const token = jwt.sign({ username: oldUser.username }, JWT_SECRET);

        res.status(200).send({ status: "ok", data: "Success",msg:token});
        } catch (error) {
        console.error("Error occurred during login:", error);
        res.status(500).send({ status:"error",data:"Internal server error"});
    }
});


// Forgot password route
app.post('/forgotpass', async (req, res) => {
    try {
        const { email } = req.body;
        // Check if email is valid
        if (!emailRegex.test(email)) {
        return res.status(400).send({ status: "error", data: "Invalid email address" });
        }
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'Email not found' });
        }

        
        const otp = Math.floor(100000 + Math.random() * 900000);

        
        user.resetPasswordOTP = otp;
        await user.save();

        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'foodlabapp34@gmail.com',
                pass: 'xegt cyuq veae hwvf'
            }
        });

        
        const mailOptions = {
            from: 'foodlabapp34@gmail.com',
            to: email,
            subject: 'Password Reset OTP',
            html: `
                <div style="background-color: #f5f5f5; padding: 20px; font-family: Arial, sans-serif;">
                    <h2 style="color: #333; font-weight: bold;">Password Reset OTP</h2>
                    <p style="font-size: 16px; color: #555;">Dear User,</p>
                    <p style="font-size: 16px; color: #555;">Your OTP for password reset is: <span style="color: #FFA500; font-weight: bold;">${otp}</span></p>
                    <p style="font-size: 14px; color: #777;">Please use this OTP to reset your password.</p>
                    <p style="font-size: 14px; color: #777;">If you did not request a password reset, please ignore this email.</p>
                </div>
            `,
        };

       
        await transporter.sendMail(mailOptions);

        
        res.json({ message: 'OTP sent to your email for password reset' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Reset password route
app.post('/resetpass', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        // Check if email is valid
        if (!emailRegex.test(email)) {
        return res.status(400).send({ status: "error", data: "Invalid email address" });
        }
        
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'Email not found' });
        }

        
        if (user.resetPasswordOTP != otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        
        const encryptedPassword = await bcrypt.hash(newPassword, 10);

        
        user.password = encryptedPassword;
        user.resetPasswordOTP = null;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.post("/userdata", async (req, res) => {
    const { token } = req.body;
    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const username = decodedToken.username;
        res.send({status:"ok",data:username}) ;
        // Here you can use userEmail to fetch user data
        // For example: UserActivation.findOne({ email: userEmail }).then(...)
    } catch (error) {
        return res.status(401).send({ error: "Invalid token" });
    }
});

//Add new chemicals

app.post('/add-chemical', async (req, res) => {
    try {
        const { chemicalname, addquantity, expirydate, sellername, sellernum } = req.body;

        // Check if any of the required fields are empty
        if (!chemicalname || !addquantity || !expirydate || !sellername || !sellernum){
            return res.status(400).json({ status: "fail", data: 'Chemical name, quantity, and expiry date are required' });
        }
        // Check if the date format is valid using moment.js
        if (!moment(expirydate, 'DD-MM-YYYY', true).isValid()) {
        return res.status(400).send({ status: 'fail', data: 'Invalid date format, please use DD-MM-YYYY' });
        }
        // Check if a chemical with the same name already exists
        const existingChemical = await Chemical.findOne({ chemicalname: chemicalname });
        if (existingChemical) {
            return res.status(400).json({ status: "fail", data: 'Chemical with this name already exists' });
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
        res.status(200).json({ status: "ok", data: { chemical: newChemical, input: req.body } });
    } catch (error) {
        // Handle errors
        console.error('Error adding chemical:', error);
        res.status(500).json({ status: "fail", data: 'Failed to create a new chemical' });
    }
});

cron.schedule('0 0 * * *', async () => {
    try {
        // Find chemicals with expiry date less than or equal to the current date
        const expiredChemicals = await Chemical.find({ expirydate: { $lte: new Date() } });

        // Delete the expired chemicals
        await Chemical.deleteMany({ _id: { $in: expiredChemicals.map(chem => chem._id) } });

        console.log(`${expiredChemicals.length} expired chemicals deleted.`);
        } catch (error) {
        console.error('Error deleting expired chemicals:', error);
         }
 });

app.post('/add-reagent', async (req, res) => {
    const { reagentname, chemicals } = req.body;

    try {
        // Check if required fields are empty
        if (!reagentname || !chemicals || chemicals.length === 0) {
            return res.status(400).send({ status: 'fail', data: 'Reagent name and at least one chemical are required' });
        }
        // Check if the reagent with the same name already exists
        const existingReagent = await Reagent.findOne({ reagentname });
        if (existingReagent) {
            return res.status(400).send({ status: 'fail', data: 'Reagent with this name already exists' });
        }

        const chemicalObjects = [];
        let totalReagentQuantity = 0; // Total quantity of the reagent

        for (const chemical of chemicals) {
            if (!chemical.chemicalname || !chemical.addquantity) {
                return res.status(400).send({ status: 'fail', data: 'Chemical name and quantity are required' });
            }

            // Push the chemical object to the array
            chemicalObjects.push({
                chemicalname: chemical.chemicalname,
                quantity: chemical.addquantity
            });

            // Add the quantity of the chemical to the total reagent quantity
            totalReagentQuantity += chemical.addquantity;
        }

        // Create the reagent document
        const newReagent = await Reagent.create({
            reagentname,
            chemicals: chemicalObjects,
            quantity: totalReagentQuantity // Store the total reagent quantity
        });

        res.status(201).send({ status: 'ok', data: newReagent });
    } catch (error) {
        console.error('Error adding reagent:', error);
        res.status(500).send({ status: 'fail', data: 'Internal server error' });
    }
});


// Route for adding a new experiment
app.post('/add-experiment', async (req, res) => {
    const { name, chemicalsUsed, reagentsUsed } = req.body;

    try {
        // Check if required fields are empty
        if (!name || !chemicalsUsed || !reagentsUsed) {
            return res.status(400).json({ status: 'fail', data: 'Name, chemicalsUsed, and reagentsUsed are required' });
        }

        // Check if chemicalsUsed and reagentsUsed are arrays
        if (!Array.isArray(chemicalsUsed) || !Array.isArray(reagentsUsed)) {
            return res.status(400).json({ status: 'fail', data: 'ChemicalsUsed and reagentsUsed must be arrays' });
        }

        // Create a new experiment object with the provided information
        const newExperiment = new Experiment({
            name,
            chemicalsUsed: chemicalsUsed.map(chemical => ({
                name: chemical.chemicalname,
                quantity: chemical.addquantity || 0 // Set quantity to 0 if not provided
            })),
            reagentsUsed: reagentsUsed.map(reagent => ({
                name: reagent.reagentname,
                quantity: reagent.quantity || 0 // Set quantity to 0 if not provided
            }))
        });

        // Save the experiment to the database
        await newExperiment.save();

        res.status(201).json({ status: 'success', data: newExperiment });
    } catch (error) {
        console.error('Error adding experiment:', error);
        res.status(500).json({ status: 'fail', data: 'Internal server error' });
    }
});





//update chemical stock

app.post('/update-chemical', async (req, res) => {
    const { chemicalname, addquantity, expirydate, sellername, sellernum } = req.body;

   
    if (!chemicalname || !addquantity || !expirydate || !sellername || !sellernum) {
        return res.status(400).send({ status: 'fail', data: 'Missing or null values in request body' });
    }
    // Check if the date format is valid using moment.js
    if (!moment(expirydate, 'DD-MM-YYYY', true).isValid()) {
        return res.status(400).send({ status: 'fail', data: 'Invalid date format, please use DD-MM-YYYY' });
    }

    try {
      
        const existingChemical = await Chemical.findOne({ chemicalname });

        if (!existingChemical) {
            return res.status(404).send({ status: 'fail', data: 'Chemical not found' });
        }

        existingChemical.addquantity += addquantity; 
        existingChemical.expirydate = expirydate;
        existingChemical.sellername = sellername;
        existingChemical.sellernum = sellernum;

        
        await existingChemical.save();

        res.status(200).send({ status: 'ok' ,data: 'update successfull'});
    } catch (error) {
        console.error('Error updating chemical:', error);
        res.status(500).send({ status: 'fail', data: 'internal server error' });
    }
});





// Define the route to get all experiments
app.get('/experiments', async (req, res) => {
    try {
        // Query the database for all experiments and select only the experimentname field
        const experiments = await Experiment.find().select('name');

        // Send the experiment names as a response
        res.status(200).json({ status: 'success', data: experiments });
    } catch (error) {
        // Handle errors
        console.error('Error fetching experiments:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});
app.get('/reagents', async (req, res) => {
    try {
        // Query the database for all reagents and select only the reagentname field
        const reagents = await Reagent.find().select('reagentname');

        // Send the reagent names as a response
        res.status(200).json({ status: 'success', data: reagents });
    } catch (error) {
        // Handle errors
        console.error('Error fetching reagents:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

app.get('/chemicals-reagent', async (req, res) => {
    try {
        // Query chemicals from the database
        const chemicals = await Chemical.find({}, 'chemicalname');

        // Query reagents from the database
        const reagents = await Reagent.find({}, 'reagentname');

        // Combine the results
        const combinedList = {
            chemicals: chemicals.map(chemical => chemical.chemicalname),
            reagents: reagents.map(reagent => reagent.reagentname)
        };

        // Send the combined list as a response
        res.status(200).json({ status: 'success', data: combinedList });
    } catch (error) {
        // Handle errors
        console.error('Error fetching combined list:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

app.get('/chemical-reagent-experiment', async (req, res) => {
    try {
        // Query chemicals from the database
        const chemicals = await Chemical.find({}, 'chemicalname');

        // Query reagents from the database
        const reagents = await Reagent.find({}, 'reagentname');

        // Query experiments from the database
        const experiments = await Experiment.find({}, 'name');

        // Combine the results
        const combinedList = {
            chemicals: chemicals.map(chemical => chemical.chemicalname),
            reagents: reagents.map(reagent => reagent.reagentname),
            experiments: experiments.map(experiment => experiment.name)
        };

        // Send the combined list as a response
        res.status(200).json({ status: 'success', data: combinedList });
    } catch (error) {
        // Handle errors
        console.error('Error fetching combined list:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});




// Route for filtered search by chemical name
// Assuming you are using Express.js
app.post('/chemicals/search', async (req, res) => {
    const { name } = req.body;

    try {
        // Build the filter based on the provided name
        const filter = {};
        if (name) {
            filter.chemicalname = name;
        }

        // Fetch chemicals matching the filter
        const chemicals = await Chemical.find(filter, 'chemicalname addquantity expirydate');

        res.status(200).send({ status: 'ok', data: { chemicals } });
    } catch (error) {
        console.error('Error searching chemicals:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

// Route to use a chemical by name
app.post('/use-chemical', async (req, res) => {
    const { chemicalname, quantity, batch, date, remark } = req.body;
        // Check if the date format is valid using moment.js
        if (!moment(date, 'DD-MM-YYYY', true).isValid()) {
        return res.status(400).send({ status: 'fail', data: 'Invalid date format, please use DD-MM-YYYY' });
        }
    try {
        // Find the chemical by name
        const chemical = await Chemical.findOne({ chemicalname });

        // Check if the chemical exists
        if (!chemical) {
            return res.status(404).json({ status: 'fail', data: 'Chemical not found' });
        }

        // Check if there is enough quantity of the chemical available
        if (chemical.addquantity < quantity) {
            return res.status(400).json({ status: 'fail', data: 'Not enough quantity of the chemical available' });
        }

        // Update the quantity of the chemical
        chemical.addquantity -= quantity;

        // Save the updated chemical
        await chemical.save();

        // Create a new usage history entry
        const usageHistoryEntry = new ChemicalUsage({
            chemicalname,
            quantity,
            batch,
            date,
            remark
        });

        // Save the usage history entry
        await usageHistoryEntry.save();

        res.status(200).json({ status: 'success', data: { chemical, usageHistoryEntry } });
    } catch (error) {
        console.error('Error using chemical:', error);
        res.status(500).json({ status: 'fail', data: 'Internal server error' });
    }
});
//use reagent
//use experiment
//usage history
//display chemicals
app.get('/chemicals', async (req, res) => {
    try {
        // Fetch all chemicals from the database and project only the chemicalname field
        const chemicals = await Chemical.find({}, 'chemicalname');

        res.status(200).send({ status: 'ok', data: { chemicals } });
    } catch (error) {
        console.error('Error fetching chemicals:', error);
        res.status(500).send({ status:'fail',data: 'Internal server error' });
    }
});

app.get('/avialablestock', async (req, res) => {
    try {
        
        const chemicals = await Chemical.find({}, 'chemicalname addquantity expirydate');

        res.status(200).send({ status: 'ok', data: { chemicals } });
    } catch (error) {
        console.error('Error fetching chemicals:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

app.post('/chemical-usage-history', async (req, res) => {
    try {
        const usageHistory = await ChemicalUsage.find();
        res.status(200).json({ status: 'success', data: usageHistory });
    } catch (error) {
        console.error('Error fetching chemical usage history:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});


app.listen(5001,()=>{
    console.log("Node js server started.")
})
