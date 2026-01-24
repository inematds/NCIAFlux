const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project root (monorepo root)
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo
config.watchFolders = [workspaceRoot];

// Let Metro know where to resolve packages
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Ensure shared package is resolved correctly
config.resolver.extraNodeModules = {
  '@nciaflux/shared': path.resolve(workspaceRoot, 'packages/shared'),
};

// Disable hierarchical lookup to prevent resolving from wrong root
config.resolver.disableHierarchicalLookup = true;

// Explicitly set the project root and entry file
config.projectRoot = projectRoot;
config.server = {
  ...config.server,
  entryFile: path.resolve(projectRoot, 'index.js'),
};

module.exports = config;
