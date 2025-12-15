import { createAgentService } from "../controllers/agent.js";

export async function createAgent(req, res) {
    try {
        const userId = req.user.id;
        const payload = req.body;

        const agent = await createAgentService(userId, payload);

        res.json({ success: true, agent });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
}
