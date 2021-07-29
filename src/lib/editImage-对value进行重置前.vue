<template>
  <div id="editImage">
    <!-- 画布 -->
    <div class="canvasWrapper" id="canvasWrapper">
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
    otherHeight: {
      type: Number,
      default: () => 0,
    },
    value: {
      type: "",
      default: () => "",
    },
    oldImage: {
      type: String,
      default: () => "",
    },
  },
  data() {
    return {
      isCanvas: true, // 是否可以绘制。考虑到是两层canvas
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
          name: "后退",
          pic: "后退",
          icon: "ri-zoom-in-line",
          callBack: () => {
            return this.next();
          },
        },
        {
          name: "前进",
          pic: "前进",
          icon: "ri-zoom-in-line",
          callBack: () => {
            return this.last();
          },
        },
        {
          name: "旋转",
          pic: "旋转",
          icon: "ri-zoom-in-line",
          callBack: () => {
            return this.tranform();
          },
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
          },
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
          },
        },
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
        y: 0,
      },
      canvasObj: {
        width: 0,
        height: 0,
      },
    };
  },
  mounted() {
    //首先第一步是设置canvas的高度和宽度
    // 首先是获取最外层容器的宽度:w1和高度:h1
    let dom = document.querySelector("#editImage");
    let w1 = dom.clientWidth;
    let h1 = dom.clientHeight;
    // 拿到w1和w2之后，计算出canvas的实际宽度:cw1和高度ch1
    let cw1 = w1 - 32; // 根据UI的设定减去两边的padding: 16px
    let ch1 = h1 - 96 - this.otherHeight; // 96 是底部的工作区， this.otherHeight是顶部你们slot插入的容器高度，默认是0

    let img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      // this.canvasObj.width = img.naturalWidth;
      // this.canvasObj.height = img.naturalHeight;
      this.canvasObj.width = cw1;
      this.canvasObj.height = ch1;
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
    img.src = this.oldImage;
    this.watchScreen();
  },
  methods: {
    next() {
      this.recordOperate(0);
    },
    last() {
      this.recordOperate(1);
    },
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
    saveImg() {
      ctxSlw1.drawImage(domCanvas, 0, 0);
      let base64 = domCanvas1.toDataURL();
      return base64;
    },
    watchScreen() {
      let dom = document.querySelector("#editImage");
      window.onresize = () => {
        let screenWidth = dom.clientWidth;
        let screenHeight = dom.clientHeight;
      };
    },
    cancleDialog() {
      this.$emit("closeDialog");
    },
    getBaseContent() {
      this.$emit("input", domCanvas.toDataURL());
    },
    cancleInput() {
      let inputDom = document.getElementById("ctxInput");
      inputDom.value = "";
      this.isShowInput = false;
    },
    confrimInput() {
      let inputDom = document.getElementById("ctxInput");
      ctxSlw.font = "bold 24px sans-serif";
      ctxSlw.fillStyle = "red";
      ctxSlw.fillText(
        inputDom.value,
        this.getBoundingClientRect(this.nowClient.x, this.nowClient.y).x,
        this.getBoundingClientRect(this.nowClient.x, this.nowClient.y).y
      );
    },
    // 初始化 input框
    _initInput(event) {
      this.isShowInput = true;
      this.$nextTick(() => {
        // 这里存在两个x和y值：1.input的位移。 和input在canvas的位移
        let inputDom = document.getElementById("inputWrapper");
        let that = this;

        domCanvas.onmousedown = (e) => {
          this.nowClient.x = e.offsetX;
          this.nowClient.y = e.offsetY;
          inputDom.style.left = e.offsetX + "px";
          inputDom.style.top = e.offsetY + "px";
        };
      });
    },
    // 初始化 橡皮
    _initEraser() {
      let that = this;
      ctxSlw.lineWidth = 20;
      ctxSlw.lineCap = "round";
      ctxSlw.lineJoin = "round";
      // ctxSlw.strokeStyle = "#000"; //画笔颜色
      ctxSlw.globalCompositeOperation = "destination-out";
      let drawing = false;
      domCanvas.onmousedown = function (e) {
        var first = that.getBoundingClientRect(e.offsetX, e.offsetY);
        ctxSlw.save();
        ctxSlw.beginPath();
        ctxSlw.moveTo(first.x, first.y);
        drawing = true;
      };
      domCanvas.onmousemove = function (e) {
        if (drawing) {
          var move = that.getBoundingClientRect(e.offsetX, e.offsetY);
          ctxSlw.save();
          ctxSlw.lineTo(move.x, move.y);
          ctxSlw.stroke();
          ctxSlw.restore();
        }
      };
      domCanvas.onmouseup = function () {
        drawing = false;
      };
      domCanvas.onmouseleave = function () {
        drawing = false;
        domCanvas.onmouseup();
      };
    },
    // 初始化绘画曲线
    _initFun() {
      let penWeight = 2;
      let penColor = "red";
      let that = this;
      domCanvas.onmousedown = (e) => {
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

        domCanvas.onmousemove = function (e) {
          /*找到鼠标（画笔）的坐标*/

          var move_x =
            e.offsetX - domCanvas.offsetLeft + document.body.scrollLeft;
          var move_y =
            e.offsetY - domCanvas.offsetTop + document.body.scrollTop;
          ctxSlw.lineTo(move_x, move_y); //根据鼠标路径绘画
          ctxSlw.stroke(); //立即渲染
        };

        domCanvas.onmouseup = function () {
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

        domCanvas.onmouseleave = function () {
          ctxSlw.closePath();
          domCanvas.onmousemove = null;
          domCanvas.onmouseup = null;
        };
      };

      // 缩放
      domCanvas.onmousewheel = domCanvas.onwheel = function (event) {
        let pos = {
          x: event.offsetX,
          y: event.offsetY,
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
        that.fillImgToCanvas();
      };
    },
    getBoundingClientRect(x, y) {
      return {
        x: x - domCanvas.offsetLeft + document.body.scrollLeft,
        y: y - domCanvas.offsetTop + document.body.scrollTop,
      };
    },
    fillImgToCanvas(oldImgDom) {
      if (!ctxSlw1) return;
      if (!this.isCanvas) return;
      let base64 = domCanvas.toDataURL();
      let imgdom = document.querySelector("#resultImg");
      imgdom.src = base64;
      imgdom.onload = () => {
        ctxSlw1.clearRect(0, 0, this.canvasObj.width, this.canvasObj.height);
        ctxSlw.clearRect(0, 0, this.canvasObj.width, this.canvasObj.height);
        ctxSlw.drawImage(
          imgdom,
          0,
          0,
          this.canvasObj.width,
          this.canvasObj.height,
          this.imgX,
          this.imgY, //在画布上放置图像的 x 、y坐标位置。
          this.canvasObj.width * this.imgScale,
          this.canvasObj.height * this.imgScale
        );
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
        this.isCanvas = true;
      };
    },
  },
};
</script>

<style lang="scss" scoped>
#editImage {
  width: 1036px;
  height: 645px;
  background: rgba(0, 0, 0, 0.5);
  background: #262626;
  padding: 16px;
  position: relative;
  box-sizing: border-box;
  #resultImg {
    width: 1200px;
    height: 799px;
  }
  .canvasWrapper {
    position: relative;
    transition: all 0.2s ease;
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
    padding: 3px;
    position: fixed;
    background: #fff;
    z-index: 10002;
    .operatBtn {
      font-size: 12px;
      background: #eee;
      border-radius: 3px;
      margin-left: 10px;
      padding: 3px 5px;
      cursor: pointer;
    }
    #ctxInput {
      background: rgba(0, 0, 0, 0);
      outline: none;
      border: 1px solid #000;
      width: 200px;
      height: 20px;
      color: red;
      font-size: 16px;
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
