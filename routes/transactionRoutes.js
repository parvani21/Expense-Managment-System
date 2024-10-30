const express = require("express");
const { addTransaction, getAllTransaction, editTransaction, deleteTransaction } = require("../controllers/transactionCtrl");

// Router object
const router = express.Router();

// Routes
// Add transaction (POST method)
router.post('/add-transaction', addTransaction);

// Edit transaction (POST method)
router.post('/edit-transaction', editTransaction);

// Delete transaction (POST method)
router.post('/delete-transaction', deleteTransaction);

// Get all transactions (POST method)
router.post("/get-transaction", getAllTransaction);

module.exports = router;
