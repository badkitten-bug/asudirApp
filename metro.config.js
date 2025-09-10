const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Incluir fonts de vector-icons
config.resolver.assetExts.push('ttf', 'woff', 'woff2');

module.exports = config;
