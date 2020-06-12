<template>
  <div id="editImage">
    <img ref="oldImageSlw" class="oldImage_slw" :src="oldImage" alt="等待加载的图片">
    <canvas :width="canvasObj.width" :height="canvasObj.height" v-if="isShowCanvas" id="edit-Image-slw"></canvas>
    <div class="eraserWrapper">
      <ul class="eraserList">
        <li class="eraserItem" 
          v-for="(item,index) in eraserList" 
          :key="index"
          @click="item.callBack()"
          >
          {{ item.pic }}
        </li>
      </ul>
    </div>
    <input type="text" id="ctxInput"/>
  </div>
</template>

<script>
var ctxSlw = null
var domCanvas = null
export default {
  name: 'editImage',
  data () {
    return {
      isAllow: false,
      oldImage: require('../assets/timg.jpg'), // 接收过来的图片 作为canvas的背景图片
      // oldImage: './assets/timg.jpg', // 接收过来的图片 作为canvas的背景图片
      nowImage: '',  // 将来由canvas生成的新图片
      isShowCanvas: false,
      eraserList:[
        {
          name: '橡皮',
          pic: '橡皮',
          callBack: () => {
            if(this.isAllow){
              return this._initEraser()
            }
            return null
          }
        },
        {
          name: '文字',
          pic: '文字',
          callBack: () => {
            if(this.isAllow){
              // input框 使用的是外部的input和内部的绘制文字结合实现
              return this._initInput(event)
            }
            return null
          }
        },
        {
          name: '橡皮',
          pic: '橡皮'
        },
        {
          name: '橡皮',
          pic: '橡皮'
        }
      ],
      canvasObj: {
        width: 0,
        height: 0
      }
    }
  },
  mounted(){
    this.$refs.oldImageSlw.onload = (e) => {
      var domImg = document.querySelector('.oldImage_slw')
      this.canvasObj.width = domImg.naturalWidth
      this.canvasObj.height = domImg.naturalHeight
      this.isShowCanvas = true
      this.$nextTick(() => {
        domCanvas = document.getElementById("edit-Image-slw")
        ctxSlw = domCanvas.getContext("2d")
        this.fillImgToCanvas(domImg)
        this.isAllow = true
        this._initFun()
      })
    }
  },
  methods: {
    // 初始化 input框
    _initInput(event){
      // 这里存在两个x和y值：1.input的位移。 和input在canvas的位移
      let inputDom = document.getElementById('ctxInput')
      let that = this
      document.onmousedown = function(e){
        inputDom.style.left = e.clientX + 'px'
        inputDom.style.top = e.clientY + 'px'
      }

      // 设置文件
      domCanvas.onmousedown = function(e){
        ctxSlw.font= 'bold 24px sans-serif'
        ctxSlw.fillStyle = 'red'
        ctxSlw.fillText(inputDom.value, that.getBoundingClientRect(e.clientX,e.clientY).x,that.getBoundingClientRect(e.clientX,e.clientY).y)
      }
    },
    // 初始化 橡皮
    _initEraser(){
      let that = this
      ctxSlw.lineWidth = 20
      // ctxSlw.strokeStyle = 'blue'     //画笔颜色  
      ctxSlw.globalCompositeOperation = "destination-out"
      let drawing = false
      domCanvas.onmousedown = function(e){
          var first = that.getBoundingClientRect(e.clientX,e.clientY);
          ctxSlw.save();
          ctxSlw.beginPath();
          ctxSlw.moveTo(first.x,first.y);
          drawing = true;
      }
      domCanvas.onmousemove = function(e){
          if(drawing){
              var move = that.getBoundingClientRect(e.clientX,e.clientY);
              ctxSlw.save();
              ctxSlw.lineTo(move.x,move.y);
              ctxSlw.stroke()
              ctxSlw.restore()
          }
      }
      domCanvas.onmouseup = function(){
          drawing = false;
      }
      domCanvas.onmouseleave = function(){
          drawing = false;
          domCanvas.onmouseup();
      }

    },
    // 初始化绘画曲线
    _initFun(){
      let penWeight = 2
      let penColor = 'red'
      domCanvas.onmousedown = (e)=> {
        var start_x = e.clientX - domCanvas.offsetLeft + document.body.scrollLeft
        var start_y = e.clientY - domCanvas.offsetTop + document.body.scrollTop
        ctxSlw.beginPath()
        ctxSlw.moveTo(start_x, start_y)
        /*设置画笔属性*/  
        ctxSlw.lineCap = 'round'  
        ctxSlw.lineJoin ="round"
        ctxSlw.strokeStyle = penColor     //画笔颜色  
        ctxSlw.lineWidth = penWeight      //画笔粗细  

        domCanvas.onmousemove = function(e){
          /*找到鼠标（画笔）的坐标*/  
          var move_x = e.clientX - domCanvas.offsetLeft + document.body.scrollLeft;  
          var move_y = e.clientY - domCanvas.offsetTop + document.body.scrollTop;   
          ctxSlw.lineTo(move_x, move_y);     //根据鼠标路径绘画  
          ctxSlw.stroke();   //立即渲染  
        }

        domCanvas.onmouseup = function(){
            ctxSlw.closePath();    //结束本次绘画
            domCanvas.onmousemove = null;  
            domCanvas.onmouseup = null;  
        }

        domCanvas.onmouseleave = function(){
            ctxSlw.closePath()
            domCanvas.onmousemove = null  
            domCanvas.onmouseup = null
        }  
      }
    },
    getBoundingClientRect(x, y){
      return {
        x: x - domCanvas.offsetLeft + document.body.scrollLeft,
        y: y - domCanvas.offsetTop + document.body.scrollTop
      }
    },
    fillImgToCanvas(oldImgDom){
      ctxSlw.drawImage(oldImgDom,0,0,this.canvasObj.width,this.canvasObj.height)
    }
  }
}
</script>

<style lang="scss" scoped>
#ctxInput{
  position: fixed;
  background: rgba(0,0,0,0);
  outline: none;
  border:1px solid #000;
  width: 200px;
  height: 20px;
  color: red;
  font-size: 16px;
}
#editImage{
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0,0,0, .5);
  .eraserWrapper{
    background: rgba(0,0,0, .5);
    padding: 5px;
    .eraserList{
      padding-left: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0;
      .eraserItem{
        margin-right: 10px;        
        list-style: none;
        color: #fff;
        cursor: pointer;
      }
    }
  }
  .oldImage_slw{
    opacity: 0;
    width: 0;
    height: 0;
  }
}
</style>
