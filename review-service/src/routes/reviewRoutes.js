const express = require("express");

const reviewController = require("../controllers/review.controller");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/reviews/:productId", asyncHandler(reviewController.getReviews));
router.post("/reviews/:productId", asyncHandler(reviewController.addReview));
router.patch(
  "/reviews/:productId/:reviewId",
  asyncHandler(reviewController.updateReview)
);
router.delete(
  "/reviews/:productId/:reviewId",
  asyncHandler(reviewController.removeReview)
);

module.exports = router;