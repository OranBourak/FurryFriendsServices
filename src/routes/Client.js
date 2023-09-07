/* eslint-disable new-cap */
const express = require("express");
const controller = require("../controllers/Client");

const router = express.Router();

router.post("/create/", controller.createClient);
router.get("/get/:clientId", controller.readClient);
router.get("/get/", controller.readAllClients);
// router.get("/searchProviders/", controller.searchProviders);
router.patch("/update/:clientId", controller.updateClient);
router.delete("/delete/:clientId", controller.deleteClient);

module.exports = router;
