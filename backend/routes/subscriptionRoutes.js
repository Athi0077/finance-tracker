const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription
} = require('../controllers/subscriptionController');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getSubscriptions)
  .post(createSubscription);

router.route('/:id')
  .put(updateSubscription)
  .delete(deleteSubscription);

module.exports = router;
