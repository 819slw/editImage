/*
 * @Author: your name
 * @Date: 2020-07-29 17:59:12
 * @LastEditTime: 2021-07-16 09:46:08
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /editImage/src/lib/index.js
 */
import editImage from "./editImage.vue";

editImage.install = function(Vue) {
  Vue.component("editImage", editImage);
  if (typeof window !== "undefined" && window.Vue) {
    window.Vue.use(editImage);
  }
};

export default editImage;
