const express = require('express');
const http = require('http');
const cors = require('cors');
const { Client } = require('pg'); // Import the PostgreSQL Client
require('dotenv').config();

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors({
  origin: 'https://trident-sigma.vercel.app',
  optionsSuccessStatus: 200
}));

// Route to trigger updates to connected clients
app.get('/trigger-button', async (req, res) => {
  try {
    const newHashtag = req.query.text || '';

    // Connect to the PostgreSQL database
    const dbClient = new Client({
      connectionString: process.env.POSTGRES_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });
    await dbClient.connect();

    // Update the hashtag in the settings table
    const updateQuery = `
      UPDATE trident
      SET hashtags = $1
      WHERE id = 1`;
    await dbClient.query(updateQuery, [newHashtag]);

    // Close the database connection
    await dbClient.end();

    res.status(200).json({ message: 'Hashtag updated successfully' });
  } catch (error) {
    console.error('Error updating hashtag:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
});

server.listen(3001, () => {
  console.log('Server listening on port 3001');
});
