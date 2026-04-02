const Review = require("../models/review.model");
const ApiError = require("../utils/apiError");

function normalizeProductId(productId) {
  const value = String(productId || "").trim();
  if (!value) {
    throw new ApiError(400, "productId is required");
  }
  return value;
}

function validateAddReviewPayload(payload) {
  const requiredFields = ["userId", "rating"];

  for (const field of requiredFields) {
    if (
      payload[field] === undefined ||
      payload[field] === null ||
      String(payload[field]).trim() === ""
    ) {
      throw new ApiError(400, `${field} is required`);
    }
  }

  if (typeof payload.rating !== "number" || payload.rating < 1 || payload.rating > 5) {
    throw new ApiError(400, "rating must be a number between 1 and 5");
  }
}

async function getReviewsByProductId(productId) {
  const normalizedProductId = normalizeProductId(productId);
  const reviews = await Review.find({ productId: normalizedProductId });
  return reviews.map(review => review.toClient());
}

function resolveReview(reviews, reviewId) {
  const normalizedId = String(reviewId || "").trim();
  if (!normalizedId) {
    throw new ApiError(400, "reviewId is required");
  }

  return reviews.find(review => review._id.toString() === normalizedId);
}

async function addReview(productId, reviewPayload) {
  validateAddReviewPayload(reviewPayload);
  const normalizedProductId = normalizeProductId(productId);

  const review = await Review.create({
    userId: String(reviewPayload.userId).trim(),
    productId: normalizedProductId,
    rating: reviewPayload.rating,
    comment: String(reviewPayload.comment || "").trim(),
  });

  return review.toClient();
}

async function updateReview(productId, reviewId, userId, payload) {
  const normalizedProductId = normalizeProductId(productId);
  const reviews = await Review.find({ productId: normalizedProductId });
  const review = resolveReview(reviews, reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  if (review.userId !== userId) {
    throw new ApiError(403, "You can only update your own reviews");
  }

  if (payload.rating !== undefined) {
    if (typeof payload.rating !== "number" || payload.rating < 1 || payload.rating > 5) {
      throw new ApiError(400, "rating must be a number between 1 and 5");
    }
    review.rating = payload.rating;
  }

  if (payload.comment !== undefined) {
    review.comment = String(payload.comment || "").trim();
  }

  await review.save();
  return review.toClient();
}

async function removeReview(productId, reviewId, userId) {
  const normalizedProductId = normalizeProductId(productId);
  const reviews = await Review.find({ productId: normalizedProductId });
  const review = resolveReview(reviews, reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  if (review.userId !== userId) {
    throw new ApiError(403, "You can only delete your own reviews");
  }

  await Review.deleteOne({ _id: review._id });
  return { message: "Review deleted" };
}

async function listAllReviews() {
  const reviews = await Review.find({}).sort({ createdAt: -1 });
  return reviews.map((r) => r.toClient());
}

module.exports = {
  getReviewsByProductId,
  listAllReviews,
  addReview,
  updateReview,
  removeReview,
};