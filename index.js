const express = require('express');
const axios = require('axios');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3003;

const NSE_API_URL = 'https://www.nseindia.com/api/live-analysis-variations?index=';

// Function to fetch data from the NSE API
async function fetchNseData(index) {
  try {
    const response = await axios.get(`${NSE_API_URL}${index}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data from NSE API:', error);
    throw error; // Re-throw for handling in route handler
  }
}

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'NSE API Documentation',
    version: '1.0.0',
    description: 'This is the API documentation for fetching data from NSE India',
  },
  servers: [
    {
      url: `http://192.168.130.13:${port}`,
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./index.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * /api/nse-data-topgainers-toplossers:
 *   get:
 *     summary: Retrieve NSE data for Top gainers or loosers 
 *     description: Fetch data from NSE India API based on the provided index (gainers or loosers) and return the response. from this api https://www.nseindia.com/api/live-analysis-variations?index=gainers
 *     parameters:
 *       - in: query
 *         name: index
 *         schema:
 *           type: string
 *         required: true
 *         description: The index type (gainers or loosers)
 *     responses:
 *       200:
 *         description: Successful response with NSE data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 * 
 *       400:
 *         description: Missing required index query parameter
 *       500:
 *         description: Error fetching data from NSE API
 */
app.get('/api/nse-data-topgainers-toplossers', async (req, res) => {
  const index = req.query.index;
  if (!index) {
    return res.status(400).send('Index query parameter is required');
  }

  try {
    const data = await fetchNseData(index);
    res.json(data);
  } catch (error) {
    res.status(500).send('Internal server error: Failed to fetch data from NSE API');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
