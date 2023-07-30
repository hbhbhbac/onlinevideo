<template>
  <!-- <videoPlayer ref="videoPlayer" :options="playerOptions" class="vjs-custom-skin videoPlayer" :playsinline="true" />-->
  <!-- <img id="img" src="http://152.136.213.16:8001/video/pull" /> -->
  <!-- <img id="img" src="@/assets/logo.png" /> -->


  <div class="main-wrap">
    <canvas ref="canvas" height="926" width="1920" style='border:1px solid #d3d3d3; ' id="video-canvas">
    </canvas>
    <!-- <img id="img" /> -->>
  </div>
</template>
<script setup>
import { onBeforeUnmount, onMounted, ref, nextTick } from 'vue';
import { VideoTrans } from '@/api/videotrans';
import exifr from 'exifr'

var reader = null
var stream = null
var SOI = new Uint8Array([0xff, 0xd8])
var EOI = new Uint8Array([0xff, 0xd9])
var TimerMode = true
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
const timeStamp = ref('')

// 读取数据流
const readStream = () => {
  reader.read().then(({ done, value }) => {
    if (done) {
      // 如果流已经结束，返回
      return;
    }
    var date = new Date()
    // console.log(value, 'value的长度', value.length, date.getTime())
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
    // 再次调用自身函数，继续读取数据
    readStream();
  });
}

// 画布
const canvas = ref()
const ctx = ref(null)

// 计时器 定时刷新画布
const timer = ref(0)

var img

// 画布处理函数 每30ms绘制一次 并记录该图像的时间戳
const drawCanvas = () => {
  ctx.value = canvas.value.getContext('2d')
  img = new Image();
  img.onload = function () {
    ctx.value.drawImage(img, 0, 0);
    console.log('img.onload')
    exifr.parse(img).then((exifData) => {
      console.log(exifData)
    }).catch((err) => {
      console.log(err)
    })
  };

  img.src = "http://127.0.0.1:8000/api/video/pull?url=test.mp4";
  timer.value = window.setInterval(function refreshCanvas() { ctx.value.drawImage(img, 0, 0);}, 40);


  // timer.value = window.setInterval(function refreshCanvas() {
  //   img.src = imageUrl.value;

  //   try {
  //     img.onload = async () => {
  //       ctx.value.drawImage(img, 0, 0);
  //     };
  //   } catch (error) {
  //     // 异常处理代码
  //     console.log('异常:', error);
  //   }
  // }, 40);
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
    const { done, value } = await reader.read();
    if (done) {
      // 如果流已经结束，跳出循环
      break;
    }
    console.log(value, 'value的长度', value.length)
    stream = URL.createObjectURL(value);
    imageUrl.value = stream
    // // 否则，继续处理数据
    // const data = new Uint8Array(value);
    // const index = indexOfSOI(data);
    // if (index > -1) {
    //   // 获取index之后的信息并转换为图像
    //   const blob = new Blob([data.slice(index)], {
    //     type: "image/jpeg",
    //   });
    //   stream = URL.createObjectURL(blob);
    //   imageUrl.value = stream

    //   // 根据后端传输的速率绘制画布
    //   if (!TimerMode) {
    //     drawCanvasAccrodingBackEnd()
    //   }
    // }
  }
}

// 绘制画布 不设置计时器 根据后端的传递速率设置绘制的频率
const drawCanvasAccrodingBackEnd = () => {
  var img = new Image();
  img.src = imageUrl.value;

  img.onload = () => {
    exifr.parse(img).then(exifData => {
      // 处理 exifData
      timeStamp.value = exifData.DocumentName
      // console.log('时间戳', exifData.ModifyDate)
    });
    ctx.value.drawImage(img, 0, 0);
  };
}

// 获取鼠标坐标和解析的时间戳
const savePoint = (e) => {
  e.preventDefault() // 阻止默认右键菜单的弹出

  var data = {}
  console.log('click', img)
  exifr.parse(img).then(exifData => {
    // 处理 exifData
    data.frameId = exifData.DocumentName
    data.width = e.pageX
    data.height = e.pageY
    data.result = e.button == 0 ? 'NORMAL' : 'DOUBTFUL'

    console.log(data)
    // console.log('时间戳', exifData.ModifyDate)
  });
  // clickVideo(data)
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
  // 获取并处理数据流
  // getStreamData()
  // 设置画布处理器 计时器版本 每30ms一次渲染
  drawCanvas()
})

onBeforeUnmount(() => {
  window.clearInterval(imgSrcTimer.value)
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
