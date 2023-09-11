const mongoose = require("mongoose");
const AppointmentType = require("../models/AppointmentType");

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
    const {data} = req.body;
    const appointmentType = new AppointmentType({
        _id: new mongoose.Types.ObjectId(),
        data,
    });

    try {
        await appointmentType.save();
        return res.status(201).json({appointmentType});
    } catch (error) {
        return res.status(500).json({error});
    }
};

// PATCH CONTROLLERS
const updateAppointmentType = async (req, res) => {
    console.log("in patch appointment type");
    const appointmentTypeId = req.params.appointmentTypeId;
    console.log(appointmentTypeId);
    try {
        // finding the appointment by id
        const appointmentType = await AppointmentType.findById(appointmentTypeId);
        if (appointmentType) {
            console.log("app type: " + appointmentType);
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
    const appointmentTypeId = req.params.appointmentTypeId;

    try {
        await AppointmentType.findByIdAndDelete(appointmentTypeId);
        return res.status(201).json({
            message: appointmentTypeId + "Deleted from database!",
        });
    } catch (error) {
        return res.status(500).json({message: "Appointment not found"});
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
