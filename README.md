<!--
 * @Author: your name
 * @Date: 2020-07-29 17:59:12
 * @LastEditTime: 2021-07-29 13:03:46
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

  <editImage :oldImage="img" @setImgBase64=“setImgBase64”></editImage>

  oldImage:
    1.type:Array

  setImgBase64:
    1.切换图片时如果用户有更改会调用 setImgBase64 方法，参数为：(base64,index)

  saveImg:
    1.内置函数
    2.留给用户主动调用这个方法去获取图片上的绘制数据
    3.如果有绘制痕迹就会返回base64，如果没有就返回空字符


```

<!-- 发布npm包失败 -->

**npm config set registry https://registry.npmjs.org/**
