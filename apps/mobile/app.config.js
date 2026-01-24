const path = require('path');
const appJson = require('./app.json');

module.exports = ({ config }) => {
  return {
    ...appJson.expo,
    ...config,
  };
};
