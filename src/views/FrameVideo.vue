<template>
  <div class="main-wrap">
    <canvas ref="canvas" height="926" width="1920" style='border:1px solid #d3d3d3; ' id="video-canvas">
    </canvas>
  </div>
</template>
<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { VideoTrans } from '@/api/videotrans';

import exifr from 'exifr'

var reader = null
var stream = null
var SOI = new Uint8Array([0xff, 0xd8])
// 寻找图像开始的标志
const indexOfSOI = (array) => {
  for (let i = 0; i < array.length - 1; i++) {
    if (
      array[i] === SOI[0] &&
      array[i + 1] === SOI[1]
    ) {
      return i;
    }
  }
  return -1;
}

// 实时记录url和时间戳
const imageUrl = ref('')
const timeStamp = ref(null)

// 画布
const canvas = ref()
const ctx = ref(null)

// 计时器 定时刷新画布
const timer = ref(0)
const drawCanvas = () => {
  ctx.value = canvas.value.getContext('2d')
  timer.value = window.setInterval(function refreshCanvas() {
    var img = new Image();
    img.src = imageUrl.value;
    img.onload = () => {
      // 使用 exif-js 库解析图像的 EXIF 数据
      exifr.parse(img).then(exifData => {
        // 处理 exifData
        timeStamp.value = exifData.DocumentName
      });
      ctx.value.drawImage(img, 0, 0);
    };
  }, 30);
}

// // 流式接收数据函数
const getStreamData = () => {
  http://152.136.213.16:8001/video/pull?url=rtmp://152.136.213.16:1935/live/test
  fetch("http://127.0.0.1:8000/api/video/pull?url=test.mp4")
    .then((response) => {
      // 获取可读流
      const stream = response.body;
      // 获取读取器a
      reader = stream.getReader();
      // 循环地从流中读取数据
      readStreamLoop()
    })
    .catch((error) => {
      // 处理错误情况
      console.error(error);
    });
}

// 循环获取数据 避免长时间递归造成的信息爆栈
async function readStreamLoop() {
  while (true) {
    console.time('await reader.read()')
    const { done, value } = await reader.read();
    console.timeEnd('await reader.read()')
    if (done) {
      // 如果流已经结束，跳出循环
      break;
    }
    // 否则，继续处理数据
    const data = new Uint8Array(value);
    const index = indexOfSOI(data);
    if (index > -1) {
      // 获取index之后的信息并转换为图像
      const blob = new Blob([data.slice(index)], {
        type: "image/jpeg",
      });
      stream = URL.createObjectURL(blob);
      imageUrl.value = stream
    }
  }
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

// 点击事件发生 修改行李箱状态
const clickVideo = (data) => {
  console.log(data)
  VideoTrans.ClickVideo(data).then((res) => {
  }).catch((err) => {
    console.log(err)
  })
}

const preventContextMenu = (e) => {
  e.preventDefault(); // 阻止默认右键菜单的弹出
}

// 阻止默认右键菜单的弹出
onMounted(() => {
  const videoElement = document.getElementById('video-canvas')
  videoElement.addEventListener('mousedown', savePoint)
  videoElement.addEventListener('contextmenu', preventContextMenu)
  getStreamData()
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
