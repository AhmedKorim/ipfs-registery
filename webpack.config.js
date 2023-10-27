const webpack = require('webpack');

module.exports = {
	mode: 'production',
	resolve: {
		extensions: ['.ts', '.js'],
	},
	output: {
		path: __dirname + '/dist',
		filename: 'ipfsRegistryPlugin.min.js',
		library: 'ipfsRegistryPlugin',
		libraryExport: 'default',
		libraryTarget: 'umd',
		globalObject: 'this',
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: [/node_modules/, '/test/'],
				use: [
					{
						loader: 'ts-loader',
					},
				],
			},
		],
	},
};
