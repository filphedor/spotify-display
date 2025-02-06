const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');


module.exports = {
    mode: 'production',
    entry: {
        index: ['./src/index.js']
    },
    'output': {
        'path': path.resolve(__dirname, '../dist'),
        'filename': '[name].[contenthash].js'
    },
    'resolve': {
        'roots': [path.resolve('./src')]
    },
    'module': {
        'rules': [
            {
                'test': /\.(jsx|js)$/,
                'include': path.resolve(__dirname, '../src'),
                'use': [
                    {
                        'loader': 'babel-loader',
                        'options': {
                            'configFile': './config/.babel.config.json'
                        }
                    }
                ]
            },
            {
                'test': /\.scss$/i,
                'use': [
                    MiniCssExtractPlugin.loader,
                    {
                        'loader': 'css-loader',
                        'options': {
                            'url': false
                        }
                    },
                    {
                        'loader': 'sass-loader',
                        'options': {
                            'implementation': require.resolve('sass')
                        }
                    }
                ]
            }
        ]
    },
    'plugins': [
        new webpack.EnvironmentPlugin([
            'SPOTIFY_CLIENT_ID',
            'REDIRECT_URI'
        ]),
        new MiniCssExtractPlugin({
            'ignoreOrder': true
        }),
        new HtmlWebpackPlugin({
            'filename': 'index.html',
            'template': 'src/index.html',
            'publicPath': '/',
            'inject': 'head',
            'scriptLoading': 'defer',
            'chunks': [
                "index"
            ]
        })
    ],
    'optimization': {
        'removeAvailableModules': false,
        'removeEmptyChunks': false,
        'splitChunks': {
            'chunks': 'all'
        }
    }
};
