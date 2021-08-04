/*
 * @Author: your name
 * @Date: 2020-07-29 17:59:12
 * @LastEditTime: 2021-08-04 13:47:45
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /editImage/webpack.config.js
 */
var path = require("path");
var webpack = require("webpack");
function resolve(dir) {
  return path.join(__dirname, "..", dir);
}
module.exports = {
  // 生产环境
  entry: "./src/lib/index.js",
  output: {
    path: path.resolve(__dirname, "./dist"),
    publicPath: "/dist/",
    filename: "editImage.js",
    library: "editImage",
    libraryTarget: "umd",
    umdNamedDefine: true
  },

  // 开发环境
  // entry: "./src/main.js",
  // output: {
  //   path: path.resolve(__dirname, "./dist"),
  //   publicPath: "/dist/",
  //   filename: "build.js"
  // },

  module: {
    rules: [
      // {
      //   test: /\.css$/,
      //   use: [
      //     'vue-style-loader',
      //     'css-loader'
      //   ],
      // },
      {
        test: /\.vue$/,
        loader: "vue-loader",
        options: {
          loaders: {}
          // other vue-loader options go here
        }
      },
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules/
      },
      // {
      //   test: /\.(png|jpg|gif|svg)$/,
      //   loader: "file-loader",
      //   options: {
      //     name: "[name].[ext]?[hash]"
      //   }
      // },
      {
        test: /\.sass$/,
        loaders: ["style", "css", "sass"]
      },
      {
        // 处理css资源
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        // 处理图片资源
        test: /\.(jpg|png|gif)$/,
        loader: "url-loader",
        options: {
          limit: 8 * 1024,
          name: "[hash:10].[ext]",
          // 关闭es6模块化
          esModule: false,
          outputPath: "imgs"
        }
      },
      {
        // 处理其他资源
        exclude: /\.(html|js|css|less|jpg|png|gif|vue)/,
        loader: "file-loader",
        options: {
          name: "[hash:10].[ext]",
          outputPath: "media"
        }
      }
    ]
  },
  resolve: {
    alias: {
      vue$: "vue/dist/vue.esm.js",
      "@": resolve("src")
    },
    extensions: ["*", ".js", ".vue", ".json"]
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    overlay: true
  },
  performance: {
    hints: false
  },
  devtool: "#eval-source-map"
};

if (process.env.NODE_ENV === "production") {
  module.exports.devtool = "#source-map";
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ]);
}
