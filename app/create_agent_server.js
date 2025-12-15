const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const { connectDB } = require("./db.js");
// const middleware = require('./middleware');
// const config = require('./config');
import { createAgent, set_config } from '../controllers/create_agent';


const app = express();
const PORT = process.env.API_SERVER_PORT || 4008;

connectDB

// Middleware setup
app.use(bodyParser.json());

// Routes setup
app.use('/api', routes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});