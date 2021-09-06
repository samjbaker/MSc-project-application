const path = require('path');

module.exports = {
  entry: './src/view-model.js',
  output: {
    filename: 'view-model.js',
    path: path.resolve(__dirname, 'pages'),
  },
};