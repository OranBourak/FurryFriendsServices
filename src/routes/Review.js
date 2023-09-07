/* eslint-disable new-cap */
const express = require("express");
const controller = require("../controllers/Review");

const router = express.Router();

router.post("/create/", controller.createReview);
router.get("/get/:reviewId", controller.readReview);
router.get("/get/", controller.readAllReviews);
router.patch("/update/:reviewId", controller.updateReview);
router.delete("/delete/:reviewId", controller.deleteReview);

module.exports = router;
