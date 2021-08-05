<template>
  <div id="editImage">
    <!-- 画布 -->
    <div id="canvasWrapperBox">
      <div class="canvasWrapper" id="canvasWrapper">
        <div class="notData" id="notDataslw" v-if="newImage.length == 0">
          <i class="ri-image-fill"></i>
          <span>{{ text }}</span>
        </div>
        <canvas
          :width="canvasObj.width"
          :height="canvasObj.height"
          v-if="isShowCanvas"
          id="edit-Image-slw"
        ></canvas>
        <canvas
          :width="canvasObj.width"
          :height="canvasObj.height"
          v-if="isShowCanvas"
          id="edit-Image-bottom"
        ></canvas>
      </div>
    </div>

    <!-- 功能按钮 -->
    <div class="eraserWrapper">
      <div class="eraserList">
        <div
          class="eraserItem"
          v-for="(item, index) in eraserList"
          :key="index"
          @click="item.callBack()"
        >
          <i :class="[item.icon]"></i>
          <span>{{ item.pic }}</span>
        </div>
        <!-- <li class="eraserItem" @click="saveImg">保存图片</li> -->
        <!-- <li class="eraserItem" @click="tranform">旋转</li> -->
        <!-- <li class="eraserItem" @click="next">后退</li> -->
        <!-- <li class="eraserItem" @click="last">前进</li> -->
      </div>
    </div>

    <!-- 图片缩略图 -->
    <div class="previewImg">
      <img
        @click="switchImgIndex(index)"
        :class="{ active: nowIndex == index }"
        v-for="(item, index) in newImage"
        :key="index"
        :src="item"
        alt=""
      />
    </div>
    <!-- 切换图片 -->
    <div @click="switchImg(0)" class="switchBtn switchBtnL">
      <i class="ri-arrow-left-s-line"></i>
    </div>
    <div @click="switchImg(1)" class="switchBtn switchBtnR">
      <i class="ri-arrow-right-s-line"></i>
    </div>
    <!-- 输入框 -->
    <div v-if="isShowInput" id="inputWrapper">
      <input type="text" id="ctxInput" />
      <span @click.stop="cancleInput()" class="operatBtn">取消</span>
      <span @click.stop="confrimInput()" class="operatBtn">确认</span>
    </div>
    <img id="resultImg" src="" alt="" srcset="" />
  </div>
</template>

<script>
var ctxSlw = null;
var ctxSlw1 = null;
var domCanvas = null;
var domCanvas1 = null;

