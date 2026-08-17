const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  addContribution,
  withdrawContribution
} = require('../controllers/goalController');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getGoals)
  .post(createGoal);

router.route('/:id')
  .put(updateGoal)
  .delete(deleteGoal);

router.post('/:id/contributions', addContribution);
router.delete('/:id/contributions/:contributionId', withdrawContribution);

module.exports = router;
