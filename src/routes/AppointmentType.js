const express = require("express");
const controller = require("../controllers/AppointmentType.js");
// eslint-disable-next-line new-cap
const router = express.Router();

router.post("/create/:serviceProviderId", controller.requireAuth, controller.createAppointmentType);
router.get("/get/:appointmentTypeId", controller.readAppointmentType);
router.get("/get/", controller.readAllAppointmentTypes);
router.patch("/update/:appointmentTypeId", controller.requireAuth, controller.updateAppointmentType);
router.delete("/delete/:appointmentTypeId", controller.deleteAppointmentType);

module.exports = router;
