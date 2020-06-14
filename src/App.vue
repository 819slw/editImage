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
  name: 'app',
  watch:{
    'base64Src': function(n,o) {
      console.log(n)
    }
  },
  methods: {
    closeDialog(){

    }
  },
  data () {
    return {
      base64Src: '',
      img: require('./assets/timg.jpg')
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
body{
  padding: 0;
  margin: 0;
}
h1, h2 {
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
