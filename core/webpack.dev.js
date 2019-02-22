const webpack = require('webpack')
const merge = require('webpack-merge')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const path = require('path')

const baseWebpack = require('./webpack.base')
const { styleLoaders } = require('./tools')

module.exports = merge(baseWebpack, {
  watch: true,
  module: {
    rules: styleLoaders({ sourceMap: false })
  },
  devtool: '#cheap-module-eval-source-map',
  plugins: [
    new CleanWebpackPlugin(['build'], {
      root: path.resolve(__dirname, '../')
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"'
    }),
    new FriendlyErrorsPlugin()
  ]
})
