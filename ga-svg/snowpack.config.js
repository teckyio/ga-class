// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/#configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    src: '/build',
    res: '/res',
    public:'/',
  },
  plugins: [
    'snowpack-plugin-sass'
  ],
  // installOptions: {},
  // devOptions: {},
  // buildOptions: {},
};
