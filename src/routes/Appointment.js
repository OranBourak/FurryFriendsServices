/* eslint-disable object-curly-spacing */
/* eslint-disable new-cap */
const express = require("express");
const controller = require("../controllers/Appointment.js");
const router = express.Router();

router.post("/create/", controller.createAppointment);
router.get("/get/:appointmentId", controller.readAppointment);
router.get("/get/", controller.readAllAppointments);
router.patch("/update/:appointmentId", controller.updateAppointment);
router.delete("/delete/:appointmentId", controller.deleteAppointment);

module.exports = router;
