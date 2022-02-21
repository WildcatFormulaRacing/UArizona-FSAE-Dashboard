import CopyWebpackPlugin from "copy-webpack-plugin";

module.exports = {
    /**
     * This is the main entry point for your application, it's the first file
     * that runs in the main process.
     */
    entry: './src/index.ts',
    // Put your normal webpack config below here
    module: {
        rules: require('./webpack.rules'),
    },
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json', '.woff', '.tff']
    },
    plugins: [
        new CopyWebpackPlugin([
            "node_modules/socketcan/build/Release/can.node",
            "node_modules/socketcan/build/Release/can_signals.node"
        ])
    ]
};

module.exports = x => {
    __non_webpack_require__(
        `${require("electron").remote.app.getAppPath()}/${x}`
    )
}