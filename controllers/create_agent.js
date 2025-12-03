// import { uuidv4 } from 'uuid';
import { DockerClient } from '@docker/node-sdk';

// const docker = await DockerClient.fromDockerConfig();

// const containers = await docker.containerList({ all: true });
// console.dir(containers);

export function set_config(data_config) {
    global.data_config = data_config;
}

export async function createAgent(data_config) {
    // Logic to create and return an agent instance
    // var Docker = require('dockerode');
    // var docker = new Docker();
    const docker = await DockerClient.fromDockerConfig();
    console.log("Docker client initialized");
    // const containers = await docker.containerList({ all: true });
    // console.log(containers);
    // const uuid = uuidv4();
    set_config(data_config)
    // const agent = {
    //     id: uuid,
    //     name: 'Telephony Test Agent',
    //     number: "+91 80 3573 9375",
    //     // Additional agent properties and methods
    // };
    // return agent;
}