/* eslint-disable object-curly-spacing */
/* eslint-disable no-tabs */
/* eslint-disable indent */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// NOTE: date related - consider setting date format for the schema instead of String
const ServiceProviderSchema = new Schema(
	{
		name: { type: String, required: [true, "No user name given!"] },
		email: { type: String, unique: [true, "Email already exists"], required: [true, "No email given!"] },
		password: { type: String, required: [true, "No password given!"] },
		country: { type: String, default: "Israel" },
		image: { type: String, default: '../images/ServiceProvidersImages/default.jpg' },
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
		city: { type: String, required: [true, "No city given!"] },
		gender: {
			type: String,
			enum: ["Male", "Female", "Other"],
			required: [true, "No gender given!"],
		},
		bio: { type: String },
		typeOfService: {
			type: String,
			enum: ["Dog Walker", "Veterinarian", "Dog Groomer"],
			required: [true, "No type of service given!"],
		},
		reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
		averageRating: { type: Number, default: 0},
		blockedDates: [{ type: String }],
		blockedTimeSlots: [{ type: Schema.Types.ObjectId, ref: "BlockedTimeSlot" }],
		appointments: [{ type: Schema.Types.ObjectId, ref: "Appointment" }],
		appointmentTypes: [{ type: Schema.Types.ObjectId, ref: "AppointmentType", default: [] }],
		

	},
	{ versionKey: false, timestamps: true },
);

module.exports = mongoose.model("ServiceProvider", ServiceProviderSchema);
