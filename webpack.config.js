const { resolve } = require('path');
const webpack = require('webpack')
const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin");
const JsonMinimizerPlugin = require("json-minimizer-webpack-plugin");
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const devMode  = process.env.NODE_ENV === 'development';
const config = {
  devtool: 'inline-source-map',
  mode: devMode  ? 'development' : 'production',
  devServer: {
    contentBase: resolve(__dirname, 'dist'),
    compress: true,
    port: 80,
    historyApiFallback: true,
  },
  entry: {
    index: './src/index.tsx',
  },
  output: {
    publicPath: devMode ? 'http://localhost:80/' : '',
    path: resolve(__dirname, 'dist'),    
    filename: devMode ? '[name].js' : 'javascripts/[name].js'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    plugins: [new TsconfigPathsPlugin({ configFile: "./tsconfig.json" })],
    alias: {
      '@fortawesome/fontawesome-svg-core': '@fortawesome/fontawesome-svg-core/index.js', 
      'app': resolve(__dirname, './src/app'),
      'store': resolve(__dirname, './src/store'),  
      'assets': resolve(__dirname, './src/assets'),
      'components': resolve(__dirname, './src/components'),  
      'helpers': resolve(__dirname, './src/helpers'),      
      'routes': resolve(__dirname, './src/routes'),
      'services': resolve(__dirname, './src/services'),
      'models': resolve(__dirname, './src/models'),   
      'uielements': resolve(__dirname, './src/uielements')
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/i,     
        use: ['ts-loader', 'eslint-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.(scss|css)$/i,
        use: [          
          {
            loader: MiniCssExtractPlugin.loader, 
            options: {
                publicPath: ''
            }
          },    
          "css-loader",            
          "postcss-loader",
          "resolve-url-loader",
          "sass-loader",                        
        ]
      },
      {
        test: /\.(png|jpg|jpe?g|gif)$/i,
        use: [     
          {     
            loader : "file-loader",
            options: {              
              name: devMode ? '[name].[ext]' : 'assets/images/[name].[ext]'              
            }
          }
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|svg)$/i,
        use: [          
          'url-loader'
        ]
      }
    ],
  },
  optimization: {    
    runtimeChunk: true,
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        }
      },
    },
    minimize: devMode ? false : true,
    minimizer: [      
      new JsonMinimizerPlugin(),
      new CssMinimizerPlugin({ cache: true, parallel: true}),
      new HtmlMinimizerPlugin({ parallel: true }),
    ]
  },
  plugins: [    
    new HtmlWebpackPlugin({
      title: 'Automation APP',
      template: 'src/index.html',
    }),
    new MiniCssExtractPlugin({ filename: devMode ? '[name].css' : 'assets/css/[name].css' }),
    new ESLintPlugin(),
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),    
    new Dotenv(),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    })
  ],
};
if(devMode == false)
{
  config.plugins.push(new TerserPlugin({ parallel: true }));
  config.plugins.push(new CopyPlugin({
    patterns: [
      {                                            
        from: '**/*.json',
        context: resolve(__dirname, "src"),        
        to: '[path][name].[ext]',                  
      },
      {
        from: 'assets/docx/**/*.pdf',
        context: resolve(__dirname, "src"),
        to: '[path][name].[ext]',
      },
    ],
  }));
}
module.exports = config;
