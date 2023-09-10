
const mongoose = require("mongoose");
const ServiceProvider = require("../models/ServiceProvider");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const requireAuth = async (req, res, next) => {
    // verify user is authenticated
    const {authorization} = req.headers;
    if (!authorization) {
        return res.status(401).json({error: "Authorization token required"});
    }

    const token = authorization.split(" ")[1];

    try {
        const {_id} = jwt.verify(token, process.env.SECRET);

        req.user = await ServiceProvider.findOne({_id}).select("_id");
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({error: "Request is not authorized"});
    }
};

const encrypt = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
};

const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET, {expiresIn: "3d"});
};


// GET CONTROLLERS
const readServiceProvider = async (req, res) => {
    const serviceProviderId = req.params.serviceProviderId;
    try {
        const serviceProvider = await ServiceProvider.findById(serviceProviderId);
        return serviceProvider ?
            res.status(200).json({serviceProvider}) :
            res.status(404).json({message: "ServiceProvider not found"});
    } catch (error) {
        return res.status(500).json({error});
    }
};

const getAppointments = async (req, res) => {
    const serviceProviderId = req.params.serviceProviderId;
    try {
        const serviceProvider = await ServiceProvider.findById(serviceProviderId)
            .populate("appointments"); // Populate the 'appointments' field
        if (!serviceProvider) {
            return res.status(404).json({message: "Service Provider wasn't found"});
        }
        // Access the populated 'appointments' field
        const appointments = serviceProvider.appointments;
        return res.status(200).json({appointments});
    } catch (error) {
        return res.status(500).json({error});
    }
};

const readAllServiceProviders = async (_, res) => {
    try {
        const serviceProviders = await ServiceProvider.find({});
        return res.status(200).json({serviceProviders});
    } catch (error) {
        return res.status(500).json({error});
    }
};

const loginServiceProvider = async (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(400).json({message: "No email or passwrod found"});
    }
    // Check if service provider exists in DB
    try {
        const provider = await ServiceProvider.findOne({email});
        if (!provider) {
            return res.status(400).json({message: "Email or password are incorrect"});
        }
        // User found, check if passwrod match
        const match = await bcrypt.compare(password, provider.password);
        if (!match) {
            return res.status(400).json({message: "Email or password are incorrect"});
        }
        // password match, log in user
        const token = createToken(provider._id);
        return res.status(200).json({token: token, name: provider.name, email: email, id: provider._id});
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
};

const updatePassword = async (req, res) => {
    const {id, password} = req.body;
    try {
        const provider = await ServiceProvider.findOne({_id: id});
        if (provider) {
            // Check password strength after finding the provider
            if (!validator.isStrongPassword(password, {minLength: 12})) {
                return res.status(400).json({message: "Password not strong enough"});
            }

            try {
                const hashedPassword = await encrypt(password);
                provider.set({password: hashedPassword});
                await provider.save();
                return res.status(201).json({provider});
            } catch (error) {
                res.status(500).json({error});
            }
        } else {
            res.status(404).json({message: "Service provider not found"});
        }
    } catch (error) {
        res.status(500).json({error});
    }
};
const getSecurityInfo = async (req, res) => {
    console.log("In getSecurityInfo");
    const email = req.query.email; // Access email as a query parameter
    if (!email) {
        console.log("no email found");
        return res.status(400).json({message: "No email found"});
    }
    try {
        const provider = await ServiceProvider.findOne({email});
        if (!provider) {
            console.log("Email doesnt exist");
            return res.status(400).json({message: "Email doesn't exist"});
        }
        return res.status(200).json({securityQuestion: provider.question, securityAnswer: provider.answer, id: provider._id});
    } catch (error) {
        console.log("catched error");
        return res.status(500).json({message: error.message});
    }
};

// POST CONTROLLERS
const createServiceProvider = async (req, res) => {
    const provider = req.body;

    try {
        // Validate email
        if (!validator.isEmail(provider.email)) {
            return res.status(400).json({message: "Bad email address"});
        }

        // Validate password
        if (!validator.isStrongPassword(provider.password, {minLength: 12})) {
            return res.status(400).json({message: "Password not strong enough"});
        }

        // Check if the email already exists
        const existingServiceProvider = await ServiceProvider.findOne({email: provider.email});

        if (existingServiceProvider) {
            return res.status(400).json({message: "Email already in use"});
        }

        // Hash the password
        const hashedPassword = await encrypt(provider.password);
        provider.password = hashedPassword;

        // Create the service provider
        const serviceProvider = new ServiceProvider({
            _id: new mongoose.Types.ObjectId(),
            ...provider,
        });

        // Save the service provider
        const user = await serviceProvider.save();
        const token = createToken(user._id);
        return res.status(201).json({name: user.name, email: user.email, token, id: user._id});
    } catch (error) {
        // Handle any errors that occur and return an error response
        return res.status(500).json({message: error.message});
    }
};
// PATCH CONTROLLERS
const updateServiceProvider = async (req, res) => {
    const serviceProviderId = req.params.serviceProviderId;
    try {
        // finding the serviceProvider by id
        const serviceProvider = await ServiceProvider.findById(serviceProviderId);
        if (serviceProvider) {
            try {
                serviceProvider.set(req.body);
                await serviceProvider.save();
                return res.status(201).json({serviceProvider});
            } catch (error) {
                res.status(500).json({error});
            }
        } else {
            res.status(404).json({message: "ServiceProvider not found"});
        }
    } catch (error) {
        res.status(500).json({error});
    }
};

// DELETE CONTROLLERS
const deleteServiceProvider = async (req, res) => {
    const serviceProviderId = req.params.serviceProviderId;

    try {
        await ServiceProvider.findByIdAndDelete(serviceProviderId);
        return res.status(201).json({
            message: serviceProviderId + "Deleted from database!",
        });
    } catch (error) {
        return res.status(500).json({message: "ServiceProvider not found"});
    }
};

module.exports = {
    createServiceProvider,
    readServiceProvider,
    readAllServiceProviders,
    updateServiceProvider,
    deleteServiceProvider,
    loginServiceProvider,
    requireAuth,
    getSecurityInfo,
    getAppointments,
    updatePassword,
};
