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

// GET CONTROLLERS
const readAppointment = async (req, res) => {
	const appointmentId = req.params.appointmentId;

	try {
		const appointment = await Appointment.findById(appointmentId);
		return appointment
			? res.status(200).json({ appointment })
			: res.status(404).json({ message: "Appointment not found" });
	} catch (error) {
		return res.status(500).json({ error });
	}
};
const readAllAppointments = async (_, res) => {
	try {
		const appointments = await Appointment.find({});
		return res.status(200).json({ appointments });
	} catch (error) {
		return res.status(500).json({ error });
	}
};

// POST CONTROLLERS
const createAppointment = async (req, res) => {
	const { data } = req.body;
	const appointment = new Appointment({
		_id: new mongoose.Types.ObjectId(),
		data,
	});

	try {
		await appointment.save();
		return res.status(201).json({ appointment });
	} catch (error) {
		return res.status(500).json({ error });
	}
};

// PATCH CONTROLLERS
const updateAppointment = async (req, res) => {
	const appointmentId = req.params.appointmentId;
	try {
		// finding the appointment by id
		const appointment = await Appointment.findById(appointmentId);
		if (appointment) {
			try {
				appointment.set(req.body);
				await appointment.save();
				return res.status(201).json({ appointment });
			} catch (error) {
				res.status(500).json({ error });
			}
		} else {
			res.status(404).json({ message: "Appointment not found" });
		}
	} catch (error) {
		res.status(500).json({ error });
	}
};

// DELETE CONTROLLERS
const deleteAppointment = async (req, res) => {
	const appointmentId = req.params.appointmentId;

	try {
		await Appointment.findByIdAndDelete(appointmentId);
		return res.status(201).json({
			message: appointmentId + "Deleted from database!",
		});
	} catch (error) {
		return res.status(500).json({ message: "Appointment not found" });
	}
};

module.exports = {
	createAppointment,
	readAppointment,
	readAllAppointments,
	updateAppointment,
	deleteAppointment,
};
