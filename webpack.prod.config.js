// @AngularClass

/*
 * Helper: root(), and rootDir() are defined at the bottom
 */
const helpers = require('./helpers');

// Webpack Plugins
// const webpack = require('webpack');
// const ProvidePlugin = require('webpack/lib/ProvidePlugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const OccurenceOrderPlugin = require('webpack/lib/optimize/OccurenceOrderPlugin');
const DedupePlugin = require('webpack/lib/optimize/DedupePlugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const CompressionPlugin = require('compression-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');
const ForkCheckerPlugin = require('awesome-typescript-loader').ForkCheckerPlugin;

const ENV = process.env.NODE_ENV = process.env.ENV = 'production';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 8080;

const metadata = {
    title: 'Angular2 Webpack Starter by @gdi2990 from @AngularClass',
    baseUrl: '/',
    host: HOST,
    port: PORT,
    ENV,
};

/*
 * Config
 */
module.exports = {
    // static data for index.html
    metadata,

    devtool: 'source-map',
    debug: false,

    entry: {
        polyfills: './src/polyfills.ts',
        main: './src/main.ts', // our angular app
    },

    // Config for our build files
    output: {
        path: helpers.root('dist'),
        filename: '[name].[chunkhash].bundle.js',
        sourceMapFilename: '[name].[chunkhash].bundle.map',
        chunkFilename: '[id].[chunkhash].chunk.js',
    },

    resolve: {
        extensions: ['', '.ts', '.js'],
    },

    module: {
        preLoaders: [
            {
                test: /\.ts$/,
                loader: 'tslint-loader',
                exclude: [helpers.root('node_modules')],
            }, {
                test: /\.js$/,
                loader: 'source-map-loader',
                exclude: [helpers.root('node_modules/rxjs')],
            },
        ],
        loaders: [

            // Support Angular 2 async routes via .async.ts
            // Support for .ts files.
            {
                test: /\.ts$/,
                loader: 'awesome-typescript-loader',
                query: {
                    // remove TypeScript helpers to be injected below by DefinePlugin
                    compilerOptions: {
                        removeComments: true,
                    },
                },
                exclude: [/\.(spec|e2e)\.ts$/, helpers.root('node_modules')],
            },

            // Support for *.json files.
            {
                test: /\.json$/,
                loader: 'json-loader',
                exclude: [helpers.root('node_modules')],
            },

            // Support for CSS as raw text
            {
                test: /\.css$/,
                loader: 'raw-loader',
                exclude: [helpers.root('node_modules')],
            },

            // support for .html as raw text
            {
                test: /\.html$/,
                loader: 'raw-loader',
                exclude: [helpers.root('src/index.html')],
            },

        ],
        noParse: [
            helpers.root('zone.js', 'dist'),
            helpers.root('angular2', 'bundles'),
        ],

    },

    plugins: [
        new ForkCheckerPlugin(),
        new WebpackMd5Hash(),
        new DedupePlugin(),
        new OccurenceOrderPlugin(true),
        new CommonsChunkPlugin({
            name: 'polyfills',
            filename: 'polyfills.[chunkhash].bundle.js',
            chunks: Infinity,
        }),

        // static assets
        new CopyWebpackPlugin([
            {
                from: 'src/assets',
                to: 'assets',
            },
        ]),

        // generating html
        new HtmlWebpackPlugin({ template: 'src/index.html' }),
        new DefinePlugin({
            // Environment helpers
            'process.env': {
                ENV: JSON.stringify(metadata.ENV),
                NODE_ENV: JSON.stringify(metadata.ENV),
            },
        }),

        // jscs: disable
        new UglifyJsPlugin({
            // to debug prod builds uncomment //debug lines and comment //prod lines

            // beautify: true,  // debug
            // mangle: false,  // debug
            // dead_code: false,  // debug
            // unused: false,  // debug
            // deadCode: false,  // debug
            // compress: {
            //     screw_ie8: true,
            //     keep_fnames: true,
            //     drop_debugger: false,
            //     dead_code: false,
            //     unused: false,
            // },  // debug
            // comments: true,//debug

            beautify: false,  // prod
            // disable mangling because of a bug in angular2 beta.1, beta.2 and beta.3
            // TODO(mastertinner): enable mangling as soon as angular2 beta.4 is out
            // mangle: { screw_ie8: true },  // prod
            mangle: {
                screw_ie8: true,
                except: [
                    'RouterActive',
                    'RouterLink',
                    'RouterOutlet',
                    'NgFor',
                    'NgIf',
                    'NgClass',
                    'NgSwitch',
                    'NgStyle',
                    'NgSwitchDefault',
                    'NgModel',
                    'NgControl',
                    'NgFormControl',
                    'NgForm',
                    'AsyncPipe',
                    'DatePipe',
                    'JsonPipe',
                    'NumberPipe',
                    'DecimalPipe',
                    'PercentPipe',
                    'CurrencyPipe',
                    'LowerCasePipe',
                    'UpperCasePipe',
                    'SlicePipe',
                    'ReplacePipe',
                    'I18nPluralPipe',
                    'I18nSelectPipe',
                ],  // needed for uglify RouterLink problem
            },  // prod
            compress: { screw_ie8: true },  // prod
            comments: false,  // prod
        }),
        // jscs: enable

       // include uglify in production
        new CompressionPlugin({
            algorithm: helpers.gzipMaxLevel,
            regExp: /\.css$|\.html$|\.js$|\.map$/,
            threshold: 2 * 1024,
        }),
    ],

    // Other module loader config
    tslint: {
        emitErrors: true,
        failOnHint: true,
        resourcePath: 'src',
    },

    htmlLoader: {
        minimize: true,
        removeAttributeQuotes: false,
        caseSensitive: true,
        customAttrSurround: [[/#/, /(?:)/], [/\*/, /(?:)/], [/\[?\(?/, /(?:)/]],
        customAttrAssign: [/\)?\]?=/],
    },

    // don't use devServer for production
    node: {
        global: 'window',
        progress: false,
        crypto: 'empty',
        module: false,
        clearImmediate: false,
        setImmediate: false,
    },
};
