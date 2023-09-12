const express = require("express");
const controller = require("../controllers/BlockedTimeSlot");

// eslint-disable-next-line new-cap
const router = express.Router();

router.post("/create/:serviceProviderId", controller.createBlockedTimeSlot);
router.get("/get/:blockedTimeSlotId", controller.readBlockedTimeSlot);
router.get("/get/", controller.readAllBlockedTimeSlots);
router.patch("/update/:blockedTimeSlotId", controller.updateBlockedTimeSlot);
router.delete("/delete/:blockedTimeSlotId", controller.deleteBlockedTimeSlot);

module.exports = router;
