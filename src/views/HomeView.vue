<template>
  <div class="main-wrap">
    <img id="img" src="http://127.0.0.1:8000/api/video/pull?url=test.mp4" height="926" width="1920" />
  </div>
</template>
<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { VideoTrans } from '@/api/videotrans';

// 点击事件发生 修改行李箱状态
const clickVideo = (data) => {
  const startTime = new Date().getTime(); // 获取点击事件发生的时间戳
  console.log(data)
  VideoTrans.ClickVideo(data).then((res) => {
    const endTime = new Date().getTime(); // 获取后端响应返回的时间戳
    const duration = endTime - startTime; // 计算前后端传输的耗时
    console.log('前后端传输耗时：', duration, '毫秒');
  }).catch((err) => {
    console.log(err)
    window.alert('出错了！' + err)
  })
}

// 获取鼠标坐标和解析的时间戳
function savePoint(e) {
  var data = {};

  data.width = e.offsetX;
  data.height = e.offsetY;
  data.result = e.button == 0 ? 'NORMAL' : 'DOUBTFUL';

  clickVideo(data);
  e.preventDefault(); // 阻止默认右键菜单的弹出
}

// 阻止默认右键菜单的弹出
const preventContextMenu = (e) => {
  e.preventDefault()
}


onMounted(() => {
  // 监听鼠标 在canvas元素中监听
  const videoElement = document.getElementById('img')
  videoElement.addEventListener('mousedown', savePoint)
  videoElement.addEventListener('contextmenu', preventContextMenu)
  // 设置画布处理器 计时器版本 每30ms一次渲染
  // drawCanvas()
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
