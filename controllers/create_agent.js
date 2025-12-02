import { v4 as uuidv4 } from 'uuid';

export function set_config(data_config) {
    global.data_config = data_config;
}

export function createAgent(data_config) {
    // Logic to create and return an agent instance
    var Docker = require('dockerode');
    var docker = new Docker();
    const uuid = uuidv4();
    set_config(data_config)
    const agent = {
        id: uuid,
        name: 'Telephony Test Agent',
        number: "+91 80 3573 9375",
        // Additional agent properties and methods
    };
    return agent;
}