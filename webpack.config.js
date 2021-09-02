const path = require('path');

module.exports = {
  entry: './src/view-model.js',
  output: {
    filename: 'wow.js',
    path: path.resolve(__dirname, 'pages'),
  },
};