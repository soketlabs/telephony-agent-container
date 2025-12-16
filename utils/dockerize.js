import Dockerode from 'dockerode';
import Docker from 'dockerode';
// var docker = new Docker();

const IMAGE_TAG = 'telephony-agent-test-image:latest';

const docker = new Docker();
const REPO_URL = 'https://github.com/soketlabs/telephony-agent-container.git';

async function buildImage(repoUrl, imageName) {
    console.log(`\nStarting build for image: ${imageName} from ${repoUrl}`);

    if (!imageName || typeof imageName !== 'string' || !imageName.includes(':')) {
        console.warn(`Tag ${imageName} may be invalid. Using a default tag.`);
        // Fallback or exit if necessary
    }
    const buildOptions = {
        // Tag the resulting image
        t: imageName,
        remote: repoUrl
    };

    try {
        // Call buildImage, passing null for the local context stream
        const stream = await docker.buildImage(null, buildOptions);

        // Follow the progress stream and print output to the console
        await new Promise((resolve, reject) => {
            docker.modem.followProgress(stream, (err, res) => {
                if (err) return reject(new Error(`Docker build failed: ${err.message}`));
                
                // ... (your existing error checks are fine)
                if (Array.isArray(res) && res.length > 0 && res[res.length - 1].error) {
                    return reject(new Error(`Docker build reported an error: ${res[res.length - 1].error}`));
                }
                resolve(res);
            }, (event) => {
                // 👇 UNCOMMENT THIS LINE TO SEE THE ERROR 👇
                if (event.stream) {
                    process.stdout.write(event.stream); 
                }
            });
        });


        console.log(`✅ Image built successfully: ${imageName}`);
        return imageName;

    } catch (error) {
        console.error('❌ Build Error:', error.message);
        throw error;
    }
}

async function runContainer(imageName) {
    
}

async function tagImage(imageId, newTagName) {
    console.log(`Attempting to tag image ${imageId} as ${newTagName}`);
    const image = docker.getImage(imageId);

    // The tag API method uses query parameters for the new name and tag
    const options = {
        repo: newTagName.split(':')[0], // Repository name
        tag: newTagName.split(':')[1] || 'latest' // Tag name (defaults to 'latest')
    };

    try {
        await image.tag(options);
        console.log(`✅ Successfully tagged image ID ${imageId} as ${newTagName}`);
    } catch (err) {
        console.error(`❌ Failed to tag image ${imageId}:`, err.message);
        throw err;
    }
}

async function main() {
    try {
        await buildImage(REPO_URL, IMAGE_TAG);
    } catch (error) {
        console.error('Error in main execution:', error);
    }
}

main();