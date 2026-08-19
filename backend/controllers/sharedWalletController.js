const SharedWallet = require('../models/SharedWallet');
const SplitBill = require('../models/SplitBill');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const createWallet = async (req, res, next) => {
  try {
    const { name } = req.body;
    const wallet = await SharedWallet.create({
      name,
      members: [req.user._id],
      createdBy: req.user._id
    });
    res.status(201).json({ success: true, data: wallet });
  } catch (error) {
    next(error);
  }
};

const getWallets = async (req, res, next) => {
  try {
    const wallets = await SharedWallet.find({ members: req.user._id })
      .populate('members', 'name email avatar')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: wallets });
  } catch (error) {
    next(error);
  }
};

const getWalletDetails = async (req, res, next) => {
  try {
    const wallet = await SharedWallet.findOne({ _id: req.params.id, members: req.user._id })
      .populate('members', 'name email avatar');
      
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

    const bills = await SplitBill.find({ walletId: wallet._id })
      .populate('paidBy', 'name email avatar')
      .populate('splits.user', 'name')
      .sort({ date: -1 });

    // Calculate Settlements
    const balances = {}; // userId -> balance (+ means they are owed, - means they owe)
    wallet.members.forEach(m => balances[m._id.toString()] = { user: m, amount: 0 });

    bills.forEach(bill => {
      const payerId = bill.paidBy._id.toString();
      if (balances[payerId]) {
        balances[payerId].amount += bill.amount;
      }
      
      bill.splits.forEach(split => {
        const splitUserId = split.user._id.toString();
        if (balances[splitUserId]) {
          balances[splitUserId].amount -= split.amountOwed;
        }
      });
    });

    const settlements = [];
    const debtors = [];
    const creditors = [];

    Object.values(balances).forEach(b => {
      if (b.amount < -0.01) debtors.push({ user: b.user, amount: Math.abs(b.amount) });
      else if (b.amount > 0.01) creditors.push({ user: b.user, amount: b.amount });
    });

    // Simple greedy settlement
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(debtor.amount, creditor.amount);

      settlements.push({
        from: debtor.user,
        to: creditor.user,
        amount: amount
      });

      debtor.amount -= amount;
      creditor.amount -= amount;

      if (debtor.amount < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }

    res.status(200).json({
      success: true,
      data: { wallet, bills, settlements }
    });
  } catch (error) {
    next(error);
  }
};

const addUser = async (req, res, next) => {
  try {
    const { email } = req.body;
    const wallet = await SharedWallet.findOne({ _id: req.params.id, members: req.user._id });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

    const newMember = await User.findOne({ email: email.toLowerCase() });
    if (!newMember) return res.status(404).json({ message: 'User with this email not found' });

    if (wallet.members.includes(newMember._id)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    wallet.members.push(newMember._id);
    await wallet.save();

    res.status(200).json({ success: true, message: 'User added to wallet' });
  } catch (error) {
    next(error);
  }
};

const addBill = async (req, res, next) => {
  try {
    const { amount, description } = req.body;
    const wallet = await SharedWallet.findOne({ _id: req.params.id, members: req.user._id });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

    // Equal split
    const splitAmount = amount / wallet.members.length;
    const splits = wallet.members.map(memberId => ({
      user: memberId,
      amountOwed: splitAmount
    }));

    const bill = await SplitBill.create({
      walletId: wallet._id,
      paidBy: req.user._id,
      amount,
      description,
      splits
    });

    // Create an expense transaction for each member for their share
    const transactionsToCreate = wallet.members.map(memberId => ({
      userId: memberId,
      amount: splitAmount,
      type: 'expense',
      description: `Shared: ${description} (${wallet.name})`,
      date: new Date(),
      paymentMethod: 'Other'
    }));

    await Transaction.insertMany(transactionsToCreate);

    res.status(201).json({ success: true, data: bill });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createWallet,
  getWallets,
  getWalletDetails,
  addUser,
  addBill
};
