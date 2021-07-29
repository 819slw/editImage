/*
 * @Author: your name
 * @Date: 2020-07-29 17:59:12
 * @LastEditTime: 2021-07-29 09:40:07
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /editImage/src/main.js
 */
import Vue from "vue";
import App from "./App.vue";
import editImage from "./lib/index.js";
import "remixicon/fonts/remixicon.css";

Vue.use(editImage);
new Vue({
  el: "#app",
  render: (h) => h(App),
});
