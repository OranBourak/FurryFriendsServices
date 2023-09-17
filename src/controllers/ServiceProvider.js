const mongoose = require("mongoose");
const ServiceProvider = require("../models/ServiceProvider");
const blockedTimeSlot = require("../models/BlockedTimeSlot");
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
        return res.status(401).json({error: "Request is not authorized"});
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
            res.status(404).json({error: "ServiceProvider not found"});
    } catch (error) {
        return res.status(500).json({error: "Internal Server Error"});
    }
};

const getAvailabilityManagmentData = async (req, res) => {
    const serviceProviderId = req.params.serviceProviderId;
    try {
        const serviceProvider = await ServiceProvider.findById(serviceProviderId)
            .populate(["appointments", "blockedTimeSlots"]);
        if (!serviceProvider) {
            return res.status(404).json({error: "Service Provider wasn't found"});
        }
        // On success
        // Initialize blocked dates
        const blockedDates = serviceProvider.blockedDates;

        // Initialize blocked time slots
        const blockedTimeSlots = serviceProvider.blockedTimeSlots;

        // Initialize appointments
        const appointments = serviceProvider.appointments;

        return res.status(200).json({blockedDates: blockedDates, blockedTimeSlots: blockedTimeSlots, appointments: appointments});
    } catch {
        return res.status(500).json({error: "Internal Server Error"});
    }
};

const getAppointments = async (req, res) => {
    const serviceProviderId = req.params.serviceProviderId;
    try {
        const serviceProvider = await ServiceProvider.findById(serviceProviderId)
            .populate({
                path: "appointments",
                populate: [
                    {path: "appointmentType"}, // Populate the 'appointmentType' field within 'appointments'
                    {path: "clientId"}, // Populate the 'clientId' field within 'appointments'
                ],
            });
        if (!serviceProvider) {
            return res.status(404).json({message: "Service Provider wasn't found"});
        }
        // Access the populated 'appointments' field
        const appointments = serviceProvider.appointments;
        const currentDate = new Date();
        let israeliCurrDateTime;
        for (const appointment of appointments) {
            israeliCurrDateTime = new Date(appointment.date);
            israeliCurrDateTime.setMinutes(israeliCurrDateTime.getMinutes() - 180);
            israeliCurrDateTime.setHours(israeliCurrDateTime.getHours() + appointment.duration);
            if (israeliCurrDateTime < currentDate && appointment.status !== "Completed") {
                // The appointment's date and time have passed; update status to "Completed"
                appointment.status = "Completed";
                await appointment.save();
            }
        }
        return res.status(200).json({appointments});
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
};

const getAppointmentTypes = async (req, res) => {
    const serviceProviderId = req.params.serviceProviderId;
    try {
        const serviceProvider = await ServiceProvider.findById(serviceProviderId)
            .populate("appointmentTypes");
        if (!serviceProvider) {
            return res.status(404).json({message: "Service Provider wasn't found"});
        }

        // Access AppointmentTypes field
        const appointmentTypes = serviceProvider.appointmentTypes;
        return res.status(200).json({appointmentTypes});
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
};

const readAllServiceProviders = async (_, res) => {
    try {
        const serviceProviders = await ServiceProvider.find({});
        return res.status(200).json({serviceProviders});
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
};

const loginServiceProvider = async (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(400).json({error: "No email or password found"});
    }
    // Check if service provider exists in DB
    try {
        const provider = await ServiceProvider.findOne({email});
        if (!provider) {
            return res.status(400).json({error: "Email or password are incorrect"});
        }
        // User found, check if passwrod match
        const match = await bcrypt.compare(password, provider.password);
        if (!match) {
            return res.status(400).json({error: "Email or password are incorrect"});
        }
        // password match, log in user
        const token = createToken(provider._id);
        return res.status(200).json({token: token, name: provider.name, email: email, id: provider._id});
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Internal server error"});
    }
};

const blockDate = async (req, res) => {
    const serviceProviderId = req.params.serviceProviderId;
    // Start a new transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {dateToBlock} = req.body;
        // finding the serviceProvider by id
        const serviceProvider = await ServiceProvider.findById(serviceProviderId)
            .populate("blockedTimeSlots");
        if (!serviceProvider) {
            return res.status(404).json({error: "Service Provider wasn't found"});
        }
        // TODO: check if the service provider has meeting on the date to block
        // (can happen that a client simultaniously scheduled an appointment when the service provider is blocking the date)
        const blockedTimeSlots = serviceProvider.blockedTimeSlots;

        // filter blocked time slots on the same date to block
        const blockedTimeSlotToDelete = blockedTimeSlots.find((blockedSlot) => blockedSlot.date === dateToBlock );
        // If there is blocked time slot in the date to block
        if (blockedTimeSlotToDelete) {
            // delete it from the blockedTimeSlot schema
            await blockedTimeSlot.findByIdAndDelete(blockedTimeSlotToDelete._id);
            // delete it from the service provider array
            const updatedBlockedTimeSlots = blockedTimeSlots.filter(
                (slot) => !slot._id.equals(blockedTimeSlotToDelete._id),
            );

            // Update the serviceProvider document to remove the appointmentType
            serviceProvider.blockedTimeSlots = updatedBlockedTimeSlots;
            // Save in the end of the func
        }
        // Add the blocked date to the service prvider blocked dates list
        serviceProvider.blockedDates.push(dateToBlock);
        await serviceProvider.save();

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();
        return res.status(200).json({serviceProvider});
    } catch (error) {
        // If any step fails, roll back the transaction
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({error: "Internal Server Error"});
    }
};

const updatePassword = async (req, res) => {
    const {id, password} = req.body;
    try {
        const provider = await ServiceProvider.findOne({_id: id});
        if (provider) {
            // Check password strength after finding the provider
            if (!validator.isStrongPassword(password, {minLength: 12})) {
                return res.status(400).json({error: "Password not strong enough"});
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
            res.status(404).json({error: "Service provider not found"});
        }
    } catch (error) {
        res.status(500).json({error: "Internal Server Error"});
    }
};
const getSecurityInfo = async (req, res) => {
    const email = req.query.email; // Access email as a query parameter
    if (!email) {
        return res.status(400).json({error: "No email found"});
    }
    try {
        const provider = await ServiceProvider.findOne({email});
        if (!provider) {
            return res.status(400).json({error: "Email doesn't exist"});
        }
        return res.status(200).json({securityQuestion: provider.question, securityAnswer: provider.answer, id: provider._id});
    } catch (error) {
        return res.status(500).json({error: "Internal Server Error"});
    }
};

// POST CONTROLLERS
const createServiceProvider = async (req, res) => {
    const provider = req.body;

    try {
        // Validate email
        if (!validator.isEmail(provider.email)) {
            return res.status(400).json({error: "Bad email address"});
        }

        // Validate password
        if (!validator.isStrongPassword(provider.password, {minLength: 12})) {
            return res.status(400).json({error: "Password not strong enough"});
        }

        // Check if the email already exists
        const existingServiceProvider = await ServiceProvider.findOne({email: provider.email});

        if (existingServiceProvider) {
            return res.status(400).json({error: "Email already in use"});
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
        return res.status(500).json({error: "Internal Server Error"});
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
                res.status(500).json({error: "Internal Server Error"});
            }
        } else {
            res.status(404).json({error: "ServiceProvider not found"});
        }
    } catch (error) {
        res.status(500).json({error: "Internal Server Error"});
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
        return res.status(500).json({error: "Internal Server Error"});
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
    getAppointmentTypes,
    getAvailabilityManagmentData,
    blockDate,
    ServiceProvider,
};