var imgDom = null;
export default {
  name: "editImage",
  props: {
    text: {
      type: String,
      default: () => "暂无数据"
    },
    otherHeight: {
      type: Number,
      default: () => 0
    },
    newImage: {
      type: Array,
      default: () => []
    },
    oldImage: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      canvasBaseDom: null,
      wheelTimer: true,
      isDrawed: false,
      cw1: 0,
      ch1: 0,
      nowIndex: 0,
      isCanvas: true, // 是否可以绘制。考虑到是两层canvas所需的渲染时间，所以加一个状态去延迟一下
      rotateDeg: 0,
      isShowInput: false,
      isAllow: false,
      nowImage: "", // 将来由canvas生成的新图片
      isShowCanvas: false,
      imgScale: 1,
      imgX: 0,
      imgY: 0,
      recordCanvasData: [],
      operateIndex: -1,

      eraserList: [
        {
          name: "画笔",
          pic: "画笔",
          icon: "ri-zoom-in-line",
          callBack: () => {
            return this._initFun();
          }
        },
        {
          name: "后退",
          pic: "后退",
          icon: "ri-zoom-in-line",
          callBack: () => {
            return this.next();
          }
        },
        {
          name: "前进",
          pic: "前进",
          icon: "ri-zoom-in-line",
          callBack: () => {
            return this.last();
          }
        },
        {
          name: "旋转",
          pic: "旋转",
          icon: "ri-zoom-in-line",
          callBack: () => {
            return this.tranform();
          }
        },
        {
          name: "橡皮",
          pic: "橡皮",
          icon: "ri-zoom-in-line",
          callBack: () => {
            if (this.isAllow) {
              return this._initEraser();
            }
            return null;
          }
        },
        {
          name: "文字",
          pic: "文字",
          icon: "ri-zoom-in-line",
          callBack: () => {
            if (this.isAllow) {
              // input框 使用的是外部的input和内部的绘制文字结合实现
              return this._initInput(event);
            }
            return null;
          }
        }
        // {
        //   name: "完成",
        //   pic: "完成",
        //   callBack: () => {
        //     if (this.isAllow) {
        //       this.getBaseContent();
        //     }
        //   },
        // },
        // {
        //   name: "取消",
        //   pic: "取消",
        //   callBack: () => {
        //     if (this.isAllow) {
        //       this.cancleDialog();
        //     }
        //   },
        // },
      ],
      nowClient: {
        x: 0,
        y: 0
      },
      canvasObj: {
        width: 0,
        height: 0
      }
    };
  },
  watch: {
    nowIndex(n) {
      this.initCanvasContext();
    },
    oldImage: {
      handler() {
        if (this.nowIndex == 0) {
          this.initCanvasContext();
        } else {
          this.nowIndex = 0;
        }
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    // 打印 - 方便确认开发者传递的数据是否有问题
    console.log("oldImage:", this.oldImage);
    console.log("newImage:", this.newImage);
    console.log("text:", this.text);

    // 首先第一步是设置canvas的高度和宽度
    // 首先是获取最外层容器的宽度:w1和高度:h1
    let dom = document.querySelector("#editImage");
    let w1 = dom.clientWidth;
    let h1 = dom.clientHeight;
    // 拿到w1和w2之后，计算出canvas的实际宽度:cw1和高度ch1
    this.cw1 = w1 - 32; // 根据UI的设定减去两边的padding: 16px
    this.ch1 = h1 - 96 - this.otherHeight; // 96 是底部的工作区， this.otherHeight是顶部你们slot插入的容器高度，默认是0

    let resultImgDom = document.querySelector("#resultImg");
    resultImgDom.style.width = this.cw1 + "px";
    resultImgDom.style.height = this.ch1 + "px";

    let canvasWrapperBox = document.querySelector("#canvasWrapperBox");
    canvasWrapperBox.style.width = this.cw1 + "px";
    canvasWrapperBox.style.height = this.ch1 + "px";

    let notDataslw = document.querySelector("#notDataslw");
    if (notDataslw) {
      notDataslw.style.width = this.cw1 + "px";
      notDataslw.style.height = this.ch1 + "px";
    }

    this.$nextTick(() => {
      this.initCanvasContext();
    });
    this.watchScreen();
  },
  methods: {
    // 主动回调开发者的方法
    setImgBase64() {
      if (this.isDrawed) {
        this.$emit("setImgBase64", {
          key: this.nowIndex,
          val: this.getBase64()
        });
      }
    },
    // 切换图片
    switchImgIndex(index) {
      this.nowIndex = index;
    },
    // 清空关于画布的操作
    clearCanvas() {
      ctxSlw1.clearRect(0, 0, this.canvasObj.width, this.canvasObj.height);
      ctxSlw.clearRect(0, 0, this.canvasObj.width, this.canvasObj.height);
      this.canvasBaseDom = null;
    },
    // 切换图片
    switchImg(type) {
      this.setImgBase64();
      this.clearCanvas();
      if (type == 0) {
        this.nowIndex = this.nowIndex - 1 > -1 ? this.nowIndex - 1 : 0;
      } else {
        this.nowIndex =
          this.nowIndex + 1 <= this.newImage.length - 1
            ? this.nowIndex + 1
            : this.newImage.length - 1;
      }
    },
    // 首次描绘画布
    initCanvasContext() {
      // 初始化一些变量
      this.isDrawed = false;

      let img = new Image();
      img.setAttribute("crossOrigin", "anonymous");
      img.onload = () => {
        this.canvasObj.width = this.cw1;
        this.canvasObj.height = this.ch1;
        this.isShowCanvas = true;
        this.$nextTick(() => {
          //  获取 画布canvas
          domCanvas = document.getElementById("edit-Image-slw");
          // 获取底层的图片canvas
          domCanvas1 = document.getElementById("edit-Image-bottom");
          // 后去底层的图片canvas 2d对象
          if (domCanvas) ctxSlw = domCanvas.getContext("2d");
          if (domCanvas1) ctxSlw1 = domCanvas1.getContext("2d");
          this.fillImgToCanvas(img);
          this.isAllow = true;
          this._initFun();
        });
      };
      img.src = this.newImage[this.nowIndex];
    },
    // 下一步
    next() {
      this.recordOperate(0);
    },
    // 上一步
    last() {
      this.recordOperate(1);
    },
    // 前进后退的问题
    recordOperate(val) {
      if (val == 1) {
        if (this.operateIndex < this.recordCanvasData.length - 1) {
          this.operateIndex++;
        } else {
          return;
        }
      } else {
        if (this.operateIndex > 0) {
          this.operateIndex--;
        } else {
          if (this.operateIndex > -1) {
            this.operateIndex--;
          }
          return;
        }
      }
      ctxSlw.putImageData(this.recordCanvasData[this.operateIndex], 0, 0);
      // this.$emit('setRenderCanvasBase64', this.nowDomCanvas.toDataURL('image/png').split('base64,')[1])
    },
    // 旋转
    tranform() {
      if (this.rotateDeg == 360) {
        this.rotateDeg = 0;
      } else {
        this.rotateDeg = Number(this.rotateDeg) + 90;
      }

      // 旋转
      let dom = document.querySelector("#canvasWrapper");
      dom.style.transform = `rotate(${this.rotateDeg}deg)`;

      // let dom1 = document.querySelector("#edit-Image-slw");
      // dom1.style.transform = `rotate(${this.rotateDeg}deg)`;
    },
    // 获取base64 数据
    getBase64() {
      if (this.isDrawed) {
        ctxSlw1.drawImage(domCanvas, 0, 0);
        let base64 = domCanvas1.toDataURL();
        return base64;
      } else {
        return "";
      }
    },
    // 开发者主动调用获取图片base64
    saveImg() {
      return {
        key: this.nowIndex,
        val: this.getBase64()
      };
    },
    // 监控屏幕变化
    watchScreen() {
      let dom = document.querySelector("#editImage");
      window.onresize = () => {
        let screenWidth = dom.clientWidth;
        let screenHeight = dom.clientHeight;
      };
    },
    // 废弃 方法
    cancleDialog() {
      this.$emit("closeDialog");
    },
    // 废弃 方法
    getBaseContent() {
      this.$emit("input", domCanvas.toDataURL());
    },
    // 取消添加文字
    cancleInput() {
      let inputDom = document.getElementById("ctxInput");
      inputDom.value = "";
      this.isShowInput = false;
    },
    // 确认把文字描绘到画布上
    confrimInput() {
      this.clearCanvasBase();
      let inputDom = document.getElementById("ctxInput");
      ctxSlw.font = "bold 24px sans-serif";
      ctxSlw.fillStyle = "red";
      ctxSlw.fillText(
        inputDom.value,
        this.getBoundingClientRect(this.nowClient.x, this.nowClient.y).x,
        this.getBoundingClientRect(this.nowClient.x, this.nowClient.y).y
      );
      this.isShowInput = false;
    },
    // 初始化 input框
    _initInput(event) {
      this.isShowInput = true;
      this.$nextTick(() => {
        // 这里存在两个x和y值：1.input的位移。 和input在canvas的位移
        let inputDom = document.getElementById("inputWrapper");
        let that = this;

        domCanvas.onmousedown = e => {
          this.nowClient.x = e.offsetX;
          this.nowClient.y = e.offsetY;
          inputDom.style.left = e.offsetX + "px";
          inputDom.style.top = e.offsetY + "px";
          // input 获取焦点
          setTimeout(() => {
            let input = document.getElementById("ctxInput");
            input.focus();
          }, 30);
        };
      });
    },
    // 初始化 橡皮
    _initEraser() {
      let that = this;
      that.clearCanvasBase();
      ctxSlw.lineWidth = 20;
      ctxSlw.lineCap = "round";
      ctxSlw.lineJoin = "round";
      ctxSlw.globalCompositeOperation = "destination-out";
      let drawing = false;
      domCanvas.onmousedown = function(e) {
        var first = that.getBoundingClientRect(e.offsetX, e.offsetY);
        ctxSlw.save();
        ctxSlw.beginPath();
        ctxSlw.moveTo(first.x, first.y);
        drawing = true;
      };
      domCanvas.onmousemove = function(e) {
        if (drawing) {
          var move = that.getBoundingClientRect(e.offsetX, e.offsetY);
          ctxSlw.save();
          ctxSlw.lineTo(move.x, move.y);
          ctxSlw.stroke();
          ctxSlw.restore();
        }
      };
      domCanvas.onmouseup = function() {
        drawing = false;
      };
      domCanvas.onmouseleave = function() {
        drawing = false;
        domCanvas.onmouseup();
      };
    },
    // 清空放大小时 的 图片依据
    clearCanvasBase() {
      this.canvasBaseDom = null;
    },
    // 初始化绘画曲线
    _initFun() {
      let penWeight = 2;
      let penColor = "red";
      let that = this;
      domCanvas.onmousedown = e => {
        that.clearCanvasBase();
        var start_x =
          e.offsetX - domCanvas.offsetLeft + document.body.scrollLeft;
        var start_y = e.offsetY - domCanvas.offsetTop + document.body.scrollTop;
        ctxSlw.beginPath();
        ctxSlw.moveTo(start_x, start_y);
        /*设置画笔属性*/

        ctxSlw.lineCap = "round";
        ctxSlw.lineJoin = "round";
        ctxSlw.strokeStyle = penColor; //画笔颜色
        ctxSlw.lineWidth = penWeight; //画笔粗细
        ctxSlw.globalCompositeOperation = "source-over";

        domCanvas.onmousemove = function(e) {
          // 开始绘制意味着我需要提供出去base64
          that.isDrawed = true;

          /*找到鼠标（画笔）的坐标*/

          var move_x =
            e.offsetX - domCanvas.offsetLeft + document.body.scrollLeft;
          var move_y =
            e.offsetY - domCanvas.offsetTop + document.body.scrollTop;
          ctxSlw.lineTo(move_x, move_y); //根据鼠标路径绘画
          ctxSlw.stroke(); //立即渲染
        };

        domCanvas.onmouseup = function() {
          ctxSlw.closePath(); //结束本次绘画
          domCanvas.onmousemove = null;
          domCanvas.onmouseup = null;

          if (that.recordCanvasData.length - 2 >= that.operateIndex) {
            that.recordCanvasData = that.recordCanvasData.slice(
              0,
              that.operateIndex + 1
            );
          }
          that.recordCanvasData.push(
            ctxSlw.getImageData(
              0,
              0,
              that.canvasObj.width,
              that.canvasObj.height
            )
          );
          that.operateIndex = that.recordCanvasData.length - 1;
        };

        domCanvas.onmouseleave = function() {
          ctxSlw.closePath();
          domCanvas.onmousemove = null;
          domCanvas.onmouseup = null;
        };
      };

      // 缩放
      domCanvas.onmousewheel = domCanvas.onwheel = function(event) {
        // 缩放时 需要把画布上的内容先拿出来作为基础再去放大缩小

        if (!that.isCanvas) return;
        that.isCanvas = false;
        let pos = {
          x: event.offsetX,
          y: event.offsetY
        };
        if (event.wheelDelta > 0) {
          that.imgScale += 0.1;
          let diffX = pos.x - that.imgX;
          let diffY = pos.y - that.imgY;

          let resX = (diffX / (that.imgScale - 0.1)) * that.imgScale;
          let resY = (diffY / (that.imgScale - 0.1)) * that.imgScale;

          that.imgX = pos.x - resX;
          that.imgY = pos.y - resY;
        } else {
          // 最小宽度不能小于200
          if (domCanvas.width * that.imgScale <= 200) return;

          that.imgScale -= 0.1;

          let diffX = pos.x - that.imgX;
          let diffY = pos.y - that.imgY;

          let resX = (diffX / (that.imgScale + 0.1)) * that.imgScale;
          let resY = (diffY / (that.imgScale + 0.1)) * that.imgScale;

          that.imgX = pos.x - resX;
          that.imgY = pos.y - resY;
        }
        if (that.canvasBaseDom) {
          that.fillImgToCanvas();
        } else {
          let base64 = domCanvas.toDataURL();
          let imgdom = document.querySelector("#resultImg");
          imgdom.onload = () => {
            that.canvasBaseDom = imgdom;
            that.fillImgToCanvas();
          };
          imgdom.src = base64; //和 573行的代码 换一下
        }
      };
    },
    getBoundingClientRect(x, y) {
      return {
        x: x - domCanvas.offsetLeft + document.body.scrollLeft,
        y: y - domCanvas.offsetTop + document.body.scrollTop
      };
    },
    fillImgToCanvas(oldImgDom) {
      if (!ctxSlw1) return;
      ctxSlw.globalCompositeOperation = "source-over";
      ctxSlw.lineWidth = 2;
      ctxSlw.strokeStyle = "red";
      ctxSlw1.clearRect(0, 0, this.canvasObj.width, this.canvasObj.height);
      ctxSlw.clearRect(0, 0, this.canvasObj.width, this.canvasObj.height);
      if (this.canvasBaseDom) {
        // 画布的重新绘制
        ctxSlw.drawImage(
          this.canvasBaseDom,
          0,
          0,
          this.canvasObj.width,
          this.canvasObj.height,
          this.imgX,
          this.imgY, //在画布上放置图像的 x 、y坐标位置。
          this.canvasObj.width * this.imgScale,
          this.canvasObj.height * this.imgScale
        );
      }

      ctxSlw1.drawImage(
        oldImgDom ? oldImgDom : imgDom,
        0,
        0,
        this.canvasObj.width,
        this.canvasObj.height,
        this.imgX,
        this.imgY, //在画布上放置图像的 x 、y坐标位置。
        this.canvasObj.width * this.imgScale,
        this.canvasObj.height * this.imgScale
      );
      if (oldImgDom) {
        imgDom = oldImgDom;
      }
      setTimeout(() => {
        this.isCanvas = true;
      }, 100);
    }
  }
};
</script>

<style lang="scss" scoped>
#editImage {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  background: #262626;
  padding: 16px;
  position: relative;
  box-sizing: border-box;
  .notData {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #777f92;

    i {
      font-size: 50px;
      color: #c0c4cc;
    }
    span {
      padding-top: 24px;
      color: #ffffff;
      font-size: 18px;
    }
  }
  .loading {
    font-size: 50px;
    color: #fff;
    transition: 0.5s;
    // transform-origin: 30px 30px;
    animation: rotate 5s linear infinite;
  }

  @keyframes rotate {
    0% {
      transform: rotate(0);
    }
    50% {
      transform: rotate(360deg);
    }
    100% {
      transform: rotate(0);
    }
  }

  .switchBtnL {
    left: 32px;
  }
  .switchBtnR {
    right: 32px;
  }
  .switchBtn {
    cursor: pointer;
    z-index: 10002;
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    top: calc(50% - 44px);
    background: rgba(0, 0, 0, 0.25);
    i {
      color: #fff;
      font-size: 20px;
    }
  }
  #resultImg {
    width: auto;
    height: auto;
    position: fixed;
    bottom: 9999px;
    // bottom: 100px;
    z-index: 999999;
  }
  #canvasWrapperBox {
    overflow: hidden;
  }
  .canvasWrapper {
    width: 100%;
    height: 100%;
    position: relative;
    transition: all 0.2s ease;
    overflow: hidden;
    #edit-Image-bottom {
      position: absolute;
      left: 0;
      top: 0;
      z-index: 9999;
    }
    #edit-Image-slw {
      position: absolute;
      left: 0;
      top: 0;
      z-index: 10001;
    }
  }
  #inputWrapper {
    display: flex;
    justify-content: center;
    position: absolute;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10002;
    .operatBtn {
      font-size: 10px;
      background: #fa541c;
      color: #fff;
      padding: 3px 5px;
      cursor: pointer;
      margin-left: 10px;
    }
    #ctxInput {
      background: rgba(0, 0, 0, 0);
      outline: none;
      width: 200px;
      border: none;
      height: 20px;
      color: red;
      font-size: 16px;
    }
  }
  .previewImg {
    position: absolute;
    left: 16px;
    bottom: 0;
    .active {
      border: 4px solid #fa541c;
    }
    img {
      cursor: pointer;
      width: 64px;
      height: 64px;
      margin-right: 16px;
      border-radius: 4px;
      box-sizing: border-box;
    }
  }
  .eraserWrapper {
    position: absolute;
    right: 16px;
    bottom: 16px;
    .eraserList {
      padding-left: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0;
      padding: 0;
      .eraserItem {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        white-space: nowrap;
        list-style: none;
        color: #fff;
        margin-left: 36px;
        margin-right: 0;
        cursor: pointer;
        i {
          font-size: 20px;
        }
        span {
          font-size: 16px;
          padding-top: 10px;
        }
      }
    }
  }
  .oldImage_slw {
    opacity: 0;
    width: 0;
    height: 0;
  }
}
</style>
