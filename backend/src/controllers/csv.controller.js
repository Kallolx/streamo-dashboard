const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const CsvUpload = require('../models/csvUpload.model');
const Transaction = require('../models/transaction.model');

/**
 * CSV Controller
 * Handles operations related to CSV uploads and processing
 */
const csvController = {
  /**
   * Upload a CSV file
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  uploadCsv: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      // Create new CSV upload record
      const csvUpload = new CsvUpload({
        fileName: req.file.filename,
        originalFileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedBy: req.user.id,
        status: 'pending'
      });

      // Save the upload record
      await csvUpload.save();

      // Start processing the CSV in the background
      processCsvFile(csvUpload._id, req.file.path);

      return res.status(201).json({
        success: true,
        message: 'CSV uploaded successfully',
        upload: {
          id: csvUpload._id,
          fileName: csvUpload.originalFileName,
          status: csvUpload.status,
          createdAt: csvUpload.createdAt
        }
      });
    } catch (error) {
      console.error('Error uploading CSV:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload CSV',
        error: error.message
      });
    }
  },

  /**
   * Get the status of a CSV upload
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getCsvStatus: async (req, res) => {
    try {
      const { id } = req.params;
      
      const csvUpload = await CsvUpload.findById(id);
      
      if (!csvUpload) {
        return res.status(404).json({
          success: false,
          message: 'CSV upload not found'
        });
      }

      return res.status(200).json({
        success: true,
        upload: {
          id: csvUpload._id,
          fileName: csvUpload.originalFileName,
          status: csvUpload.status,
          processedRows: csvUpload.processedRows,
          totalRows: csvUpload.totalRows,
          progress: csvUpload.progress,
          errorMessage: csvUpload.errorMessage,
          createdAt: csvUpload.createdAt,
          completedAt: csvUpload.completedAt
        }
      });
    } catch (error) {
      console.error('Error getting CSV status:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get CSV status',
        error: error.message
      });
    }
  },

  /**
   * Get a list of all CSV uploads with pagination
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getCsvUploads: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status || null;
      
      const skip = (page - 1) * limit;
      
      const query = {};
      if (status) {
        query.status = status;
      }
      
      const total = await CsvUpload.countDocuments(query);
      const csvUploads = await CsvUpload.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('uploadedBy', 'username email');
      
      const uploads = csvUploads.map(upload => ({
        id: upload._id,
        fileName: upload.originalFileName,
        status: upload.status,
        processedRows: upload.processedRows,
        totalRows: upload.totalRows,
        progress: upload.progress,
        errorMessage: upload.errorMessage,
        uploadedBy: {
          id: upload.uploadedBy._id,
          username: upload.uploadedBy.username,
          email: upload.uploadedBy.email
        },
        createdAt: upload.createdAt,
        completedAt: upload.completedAt
      }));

      return res.status(200).json({
        success: true,
        uploads,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting CSV uploads:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get CSV uploads',
        error: error.message
      });
    }
  },

  /**
   * Delete a CSV upload
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteCsvUpload: async (req, res) => {
    try {
      const { id } = req.params;
      
      const csvUpload = await CsvUpload.findById(id);
      
      if (!csvUpload) {
        return res.status(404).json({
          success: false,
          message: 'CSV upload not found'
        });
      }

      // Delete the file from the filesystem
      if (fs.existsSync(csvUpload.filePath)) {
        fs.unlinkSync(csvUpload.filePath);
      }

      // Delete the record from the database
      await CsvUpload.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: 'CSV upload deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting CSV upload:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete CSV upload',
        error: error.message
      });
    }
  }
};

/**
 * Process a CSV file in the background
 * @param {String} uploadId - The ID of the CSV upload
 * @param {String} filePath - The path to the CSV file
 */
async function processCsvFile(uploadId, filePath) {
  try {
    const csvUpload = await CsvUpload.findById(uploadId);
    
    if (!csvUpload) {
      console.error(`CSV upload with ID ${uploadId} not found`);
      return;
    }

    // Update status to processing
    csvUpload.status = 'processing';
    await csvUpload.save();

    // Count total rows first
    let totalRows = 0;
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', () => {
        totalRows++;
      })
      .on('end', async () => {
        // Update total rows count
        csvUpload.totalRows = totalRows;
        await csvUpload.save();
        
        // Now process and save each row
        let processedRows = 0;
        let hasErrors = false;
        let errors = [];
        let rows = [];
        
        // First, read all rows into memory to avoid async processing issues
        await new Promise((resolve, reject) => {
          fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
              rows.push(row);
            })
            .on('end', () => {
              resolve();
            })
            .on('error', (error) => {
              reject(error);
            });
        });
        
        // Now process rows sequentially to avoid race conditions
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const rowIndex = i + 1; // Use 1-based indexing
          
          try {
            // Log the first row to understand the structure
            if (i === 0) {
              console.log('CSV first row structure:', row);
            }
            
            // Extract only the fields we need for transactions
            // Prioritize common CSV formats for distribution reports
            const transaction = new Transaction({
              // Required tracking fields
              csvUploadId: csvUpload._id,
              rowNumber: rowIndex,
              transactionId: `TRANS-${csvUpload._id}-${rowIndex}`,
              
              // Basic release information
              title: row['Title'] || row['Track Name'] || row['Release Title'] || row['Release'] || 
                    row['Song Title'] || row['Child Asset Title/Name'] || row['Parent Asset Title/Name'] || '',
              artist: row['Artist'] || row['Artist Name'] || row['Primary Artist'] || '',
              isrc: row['ISRC'] || row['isrc'] || row['International Standard Recording Code'] || 
                    row['Child Asset Identifier'] || '',
              upc: row['UPC'] || row['upc'] || row['Universal Product Code'] || 
                   row['Parent Asset Identifier'] || '',
              
              // Service information
              serviceType: row['Service'] || row['Platform'] || row['DSP'] || row['Store'] || row['Partner'] || '',
              territory: row['Country'] || row['Territory'] || row['Region'] || '',
              transactionType: row['Type'] || row['Transaction Type'] || row['Channel'] || 'stream',
              
              // Financial information
              quantity: parseInt(row['Quantity'] || row['Streams'] || row['Units'] || row['Plays'] || row['Count'] || '0', 10) || 0,
              currency: row['Currency'] || 'USD',
              revenue: parseFloat(row['Gross Revenue in USD'] || row['Revenue'] || row['Earnings'] || row['Amount'] || '0') || 0,
              revenueUSD: parseFloat(row['Amount Due in USD'] || row['Net Revenue in USD'] || 
                                    row['Revenue (USD)'] || row['Earnings (USD)'] || row['USD Amount'] || row['Amount'] || '0') || 0,
              
              // Additional information
              label: row['Label'] || row['Label Name'] || '',
              transactionDate: new Date(row['Transaction Month'] || row['Date'] || row['Transaction Date'] || new Date()),
              notes: row['Notes'] || '',
              
              // Store raw data for debugging
              rawData: row
            });
            
            await transaction.save();
            processedRows++;
            
            // Update progress periodically
            if (processedRows % 5 === 0 || processedRows === rows.length) {
              const progress = Math.floor((processedRows / rows.length) * 100);
              csvUpload.processedRows = processedRows;
              csvUpload.progress = progress;
              await csvUpload.save();
            }
          } catch (error) {
            hasErrors = true;
            const errorMsg = `Error processing row ${rowIndex}: ${error.message}`;
            errors.push(errorMsg);
            console.error(errorMsg);
          }
        }
        
        // Update final status
        csvUpload.processedRows = processedRows;
        csvUpload.progress = 100;
        csvUpload.status = hasErrors ? 'completed_with_errors' : 'completed';
        csvUpload.completedAt = new Date();
        
        // Store limited number of errors to avoid very large documents
        if (errors.length > 0) {
          csvUpload.errorMessage = errors.slice(0, 10).join('\n') + 
            (errors.length > 10 ? `\n...and ${errors.length - 10} more errors` : '');
        }
        
        await csvUpload.save();
        
        console.log(`CSV processing completed. Total rows: ${rows.length}, Processed: ${processedRows}, Errors: ${errors.length}`);
      })
      .on('error', async (error) => {
        csvUpload.status = 'failed';
        csvUpload.errorMessage = error.message;
        await csvUpload.save();
        
        console.error('Error counting CSV rows:', error);
      });
  } catch (error) {
    console.error('Error in processCsvFile:', error);
    
    try {
      await CsvUpload.findByIdAndUpdate(uploadId, {
        status: 'failed',
        errorMessage: error.message
      });
    } catch (updateError) {
      console.error('Error updating CSV upload status:', updateError);
    }
  }
}

module.exports = csvController; 