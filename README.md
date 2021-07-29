<!--
 * @Author: your name
 * @Date: 2020-07-29 17:59:12
 * @LastEditTime: 2021-07-16 10:41:12
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /editImage/README.md
-->

# edit-image

> 整屏图片绘制
> 包含功能：橡皮擦、画线、撤销、前进、实时保存

```bash

  npm i edit-draw-image

  import editImage from 'edit-draw-image'

  <editImage :oldImage="img" v-model="base64Src" @closeDialog="closeDialog"></editImage>

  oldImage 参数如果是网络图片 直接传递网络地址，如果是本地图片请传递require('图片地址')

  oldImage: 初始图片，可以是网络图片
  base64Src: 实时保存图片数据，base64。可以watch监听这个值
  closeDialog: 关闭dialog的回调

```
