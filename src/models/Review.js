/* eslint-disable object-curly-spacing */
/* eslint-disable no-tabs */
/* eslint-disable indent */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReviewSchema = new Schema(
	{
		serviceProvider_id: {
			type: Schema.Types.ObjectId,
			ref: "ServiceProvider",
			required: [true, "No serviceProvider id entered!"],
		},
		client_id: {
			type: Schema.Types.ObjectId,
			ref: "Client",
			required: [true, "No client id entered!"],
		},
		rating: {
			type: Number,
			min: 1,
			max: 5,
			required: [true, "No rating entered!"],
		},
		comment: { type: String },
	},
	{ versionKey: false, timestamps: true },
);

module.exports = mongoose.model("Review", ReviewSchema);
