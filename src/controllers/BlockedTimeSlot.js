/* eslint-disable no-tabs */
/* eslint-disable comma-dangle */
/* eslint-disable operator-linebreak */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
const mongoose = require("mongoose");
const BlockedTimeSlot = require("../models/BlockedTimeSlot");

// GET CONTROLLERS
const readBlockedTimeSlot = async (req, res) => {
	const blockedTimeSlotId = req.params.blockedTimeSlotId;

	try {
		const blockedTimeSlot = await BlockedTimeSlot.findById(blockedTimeSlotId);
		return blockedTimeSlot
			? res.status(200).json({ blockedTimeSlot })
			: res.status(404).json({ message: "BlockedTimeSlot not found" });
	} catch (error) {
		return res.status(500).json({ error });
	}
};
const readAllBlockedTimeSlots = async (_, res) => {
	try {
		const blockedTimeSlots = await BlockedTimeSlot.find({});
		return res.status(200).json({ blockedTimeSlots });
	} catch (error) {
		return res.status(500).json({ error });
	}
};

// POST CONTROLLERS
const createBlockedTimeSlot = async (req, res) => {
	const { data } = req.body;
	const blockedTimeSlot = new BlockedTimeSlot({
		_id: new mongoose.Types.ObjectId(),
		data,
	});

	try {
		await blockedTimeSlot.save();
		return res.status(201).json({ blockedTimeSlot });
	} catch (error) {
		return res.status(500).json({ error });
	}
};

// PATCH CONTROLLERS
const updateBlockedTimeSlot = async (req, res) => {
	const blockedTimeSlotId = req.params.blockedTimeSlotId;
	try {
		// finding the blockedTimeSlot by id
		const blockedTimeSlot = await BlockedTimeSlot.findById(blockedTimeSlotId);
		if (blockedTimeSlot) {
			try {
				blockedTimeSlot.set(req.body);
				await blockedTimeSlot.save();
				return res.status(201).json({ blockedTimeSlot });
			} catch (error) {
				res.status(500).json({ error });
			}
		} else {
			res.status(404).json({ message: "BlockedTimeSlot not found" });
		}
	} catch (error) {
		res.status(500).json({ error });
	}
};

// DELETE CONTROLLERS
const deleteBlockedTimeSlot = async (req, res) => {
	const blockedTimeSlotId = req.params.blockedTimeSlotId;

	try {
		await BlockedTimeSlot.findByIdAndDelete(blockedTimeSlotId);
		return res.status(201).json({
			message: blockedTimeSlotId + "Deleted from database!",
		});
	} catch (error) {
		return res.status(500).json({ message: "BlockedTimeSlot not found" });
	}
};

module.exports = {
	createBlockedTimeSlot,
	readBlockedTimeSlot,
	readAllBlockedTimeSlots,
	updateBlockedTimeSlot,
	deleteBlockedTimeSlot,
};
