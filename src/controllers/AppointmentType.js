const mongoose = require("mongoose");
const AppointmentType = require("../models/AppointmentType");
const ServiceProvider = require("../models/ServiceProvider");
const jwt = require("jsonwebtoken");

const requireAuth = async (req, res, next) => {
    // verify user is authenticated
    const {authorization} = req.headers;
    if (!authorization) {
        console.log("Authorization token required");
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

// GET CONTROLLERS
const readAppointmentType = async (req, res) => {
    const appointmentTypeId = req.params.appointmentTypeId;

    try {
        const appointmentType = await AppointmentType.findById(appointmentTypeId);
        return appointmentType ?
            res.status(200).json({appointment}) :
            res.status(404).json({message: "Appointment type not found"});
    } catch (error) {
        return res.status(500).json({error});
    }
};
const readAllAppointmentTypes = async (_, res) => {
    try {
        const appointmentTypes = await AppointmentType.find({});
        return res.status(200).json({appointmentTypes});
    } catch (error) {
        return res.status(500).json({error});
    }
};

// POST CONTROLLERS
const createAppointmentType = async (req, res) => {
    const serviceProviderId = req.params.serviceProviderId;
    const {name, price, duration} = req.body;

    // Start a new transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // Create new appointemnt
        const appointmentType = new AppointmentType({
            _id: new mongoose.Types.ObjectId(),
            name: name,
            price: price,
            duration: duration,
        });

        const newAppointmentType = await appointmentType.save();
        // Store its ID
        const appointmentTypeId = newAppointmentType._id;

        // Find the ServiceProvider you want to update
        const serviceProvider = await ServiceProvider.findById(serviceProviderId);

        if (!serviceProvider) {
            throw new Error("ServiceProvider not found");
        }

        // Add the appointmentTypeId to the appointmentTypes array
        serviceProvider.appointmentTypes.push(appointmentTypeId);

        // Save the updated ServiceProvider document
        await serviceProvider.save();
        // Commit the transaction
        await session.commitTransaction();
        session.endSession();
        // On transaction success
        return res.status(201).json({appointmentType});
    } catch (error) {
        // If any step fails, roll back the transaction
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({error});
    }
};

// PATCH CONTROLLERS
const updateAppointmentType = async (req, res) => {
    const appointmentTypeId = req.params.appointmentTypeId;
    try {
        // finding the appointment by id
        const appointmentType = await AppointmentType.findById(appointmentTypeId);
        if (appointmentType) {
            try {
                appointmentType.set(req.body);
                await appointmentType.save();
                return res.status(201).json({appointmentType});
            } catch (error) {
                res.status(500).json({error});
            }
        } else {
            res.status(404).json({message: "Appointment type not found"});
        }
    } catch (error) {
        res.status(500).json({error});
    }
};

// DELETE CONTROLLERS
const deleteAppointmentType = async (req, res) => {
    const {appointmentTypeId} = req.params;
    const {serviceProviderId} = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const appointmentTypeToDelete = await AppointmentType.findByIdAndDelete(appointmentTypeId); // find and delete appointmentType from the appointment type collection
        const serviceProvider = await ServiceProvider.findById(serviceProviderId); // find the service provider
        if (!serviceProvider) {
            throw new Error("ServiceProvider not found");
        }
        const updatedAppointmentTypes = serviceProvider.appointmentTypes.filter(
            (appointmentType) => !appointmentType._id.equals(appointmentTypeToDelete._id),
        );
        // Update the serviceProvider document to remove the appointmentType
        serviceProvider.appointmentTypes = updatedAppointmentTypes;

        // Save the updated document to the database
        await serviceProvider.save();

        await session.commitTransaction();
        session.endSession();
        return res.status(201).json({
            message: appointmentTypeId + "Deleted from database!",
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        if (error.name === "CastError") {
            // Handle invalid ObjectId error (e.g., appointmentTypeId or serviceProviderId is invalid)
            return res.status(400).json({message: "Invalid ID"});
        } else if (error.message === "ServiceProvider not found") {
            // Handle the case where the ServiceProvider is not found
            return res.status(404).json({message: "ServiceProvider not found"});
        } else if (error.name === "ValidationError") {
            // Handle Mongoose validation errors if any
            return res.status(400).json({message: error.message});
        } else {
            // Handle other unexpected errors with a 500 status code
            console.error(error);
            return res.status(500).json({message: "Internal Server Error"});
        }
    }
};

module.exports = {
    createAppointmentType,
    readAppointmentType,
    readAllAppointmentTypes,
    updateAppointmentType,
    deleteAppointmentType,
    requireAuth,
};
