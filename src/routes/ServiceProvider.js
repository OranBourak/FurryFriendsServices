const express = require("express");
const controller = require("../controllers/ServiceProvider");

const router = new express.Router();

router.post("/create/", controller.createServiceProvider);
router.post("/login", controller.loginServiceProvider);
router.get("/pass-recovery", controller.getSecurityInfo);
router.get("/get/:serviceProviderId", controller.requireAuth, controller.readServiceProvider);
router.get("/getAppointments/:serviceProviderId", controller.requireAuth, controller.getAppointments);
router.get("/get/", controller.readAllServiceProviders);
router.patch("/update/:serviceProviderId", controller.requireAuth, controller.updateServiceProvider);
router.delete("/delete/:serviceProviderId", controller.deleteServiceProvider);
router.patch("/password-change", controller.updatePassword);
module.exports = router;
