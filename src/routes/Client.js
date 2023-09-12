const express = require("express");
const controller = require("../controllers/Client");

// eslint-disable-next-line new-cap
const router = express.Router();

router.post("/createClient", controller.createClient); // create client
router.get("/get-appointments/:clientId", controller.getClientAppointments); // get all appointments for a specific client
router.post("/login", controller.clientLogin); // login client
router.get("/get/:clientId", controller.readClient); // get client details
// router.get("/get/", controller.readAllClients);
router.patch("/update/:clientId", controller.updateClient);
// router.delete("/delete/:clientId", controller.deleteClient);
router.get("/searchProviders/", controller.searchProviders);
router.get("/getProviderInfo/", controller.getProviderInfo);
router.get("/serviceProviderSchedule/:providerID", controller.getProviderScheduleInfo);
router.patch("/password-change", controller.updatePassword);
router.get("/pass-recovery", controller.getClientByEmail);

module.exports = router;
