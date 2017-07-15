var path = require('path');

module.exports = {
  entry: {
  	bundle: './js/content_script',
  	options: './js/options'
  },
  output: {
  	path: path.join(__dirname, "plugin/js"),
    filename: "[name].js"
  }
};