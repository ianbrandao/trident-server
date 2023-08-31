const express = require('express');
const http = require('http');
const { EventSourcePolyfill } = require('event-source-polyfill');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const corsOptions = {
  origin: `https://trident-beryl.vercel.app/`, // Update with the correct origin
};

app.use(express.json());
app.use(cors(corsOptions));

const clients: any[] = []; // Store connected clients
const pauseClients: any[] = []; // Store connected clients for pause events

// Create a single instance of EventSourcePolyfill for updates
const eventSourceUpdates = new EventSourcePolyfill(`https://trident-server.vercel.app/admin-updates`);

// Route for handling updates
app.get('/admin-updates', (req: { on: (arg0: string, arg1: () => void) => void; }, res: { setHeader: (arg0: string, arg1: string) => void; }) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');

  clients.push(res);

  req.on('close', () => {
    const index = clients.indexOf(res);
    if (index !== -1) {
      clients.splice(index, 1);
      console.log('SSE connection closed - Updates');
    }
  });
});

// Route for handling pause events
app.get('/pause', (req: { on: (arg0: string, arg1: () => void) => void; }, res: { setHeader: (arg0: string, arg1: string) => void; }) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');

  pauseClients.push(res);

  req.on('close', () => {
    const index = pauseClients.indexOf(res);
    if (index !== -1) {
      pauseClients.splice(index, 1);
      console.log('SSE connection closed - Pause');
    }
  });
});

// Route to trigger updates to connected clients
app.get('/trigger-button', (req: { query: { text: any; }; }, res: { send: (arg0: string) => void; }) => {
  const text = req.query.text; // Use the provided text value or default to 0
  console.log('Triggering event:', text);
  
  // Handle different event types based on text value
  if (text === 'pause') {
    pauseClients.forEach(p => p.write(`data: ${text}\n\n`));
  } else {
    clients.forEach(client => client.write(`data: ${text}\n\n`));
  }

  res.send('Event triggered successfully');
});

server.listen(3001, () => {
  console.log('Server listening on port 3001');
});
