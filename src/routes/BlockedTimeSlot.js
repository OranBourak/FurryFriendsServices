/* eslint-disable new-cap */
const express = require("express");
const controller = require("../controllers/BlockedTimeSlot");

const router = express.Router();

router.post("/create/:serviceProviderId", controller.createBlockedTimeSlot);
router.get("/get/:blockedTimeSlotId", controller.readBlockedTimeSlot);
router.get("/get/", controller.readAllBlockedTimeSlots);
router.patch("/update/:blockedTimeSlotId", controller.updateBlockedTimeSlot);
router.delete("/delete/:blockedTimeSlotId", controller.deleteBlockedTimeSlot);

module.exports = router;
