const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Make sure the path matches where your global.css is located!
module.exports = withNativeWind(config, { input: "./src/global.css" });