const express = require("express");

const reviewController = require("../controllers/review.controller");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", asyncHandler(reviewController.listReviews));
router.get("/:productId", asyncHandler(reviewController.getReviews));
router.post("/:productId", asyncHandler(reviewController.addReview));
router.patch(
  "/:productId/:reviewId",
  asyncHandler(reviewController.updateReview)
);
router.delete(
  "/:productId/:reviewId",
  asyncHandler(reviewController.removeReview)
);

module.exports = router;