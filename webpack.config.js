
module.exports = {
  entry: [
    './entry.js'
  ],
  output: {
    path: __dirname + '/assets',
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['@babel/react', '@babel/preset-env'],
          plugins: ["@babel/plugin-proposal-class-properties"]
        }
      }
    ]
  },
}
