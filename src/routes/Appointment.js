const express = require("express");
const controller = require("../controllers/Appointment.js");
// eslint-disable-next-line new-cap
const router = express.Router();


router.post("/createAppointment/", controller.createAppointment);
router.get("/getPast5MonthsAppointments/:serviceProviderId", controller.getPast5MonthsAppointments);
// router.get("/get/:appointmentId", controller.readAppointment);
// router.get("/get/", controller.readAllAppointments);
// router.patch("/update/:appointmentId", controller.updateAppointment);
router.delete("/delete-appointment/:appointmentId", controller.cancelAppointment);

module.exports = router;
