const mongoose = require("mongoose");
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

const getPast5MonthsAppointments = async (req, res) => {
    console.log("In getPast5MonthsAppointments");
    const serviceProviderId = req.params.serviceProviderId;
    // Calculate the date range: 5 months ago from the current month and the current month
    const currentDate = new Date();
    const fiveMonthsAgo = new Date(currentDate);
    fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);

    // Calculate the start and end of the current month
    const fiveMonthsAgoMonthStart = new Date(fiveMonthsAgo.getFullYear(), fiveMonthsAgo.getMonth(), 1);
    const currentMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    ServiceProvider.aggregate([
        {
            $match: {
                // eslint-disable-next-line new-cap
                _id: new mongoose.Types.ObjectId(serviceProviderId),
            },
        },
        {
            $lookup: {
                from: "appointments",
                localField: "appointments",
                foreignField: "_id",
                as: "appointments",
            },
        },
        {
            $unwind: "$appointments",
        },
        {
            $lookup: {
                from: "appointmenttypes", // Replace with the actual name of your AppointmentType collection
                localField: "appointments.appointmentType",
                foreignField: "_id",
                as: "appointments.appointmentType",
            },
        },
        {
            $match: {
                "appointments.date": {
                    $gte: fiveMonthsAgoMonthStart,
                    $lte: currentMonthEnd,
                },
            },
        },
        {
            $group: {
                _id: "$_id",
                name: {$first: "$name"}, // Add any other fields you want to retrieve from the service provider
                email: {$first: "$email"}, // Add any other fields you want to retrieve from the service provider
                // Add any other fields you want to retrieve from the service provider
                appointments: {$push: "$appointments"},
            },
        },
    ])
        .exec()
        .then((result) => {
            // The filtered appointments with populated appointmentType will be in result[0].appointments
            const filteredApps = result[0].appointments;
            console.log("app 5 months ago:" + filteredApps);
            console.log(filteredApps[0].date);
            console.log(filteredApps[0].appointmentType[0].name);
        })
        .catch((error) => {
            console.error(error);
        });
};

module.exports = {
    createAppointment,
    cancelAppointment,
    getPast5MonthsAppointments,
};
