/* eslint-disable object-curly-spacing */
/* eslint-disable no-tabs */
/* eslint-disable indent */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BlockedTimeSlotSchema = new Schema(
	{
		date: {
			type: String,
			required: [true, "No date provided for blocked time slots!"],
		},
		blockedHours: [
			{
				type: String,
				required: [true, "No blocked hours required for blocked time slots!"],
			},
		],
	},
	{ versionKey: false },
);

module.exports = mongoose.model("BlockedTimeSlot", BlockedTimeSlotSchema);
