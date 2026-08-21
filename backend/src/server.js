require('dotenv').config();
const { createApp } = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 4000;

async function start() {
  await connectDB();
  const app = createApp();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`MedReach backend listening on port ${PORT}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', err);
  process.exit(1);
});
