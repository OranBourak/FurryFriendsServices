/* eslint-disable comma-dangle */
/* eslint-disable operator-linebreak */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
const mongoose = require("mongoose");
const Review = require("../models/Review");

// GET CONTROLLERS
const readReview = async (req, res) => {
  const reviewId = req.params.reviewId;

  try {
    const review = await Review.findById(reviewId);
    return review
      ? res.status(200).json({ review })
      : res.status(404).json({ message: "Review not found" });
  } catch (error) {
    return res.status(500).json({ error });
  }
};
const readAllReviews = async (_, res) => {
  try {
    const reviews = await Review.find({});
    return res.status(200).json({ reviews });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

// POST CONTROLLERS
const createReview = async (req, res) => {
  const { data } = req.body;
  const review = new Review({
    _id: new mongoose.Types.ObjectId(),
    data,
  });

  try {
    await review.save();
    return res.status(201).json({ review });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

// PATCH CONTROLLERS
const updateReview = async (req, res) => {
  const reviewId = req.params.reviewId;
  try {
    // finding the review by id
    const review = await Review.findById(reviewId);
    if (review) {
      try {
        review.set(req.body);
        await review.save();
        return res.status(201).json({ review });
      } catch (error) {
        res.status(500).json({ error });
      }
    } else {
      res.status(404).json({ message: "Review not found" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

// DELETE CONTROLLERS
const deleteReview = async (req, res) => {
  const reviewId = req.params.reviewId;

  try {
    await Review.findByIdAndDelete(reviewId);
    return res.status(201).json({
      message: reviewId + "Deleted from database!",
    });
  } catch (error) {
    return res.status(500).json({ message: "Review not found" });
  }
};

module.exports = {
  createReview,
  readReview,
  readAllReviews,
  updateReview,
  deleteReview,
};
