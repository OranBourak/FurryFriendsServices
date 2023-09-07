/* eslint-disable key-spacing */
/* eslint-disable comma-spacing */
/* eslint-disable object-curly-spacing */
/* eslint-disable no-tabs */
/* eslint-disable indent */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ClientSchema = new Schema(
	{
		name: { type: String, required: [true, "No user name given!"] },
		email: { type: String, unique: true, required: [true, "No email given!"] },
		password: { type: String, required: [true, "No password given!"] },
		country: { type: String, default: "Israel" },
		phone: {
			type: String,
			maxLength: 10,
			minLength: 10,
			required: [true, "No phone given!"],
		},
		question: {
			type: String,
			required: [true, "No security question provided!"],
		},
		answer: { type: String, required: [true, "No security answer provided!"] },
		appointments: [{ type: Schema.Types.ObjectId, ref: "Appointment" }],
	},
	{ versionKey: false, timestamps: true },
);

module.exports = mongoose.model("Client", ClientSchema);
