<template>
  <div class="main-wrap">
    <canvas ref="canvas" height="926" width="1920" style='border:1px solid #d3d3d3; ' id="video-canvas">
    </canvas>
    <!-- <img id="img" src="http://127.0.0.1:8000/api/video/pull?url=test.mp4"/> -->
  </div>
  <div id="imageContainer"></div>
</template>
<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { VideoTrans } from '@/api/videotrans';
// 渲染间隔
var gaptime = 30
// 画布
const canvas = ref()
const ctx = ref(null)
var img

// 计时器 定时刷新画布
const timer = ref(0)
const drawCanvas = () => {
  ctx.value = canvas.value.getContext('2d')
  img = new Image();

  img.src = "http://127.0.0.1:8000/api/video/pull?url=test.mp4";
  window.setInterval(function refreshCanvas() {
    ctx.value.drawImage(img, 0, 0);
  }, gaptime);
}


// 点击事件发生 修改行李箱状态
const clickVideo = (data) => {
  console.log(data)
  VideoTrans.ClickVideo(data).then((res) => {
    console.log('点击视频后端接收到的参数', data, '后端返回的结果', res)
  }).catch((err) => {
    console.log(err)
    window.alert('出错了！' + err)
  })
}

// 获取鼠标坐标和解析的时间戳
function savePoint(e) {
  e.preventDefault(); // 阻止默认右键菜单的弹出

  var data = {};

  data.width = e.pageX;
  data.height = e.pageY;
  data.result = e.button == 0 ? 'NORMAL' : 'DOUBTFUL';

  clickVideo(data);
}

// 阻止默认右键菜单的弹出
const preventContextMenu = (e) => {
  e.preventDefault()
}


onMounted(() => {
  // 监听鼠标 在canvas元素中监听
  const videoElement = document.getElementById('video-canvas')
  videoElement.addEventListener('mousedown', savePoint)
  videoElement.addEventListener('contextmenu', preventContextMenu)
  // 设置画布处理器 计时器版本 每30ms一次渲染
  drawCanvas()
})

onBeforeUnmount(() => {
  window.clearInterval(timer.value)
})

</script>
<style coped>
.main-wrap {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
