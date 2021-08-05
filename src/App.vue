<!--
 * @Author: your name
 * @Date: 2020-07-29 17:59:12
 * @LastEditTime: 2021-08-05 14:01:34
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /editImage/src/App.vue
-->
<template>
  <div id="app">
    <!-- <editImage :oldImage="img" model.sync="base64Src"></editImage> -->
    <editImage
      :newImage="img"
      :oldImage="img"
      v-model="base64Src"
      @closeDialog="closeDialog"
      @setImgBase64="setImgBase64"
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
    setImgBase64(index) {
      console.log(index);
    },
    closeDialog() {}
  },
  mounted() {
    setTimeout(() => {
      this.img = [
        "https://file.znclass.com/16279722204331的副本2.png",
        "https://t7.baidu.com/it/u=2621658848,3952322712&fm=193&f=GIF"
      ];
    }, 1);
  },
  data() {
    return {
      base64Src: "",
      // img: require('./assets/timg.jpg')
      img: []
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
  width: 100%;
  height: 100%;
}
body {
  padding: 0;
  margin: 0;
  width: 100vw;
  height: 100vh;
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
