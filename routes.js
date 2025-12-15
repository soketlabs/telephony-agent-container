import express from 'express';
import { create_agent } from '../controllers/create_agent.js ';
const authenticate = require("../controller/auth.js");

const router = express.Router();

// Define API routes
router.get('/create_agent', authenticate.auth, create_agent);

// Add more routes as needed

export default (app) => {
    app.use('/api', router);
};