const reviewService = require("../services/review.service");

async function getReviews(req, res) {
  const reviews = await reviewService.getReviewsByProductId(req.params.productId);
  res.status(200).json(reviews);
}

async function addReview(req, res) {
  const review = await reviewService.addReview(req.params.productId, req.body);
  res.status(200).json(review);
}

async function updateReview(req, res) {
  const review = await reviewService.updateReview(
    req.params.productId,
    req.params.reviewId,
    req.body.userId,
    req.body
  );
  res.status(200).json(review);
}

async function removeReview(req, res) {
  const result = await reviewService.removeReview(req.params.productId, req.params.reviewId, req.body.userId);
  res.status(200).json(result);
}

module.exports = {
  getReviews,
  addReview,
  updateReview,
  removeReview,
};