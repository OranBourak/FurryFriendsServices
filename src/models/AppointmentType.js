/* eslint-disable object-curly-spacing */
/* eslint-disable no-tabs */
/* eslint-disable indent */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// NOTE: date related - consider setting date format for the schema instead of String
const AppointmentTypeSchema = new Schema(
	{
		name: { type: String, required: [true, "No user name given!"] },
		price: { type: Number, min: 0, required: [true, "No price given!"] },
        duration: { type: Number, enum: [1, 2, 3, 4, 5], required: [true, "No duration given!"] },
	},
	{ versionKey: false, timestamps: true },
);

module.exports = mongoose.model("AppointmentType", AppointmentTypeSchema);
