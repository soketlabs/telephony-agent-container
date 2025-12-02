import express from 'express';
import { create_agent } from '../controllers/create_agent.js ';

const router = express.Router();

// Define API routes
router.get('/create_agent', create_agent);

// Add more routes as needed

export default (app) => {
    app.use('/api', router);
};