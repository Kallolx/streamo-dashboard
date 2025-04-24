const Transaction = require('../models/transaction.model');

/**
 * Transaction Controller
 * Handles operations related to transaction data
 */
const transactionController = {
  /**
   * Get all transactions with pagination and filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getTransactions: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      
      // Build query based on filters
      const query = {};
      
      // Apply filters if provided
      if (req.query.artist) {
        query.artist = { $regex: req.query.artist, $options: 'i' };
      }
      
      if (req.query.title) {
        query.title = { $regex: req.query.title, $options: 'i' };
      }
      
      if (req.query.serviceType) {
        query.serviceType = req.query.serviceType;
      }
      
      if (req.query.territory) {
        query.territory = req.query.territory;
      }
      
      if (req.query.startDate && req.query.endDate) {
        query.transactionDate = {
          $gte: new Date(req.query.startDate),
          $lte: new Date(req.query.endDate)
        };
      } else if (req.query.startDate) {
        query.transactionDate = { $gte: new Date(req.query.startDate) };
      } else if (req.query.endDate) {
        query.transactionDate = { $lte: new Date(req.query.endDate) };
      }
      
      // Get total count for pagination
      const total = await Transaction.countDocuments(query);
      
      // Get transactions with pagination
      const transactions = await Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      return res.status(200).json({
        success: true,
        data: transactions,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting transactions:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get transactions',
        error: error.message
      });
    }
  },

  /**
   * Get a transaction by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getTransactionById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const transaction = await Transaction.findById(id);
      
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: transaction
      });
    } catch (error) {
      console.error('Error getting transaction:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get transaction',
        error: error.message
      });
    }
  },

  /**
   * Get a summary of transactions for analytics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getTransactionSummary: async (req, res) => {
    try {
      // Apply filters if provided
      const query = {};
      
      if (req.query.startDate && req.query.endDate) {
        query.transactionDate = {
          $gte: new Date(req.query.startDate),
          $lte: new Date(req.query.endDate)
        };
      } else if (req.query.startDate) {
        query.transactionDate = { $gte: new Date(req.query.startDate) };
      } else if (req.query.endDate) {
        query.transactionDate = { $lte: new Date(req.query.endDate) };
      }
      
      // Get total revenue and streams
      const totalResults = await Transaction.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$revenueUSD' },
            totalStreams: { $sum: '$quantity' },
            transactionCount: { $sum: 1 }
          }
        }
      ]);
      
      const totals = totalResults.length > 0 ? totalResults[0] : {
        totalRevenue: 0,
        totalStreams: 0,
        transactionCount: 0
      };
      
      // Get revenue by service type
      const serviceRevenue = await Transaction.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$serviceType',
            revenue: { $sum: '$revenueUSD' },
            streams: { $sum: '$quantity' }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 }
      ]);
      
      // Get revenue by territory
      const territoryRevenue = await Transaction.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$territory',
            revenue: { $sum: '$revenueUSD' },
            streams: { $sum: '$quantity' }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 }
      ]);
      
      // Get revenue by month
      const monthlyRevenue = await Transaction.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              year: { $year: '$transactionDate' },
              month: { $month: '$transactionDate' }
            },
            revenue: { $sum: '$revenueUSD' },
            streams: { $sum: '$quantity' }
          }
        },
        {
          $project: {
            _id: 0,
            year: '$_id.year',
            month: '$_id.month',
            revenue: 1,
            streams: 1
          }
        },
        { $sort: { year: 1, month: 1 } }
      ]);
      
      // Format response
      const formattedServiceRevenue = serviceRevenue.map(item => ({
        service: item._id || 'Unknown',
        revenue: item.revenue,
        streams: item.streams
      }));
      
      const formattedTerritoryRevenue = territoryRevenue.map(item => ({
        territory: item._id || 'Unknown',
        revenue: item.revenue,
        streams: item.streams
      }));
      
      return res.status(200).json({
        success: true,
        summary: {
          totalRevenue: totals.totalRevenue || 0,
          totalStreams: totals.totalStreams || 0,
          transactionCount: totals.transactionCount || 0
        },
        serviceRevenue: formattedServiceRevenue,
        territoryRevenue: formattedTerritoryRevenue,
        monthlyRevenue
      });
    } catch (error) {
      console.error('Error getting transaction summary:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get transaction summary',
        error: error.message
      });
    }
  },

  /**
   * Delete a transaction by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteTransaction: async (req, res) => {
    try {
      const { id } = req.params;
      
      const transaction = await Transaction.findById(id);
      
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }
      
      await Transaction.findByIdAndDelete(id);
      
      return res.status(200).json({
        success: true,
        message: 'Transaction deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete transaction',
        error: error.message
      });
    }
  }
};

module.exports = transactionController; 