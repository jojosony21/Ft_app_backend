const mongoose = require("mongoose");

const UserDetailSchema = new mongoose.Schema({
    username:String,
    email:{type:String,unique:true},
    password:String,
    resetPasswordOTP:Number
},
{
    collection:"UserInfo",
}
);
mongoose.model("UserInfo", UserDetailSchema)

//to add new chemicals
const ChemicalSchema = new mongoose.Schema({
    chemicalname: { type: String, required: true },
    addquantity: { type: Number, required: true },
    expirydate: { type: Date,required:true},
    sellername:{type:String},
    sellernum:{type:String},
},
{
    collection: "Chemical"
}
    
);

mongoose.model('Chemical', ChemicalSchema);


// Define the reagent schema
const ReagentSchema = new mongoose.Schema({
    reagentname: { type: String, required: true },
    chemicals: [{
        chemicalname: { type: String, required: true },
        quantity: { type: Number, required: true },
    }],
    quantity: { type: Number, required: true } // Total quantity of the reagent
});

module.exports = mongoose.model('Reagent', ReagentSchema);

//add experiment

const experimentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    chemicalsUsed: [{ 
        chemicalName: { type: String, required: true },
        quantity: { type: Number, required: true },
    }],
    reagentsUsed: [{ 
        reagentName: { type: String, required: true },
        quantity: { type: Number, required: true },
    }]
});

module.exports = mongoose.model('Experiment', experimentSchema);
