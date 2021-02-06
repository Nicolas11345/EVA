// webpack.config.js
var webpack = require('webpack');

module.exports = {
	entry: {
		main: './src/main.js',
		login: './src/login.js',
	},
    module: {
	    rules: [
	      {
	        test: /\.(js|jsx)$/,
	        exclude: /node_modules/,
	        loader: "babel-loader",
	        options: { presets: ["@babel/env"] }
	      },
	      {
	        test: /\.css$/,
	        use: ["style-loader", "css-loader"]
	      }
	    ]
  	},
  	resolve: { extensions: ["*", ".js", ".jsx"] },
    output: {
        path: `${__dirname}/build`,
    	publicPath: '/',
    	filename: '[name].bundle.js',
    }
}