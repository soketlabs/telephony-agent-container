import { randomUUID } from "crypto";
import { Agent } from "../../models.js";
import { getDocker } from "../utils/docker.js";

export async function createAgentService(userId, data) {
    const uuid = randomUUID();

    const docker = await getDocker();
    const containerName = `agent-${uuid}`;

    // Create container
    const container = await docker.containerCreate({
        name: containerName,
        Image: "put agent image name here", 
        Cmd: ["node", "index.js"],        
        Env: [
            `UUID=${uuid}`,
            `PHONE=${data.phone ?? ""}`,
            `NAME=${data.name ?? ""}`,
            `LANGUAGE=${data.language ?? ""}`,
            `WORKFLOW=${data.workflow ?? ""}`
        ]
    });

    await docker.containerStart({ id: container.id });

    // Save to Mongo
    return await Agent.create({
        uuid,
        name: data.name,
        phone: data.phone,
        workflow: data.workflow,
        language: data.language,
        containerId: container.id,
        containerName,
        userId
    });
}
