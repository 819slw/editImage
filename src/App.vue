<!--
 * @Author: your name
 * @Date: 2020-07-29 17:59:12
 * @LastEditTime: 2021-07-19 13:46:32
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /editImage/src/App.vue
-->
<template>
  <div id="app">
    <!-- <editImage :oldImage="img" model.sync="base64Src"></editImage> -->
    <editImage
      :oldImage="img"
      v-model="base64Src"
      @closeDialog="closeDialog"
    ></editImage>
  </div>
</template>

<script>
export default {
  name: "app",
  watch: {
    base64Src: function(n, o) {
      console.log(n);
    }
  },
  methods: {
    closeDialog() {}
  },
  data() {
    return {
      base64Src: "",
      // img: require('./assets/timg.jpg')
      img: "https://t7.baidu.com/it/u=2621658848,3952322712&fm=193&f=GIF"
    };
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
body {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
}
h1,
h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
