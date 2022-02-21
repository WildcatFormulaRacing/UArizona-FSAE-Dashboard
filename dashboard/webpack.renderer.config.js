import { NormalModuleReplacementPlugin } from "webpack";
const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');


rules.push({
    test: /\.css/,
    use: ['style-loader', 'css-loader'],
});

module.exports = {
    module: {
        rules,
    },
    plugins: [
        ...plugins,
        new NormalModuleReplacementPlugin(
            /^bindings$/,
            `${__dirname}/src/bindings`
        )
    ],
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.css']
    },
};
