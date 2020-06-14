# edit-image

> 实现了在图片上随意输入文字以及做标记

## 项目入口: dist/editImage.js



``` bash

    npm i edit-draw-image

    import editImage from 'edit-draw-image'

    <editImage :oldImage="img" v-model="base64Src" @closeDialog="closeDialog"></editImage>

    oldImage 参数如果是网络图片 直接传递网络地址，如果是本地图片请传递require('图片地址')


```
提交bug地址：https://github.com/819slw/editImage.git

个人看issue个数，如果提交的人多了，我会完善一下，目前这个版本够自己用了。