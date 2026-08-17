const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createWallet,
  getWallets,
  getWalletDetails,
  addUser,
  addBill
} = require('../controllers/sharedWalletController');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createWallet)
  .get(getWallets);

router.route('/:id')
  .get(getWalletDetails);

router.post('/:id/add-user', addUser);
router.post('/:id/bills', addBill);

module.exports = router;
