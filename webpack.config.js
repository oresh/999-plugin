var path = require('path');

module.exports = {
  entry: {
  	bundle: './dist/content_script',
  	options: './dist/options'
  },
  output: {
  	path: path.join(__dirname, "plugin/js"),
    filename: "[name].js"
  }
};