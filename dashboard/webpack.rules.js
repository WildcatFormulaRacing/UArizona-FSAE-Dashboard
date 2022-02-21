module.exports = [
    {
        test: /\.tsx?$/,
        exclude: /(node_modules|\.webpack)/,
        use: {
            loader: 'ts-loader',
            options: {
                transpileOnly: true
            }
        }
    },
    {
        test: /\.(woff|woff2|tff|eot)$/,
        use: 'file-loader?name=fonts/[name].[ext]!static'
    }
];
