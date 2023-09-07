/* eslint-disable new-cap */
const express = require("express");
const controller = require("../controllers/ServiceProvider");

const router = express.Router();

router.post("/create/", controller.createServiceProvider);
router.get("/get/:serviceProviderId", controller.readServiceProvider);
router.get("/get/", controller.readAllServiceProviders);
router.patch("/update/:serviceProviderId", controller.updateServiceProvider);
router.delete("/delete/:serviceProviderId", controller.deleteServiceProvider);

module.exports = router;
