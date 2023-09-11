/* eslint-disable no-tabs */
/* eslint-disable comma-dangle */
/* eslint-disable operator-linebreak */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
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
			duration
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
			duration
		};
		
		// Use Mongoose's `create` method to insert a new appointment document into the database
		const savedAppointment = await Appointment.create(appointmentData);

		// Update the Client and ServiceProvider documents to include the new appointment
		await Client.findByIdAndUpdate(clientId, { $push: { appointments: savedAppointment._id } });
		await ServiceProvider.findByIdAndUpdate(serviceProviderId, { $push: { appointments: savedAppointment._id } });
	
		// Send a success response along with the saved appointment data
		res.status(201).json({ message: "Appointment successfully created!", appointment: savedAppointment });
	} catch (error) {
		// Log the error and send a 500 Internal Server Error response if something goes wrong
		console.error("Error creating appointment:", error);
		res.status(500).json({ message: "An error occurred while creating the appointment. Please try again later." });
	}
};


// // GET CONTROLLERS
// const readAppointment = async (req, res) => {
// 	const appointmentId = req.params.appointmentId;

// 	try {
// 		const appointment = await Appointment.findById(appointmentId);
// 		return appointment
// 			? res.status(200).json({ appointment })
// 			: res.status(404).json({ message: "Appointment not found" });
// 	} catch (error) {
// 		return res.status(500).json({ error });
// 	}
// };
// const readAllAppointments = async (_, res) => {
// 	try {
// 		const appointments = await Appointment.find({});
// 		return res.status(200).json({ appointments });
// 	} catch (error) {
// 		return res.status(500).json({ error });
// 	}
// };


// PATCH CONTROLLERS
// const updateAppointment = async (req, res) => {
// 	const appointmentId = req.params.appointmentId;
// 	try {
		// finding the appointment by id
// 		const appointment = await Appointment.findById(appointmentId);
// 		if (appointment) {
// 			try {
// 				appointment.set(req.body);
// 				await appointment.save();
// 				return res.status(201).json({ appointment });
// 			} catch (error) {
// 				res.status(500).json({ error });
// 			}
// 		} else {
// 			res.status(404).json({ message: "Appointment not found" });
// 		}
// 	} catch (error) {
// 		res.status(500).json({ error });
// 	}
// };

// DELETE CONTROLLERS
// const deleteAppointment = async (req, res) => {
// 	const appointmentId = req.params.appointmentId;

// 	try {
// 		await Appointment.findByIdAndDelete(appointmentId);
// 		return res.status(201).json({
// 			message: appointmentId + "Deleted from database!",
// 		});
// 	} catch (error) {
// 		return res.status(500).json({ message: "Appointment not found" });
// 	}
// };

module.exports = {
	createAppointment,
	// readAppointment,
	// readAllAppointments,
	// updateAppointment,
	// deleteAppointment,
};
