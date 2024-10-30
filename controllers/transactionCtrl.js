const transactionModel = require('../models/transactionModel');
const moment = require('moment');

// Fetch all transactions
const getAllTransaction = async (req, res) => {
    try {
        const { frequency, selectedDate, userid, type } = req.body;

        // Build the query based on frequency or custom date range
        const dateFilter = frequency !== 'custom' 
            ? { date: { $gt: moment().subtract(Number(frequency), 'days').toDate() } }
            : { date: { $gte: moment(selectedDate[0]).toDate(), $lte: moment(selectedDate[1]).toDate() } };

        const transactions = await transactionModel.find({
            ...dateFilter,
            userid,
            ...(type !== 'all' && { type })
        });

        res.status(200).json(transactions);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ error: "Failed to fetch transactions" });
    }
};

const deleteTransaction = async (req, res) => {
    try {
        await transactionModel.findOneAndDelete({_id: req.body.transactionId})
        res.status(200).send('Transaction Deleted')
    } catch (error) {
       console.log(error)
       res.status(500).json(error) 
    }
}

// Edit a transaction
const editTransaction = async (req, res) => {
    try {
        const { transactionId, payload } = req.body;
        
        // Ensure the transaction ID is provided
        if (!transactionId) {
            return res.status(400).json({ error: "Transaction ID is required" });
        }

        await transactionModel.findByIdAndUpdate(transactionId, payload);

        res.status(200).json({ message: "Transaction updated successfully" });
    } catch (error) {
        console.error("Error updating transaction:", error);
        res.status(500).json({ error: "Failed to update transaction" });
    }
};

// Add a new transaction
const addTransaction = async (req, res) => {
    try {
        const newTransaction = new transactionModel(req.body);  
        await newTransaction.save();
        res.status(201).json({ message: 'Transaction created successfully' });
    } catch (error) {
        console.error("Error adding transaction:", error);
        res.status(500).json({ error: "Failed to add transaction" });
    }
};

module.exports = { getAllTransaction, addTransaction, editTransaction, deleteTransaction };
