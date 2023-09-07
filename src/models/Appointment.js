/* eslint-disable object-curly-spacing */
/* eslint-disable no-tabs */
/* eslint-disable indent */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Appointment: State: String (Upcoming, Completed, Canceled), Date: Date(), Hour: String?, Client = Client

const AppointmentSchema = new Schema(
	{
		client_id: {
			type: Schema.Types.ObjectId,
			ref: "Client",
			required: [true, "No clientId given to appointment!"],
		},
		serviceProvider_id: {
			type: Schema.Types.ObjectId,
			ref: "ServiceProvider",
			required: [true, "No serviceProviderId given to appointment!"],
		},
		status: {
			type: String,
			enum: ["Upcoming", "Completed", "Canceled"],
			required: [true, "No status given to appointment!"],
		},
		appointmentType: {
			type: String,
			required: [true, "No appointment type given to set the appointment!"],
		},
		date: { type: Date },
		duration: {
			type: Number,
			required: [true, "No appointment duration given!"],
		},
	},
	{ versionKey: false, timestamps: true },
);

const AppointmentTypeSchema = new Schema({
	name: { type: String, required: [true, "No appointment type name given!"] },
	price: { type: Number, required: [true, "No appointment type price given!"] },
	duration: {
		type: Number,
		required: [true, "No appointment type duration given!"],
	},
});

module.exports = mongoose.model("Appointment", AppointmentSchema);
module.exports = mongoose.model("AppointmentType", AppointmentTypeSchema);
