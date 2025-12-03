import { DockerClient } from '@docker/node-sdk';
import fs from 'fs';
import path from 'path';
import tar from 'tar-fs';

const docker = await DockerClient.fromDockerConfig();

/**
 * Builds a Docker image from a specified directory containing a Dockerfile.
 * @param {string} contextPath - The file path to the directory containing the Dockerfile and source code.
 * @param {string} imageName - The tag name for the new Docker image (e.g., 'my-app:latest').
 * @returns {Promise<string>} The image name on successful build.
 */
export async function buildImageFromRepo(contextPath, imageName) {
  console.log(`Starting image build for: ${imageName} from context: ${contextPath}`);

  const tarStream = tar.pack(contextPath);

  try {
    // imageBuild returns an async generator of JSON messages
    const build =  docker.imageBuild(tarStream, { tag: imageName });

    // Wait for build to finish and print output
    // for await (const msg of build) {
    //   if (msg.stream) process.stdout.write(msg.stream);
    //   if (msg.error) throw new Error(msg.error);
    // }

    console.log(`Image ${imageName} built successfully.`);
    return imageName;

  } catch (error) {
    console.error(`Image build failed: ${error.message}`);
    throw error;
  }
}

/**
 * Creates and runs a container from a specified image name.
 * @param {string} imageName - The name of the Docker image to use.
 * @param {string} containerName - The desired name for the container.
 * @returns {Promise<object>} The container information object.
 */
export async function createAndRunContainer(imageName, containerName) {
  console.log(`Creating and running container: ${containerName}`);

  try {
    // Use containerCreate instead of container.create
    const createResponse = await docker.containerCreate({
      Image: imageName,
      HostConfig: {
        PortBindings: {
          '3389/tcp': [{ HostPort: '0' }]
        }
      },
      ExposedPorts: {
        '3389/tcp': {}
      }
    }, { name: containerName });

    // Start the container using its ID
    await docker.containerStart(createResponse.id);

    // Inspect the container for details
    const containerInfo = await docker.containerInspect(createResponse.id);
    console.log(`Container ${containerName} started with ID: ${createResponse.id}`);
    console.log(`Container network settings:`, containerInfo.NetworkSettings.Ports);
    return containerInfo;

  } catch (error) {
    console.error(`Failed to run container ${containerName}: ${error.message}`);
    throw error;
  }
}

/**
 * Retrieves detailed information about a running or stopped container by name or ID.
 * @param {string} identifier - The container name or ID.
 * @returns {Promise<object>} Detailed container inspection data.
 */
export async function getContainerInfo(identifier) {
  try {
    const container = docker.container.get(identifier);
    const info = await container.inspect();
    console.log(`Information retrieved for container: ${identifier}`);
    return info;

  } catch (error) {
    console.error(`Could not retrieve info for container ${identifier}: ${error.message}`);
    throw error;
  }
}

/**
 * Builds a Docker image and runs a container with custom npm command arguments.
 * @param {string} contextPath - The file path to the directory containing the Dockerfile.
 * @param {string} imageName - The tag name for the new Docker image.
 * @param {string} containerName - The desired name for the container.
 * @param {object} dataConfig - Configuration object to pass as --data-config JSON argument.
 * @returns {Promise<object>} The container information object.
 */
export async function buildAndRunWithConfig(contextPath, imageName, containerName, dataConfig = {}) {
  console.log(`Building image: ${imageName} from context: ${contextPath}`);
  
  try {
    await buildImageFromRepo(contextPath, imageName);
    
    const configJson = JSON.stringify(dataConfig);

    // Use containerCreate from DockerClient
    const createResponse = await docker.containerCreate({
      Image: imageName,
      Cmd: ['npm', 'start', `--data-config='${configJson}'`],
      HostConfig: {
        PortBindings: {
          '3389/tcp': [{ HostPort: '0' }]
        }
      },
      ExposedPorts: {
        '3389/tcp': {}
      }
    }, { name: containerName });

    await docker.containerStart(createResponse.id);

    const containerInfo = await docker.containerInspect(createResponse.id);
    console.log(`Container ${containerName} started with ID: ${createResponse.id}`);
    console.log(`Container network settings:`, containerInfo.NetworkSettings.Ports);
    
    return containerInfo;

  } catch (error) {
    console.error(`Failed to build and run container: ${error.message}`);
    throw error;
  }
}

// // --- Example Usage ---
// (async () => {
//   const repoPath = path.join(__dirname, 'path/to/your/other/repo'); // <-- Change this path
//   const imageName = 'my-custom-app-image';
//   const containerName = 'my-running-instance';

//   try {
//     // 1. Build the image
//     await buildImageFromRepo(repoPath, imageName);

//     // 2. Create and Run the container
//     const containerDetails = await createAndRunContainer(imageName, containerName);
    
//     console.log('\nContainer Network Settings:', containerDetails.NetworkSettings.Ports);

//     // 3. Retrieve container info later by name/ID
//     const retrievedInfo = await getContainerInfo(containerName);
//     // You can process the extensive JSON data in 'retrievedInfo' as needed

//   } catch (e) {
//     console.log('Operation failed.');
//   }
// })();
// const config = {
//   PORT: '3389',
//   DEBUG: 'true',
//   LOG_LEVEL: 'info'
// };

// await buildAndRunWithConfig(
//   './agent_container_module/',
//   'telephony-agent:latest',
//   'telephony-agent-instance',
//   config
// );