const Appointment = require("../models/Appointment");
const Client = require("../models/Client");
const ServiceProvider = require("../models/ServiceProvider");


// POST CONTROLLERS

// Function to create a new appointment
const createAppointment = async (req, res) => {
    try {
        // Destructure the request body to get the appointment details
        const {
            clientId,
            serviceProviderId,
            status,
            appointmentType,
            date,
            duration,
        } = req.body;

        // Changing the time zone to Israel, MONGO saves changes the time automatically to UTC timezone
        const offset = 3;
        const originalDate = new Date(new Date(date).getTime() + (offset * 60 * 60 * 1000));

        // Prepare the appointment data for insertion into the database
        const appointmentData = {
            clientId,
            serviceProviderId,
            status,
            appointmentType,
            date: originalDate,
            duration,
        };

        // Use Mongoose's `create` method to insert a new appointment document into the database
        const savedAppointment = await Appointment.create(appointmentData);

        // Update the Client and ServiceProvider documents to include the new appointment
        await Client.findByIdAndUpdate(clientId, {$push: {appointments: savedAppointment._id}});
        await ServiceProvider.findByIdAndUpdate(serviceProviderId, {$push: {appointments: savedAppointment._id}});

        // Send a success response along with the saved appointment data
        res.status(201).json({message: "Appointment successfully created!", appointment: savedAppointment});
    } catch (error) {
        // Log the error and send a 500 Internal Server Error response if something goes wrong
        console.error("Error creating appointment:", error);
        res.status(500).json({message: "An error occurred while creating the appointment. Please try again later."});
    }
};

const cancelAppointment = async (req, res) => {
    const appointmentId = req.params.appointmentId;
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            {status: "Canceled"},
            {new: true},
        );
        return appointment? res.status(200).json({appointment: appointment}): res.status(404).json({msg: "Appointment not found"});
    } catch (e) {
        return res.status(500).json({msg: e.message});
    }
};

module.exports = {
    createAppointment,
    cancelAppointment,
};
