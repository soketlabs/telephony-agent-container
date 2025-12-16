// build-image-from-repo.mts (ESM)
// npm install @docker/node-sdk tar-fs

import { DockerClient } from '@docker/node-sdk';
import tar from 'tar-fs';

/**
 * Build a Docker image using a local repo as build context.
 *
 * @param repoPath Absolute or relative path to the repo directory
 * @param imageTag Image tag, e.g. "my-app:latest"
 * @returns The built image ID (sha256:...)
 */
export async function buildImageFromRepo(repoPath, imageTag) {
  // Creates a Docker client based on your local Docker config / DOCKER_HOST
  const docker = await DockerClient.fromDockerConfig();

  // Pack the repo directory into a tar stream as build context
  const buildContext = tar.pack(repoPath); // Node Readable stream

  // Call the ImageBuild endpoint
  // Method name in the SDK is lowerCamelCase: imageBuild(...)
  const stream = await docker.imageBuild(buildContext as any, {
    // Name of the Dockerfile relative to repoPath
    dockerfile: 'Dockerfile',
    // Equivalent of `-t imageTag`
    t: imageTag,
    // Optional flags you might want:
    pull: true,      // always attempt to pull newer base images
    rm: true,        // remove intermediate containers
  });

  let imageId: string | undefined;

  // The SDK returns an async stream of JSON messages (like `docker build` does)
  for await (const msg of stream as any) {
    // Normal build output
    if (msg.stream) {
      process.stdout.write(msg.stream);
    }

    // Errors from the daemon
    if (msg.error) {
      throw new Error(msg.error);
    }

    // When the build finishes, Docker sends an "aux" message with the built image ID
    if (msg.aux && msg.aux.ID) {
      imageId = msg.aux.ID;
    }
  }

  if (!imageId) {
    throw new Error('Image built but no image ID was returned from Docker');
  }

  return imageId;
}

// Example usage:
if (import.meta.url === `file://${process.argv[1]}`) {
  const repoPath = process.argv[2] || '.';
  const imageTag = process.argv[3] || 'my-repo-image:latest';

  buildImageFromRepo(repoPath, imageTag)
    .then((id) => {
      console.log(`\nBuilt image: ${imageTag} (${id})`);
    })
    .catch((err) => {
      console.error('Build failed:', err);
      process.exit(1);
    });
}
