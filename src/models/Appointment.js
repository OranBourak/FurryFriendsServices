const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Appointment: State: String (Upcoming, Completed, Canceled), Date: Date(), Hour: String?, Client = Client

const AppointmentSchema = new Schema(
    {
        clientId: {
            type: Schema.Types.ObjectId,
            ref: "Client",
            required: [true, "No clientId given to appointment!"],
        },
        serviceProviderId: {
            type: Schema.Types.ObjectId,
            ref: "ServiceProvider",
            required: [true, "No serviceProviderId given to appointment!"],
        },
        status: {
            type: String,
            enum: ["Upcoming", "Completed", "Canceled"],
            default: "Upcoming",
            required: [true, "No status given to appointment!"],
        },
        appointmentType: {
            type: mongoose.Types.ObjectId,
            ref: "AppointmentType",
            required: [true, "No appointment type given to set the appointment!"],
        },
        date: {type: Date},
        duration: {
            type: Number,
            required: [true, "No appointment duration given!"],
        },
        review: {
            type: Schema.Types.ObjectId,
            required: false,
            default: null,
        },
    },
    {versionKey: false, timestamps: true},
);


module.exports = mongoose.model("Appointment", AppointmentSchema);
