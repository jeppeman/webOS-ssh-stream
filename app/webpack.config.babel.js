const path = require('path');
const webpack = require('webpack');

const sourcePath = path.join(__dirname, 'src');

const config = {
    entry: ['babel-polyfill', path.resolve(sourcePath, 'index.tsx')],
    output: {
        path: __dirname,
        filename: 'bundle.js',
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
        modules: [sourcePath, path.resolve(__dirname, 'node_modules')],
    },
   /* optimization: {
        minimize: false
    },*/
    devServer: {
        static: {
            directory: path.join(__dirname)
        }
    },
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
                include: sourcePath,
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [],
};

if (process.env.NODE_ENV === 'production') {
    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin()
    );
    config.plugins.push(
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
        })
    );
    config.plugins.push(new webpack.optimize.ModuleConcatenationPlugin());
    config.plugins.push(new webpack.HashedModuleIdsPlugin());
}

module.exports = config;
