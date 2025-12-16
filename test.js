// import { createAgent } from './controllers/create_agent.js';
// import { buildAndRunWithConfig } from './utils/docker_utils.js';
// import {imageBuild, runContainer, runContainerWithDynamicPortAndConfig, imageBuild2} from './utils/dockerUtils2.js';

// // createAgent({ /* sample data_config object */ })

// // // // --- Example Usage ---
// // // (async () => {
// // //   const repoPath = path.join(__dirname, 'path/to/your/other/repo'); // <-- Change this path
// // //   const imageName = 'my-custom-app-image';
// // //   const containerName = 'my-running-instance';

// // //   try {
// // //     // 1. Build the image
// // //     await buildImageFromRepo(repoPath, imageName);

// // //     // 2. Create and Run the container
// // //     const containerDetails = await createAndRunContainer(imageName, containerName);
    
// // //     console.log('\nContainer Network Settings:', containerDetails.NetworkSettings.Ports);

// // //     // 3. Retrieve container info later by name/ID
// // //     const retrievedInfo = await getContainerInfo(containerName);
// // //     // You can process the extensive JSON data in 'retrievedInfo' as needed

// // //   } catch (e) {
// // //     console.log('Operation failed.');
// // //   }
// // // })();



// // // const config = {
// // //   PORT: '3389',
// // //   DEBUG: 'true',
// // //   LOG_LEVEL: 'info'
// // // };

// // // await buildAndRunWithConfig(
// // //   './agent_container_module/',
// // //   'telephony-agent:latest',
// // //   'telephony-agent-instance',
// // //   config
// // // );

// // const config = {
// //   session_config: { 
// //             instructions: "You are a helpful assitant named Emily",
// //             voice: "felicity", 
// //             language: "en-US",
// //             turn_detection: { 
// //                 type: "server_vad", 
// //                 threshold: 0.2, 
// //                 prefix_padding_ms: 1000 ,
// //                 silence_duration_ms: 1000
// //             }
// //         },
// //         provider_config: {
// //             provider: "plivo"
// //         }
// // };

// // await buildAndRunWithConfig(
// //   './agent_container_module/',
// //   'telephony-test_agent:latest',
// //   'telephony-test_agent-instance',
// //   config
// // );

// // --- Main execution ---
// const imageTag = 'docker-sdk-app-image';
// async function main() {
//     try {
//         const imageTag = await imageBuild2();
//         console.log(`\n✅ Image built with tag: ${imageTag}`);
        
//         // if (imageTag) {
//             // await runContainerWithDynamicPortAndConfig();
//         // }

//     } catch (error) {
//         console.error('\n🛑 Main process failed. Exiting.', error.message);
//         process.exit(1);
//     }
// }

// // Execute the main function
// main();

