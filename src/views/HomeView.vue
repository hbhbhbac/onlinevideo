<template>
  <!-- <videoPlayer ref="videoPlayer" :options="playerOptions" class="vjs-custom-skin videoPlayer" :playsinline="true" />-->
  <!-- <img id="img" src="http://152.136.213.16:8001/video/pull" /> -->
  <!-- <img id="img" src="@/assets/logo.png" /> -->


  <div class="main-wrap">
    <canvas ref="canvas" height="1080" width="1920" style='border:1px solid #d3d3d3; ' id="video-canvas">
    </canvas>
    <!-- <img id="img" /> -->
  </div>
</template>
<script setup>
import { onBeforeUnmount, onMounted, ref, nextTick } from 'vue';
import { VideoTrans } from '@/api/videotrans';
import exifr from 'exifr'
// import LogoImg from '../assets/logo.png'
// import { VideoTrans } from '../api/videotrans'

// const formMethod = () => {
//     const url = 'http://152.136.213.16:8001/video/pull?stream_type=VIDEO&url=rtmp://152.136.213.16:1935/live/1111';
//     const post_data = {
//       // "csrfmiddlewaretoken": getCookie('csrftoken'),
//       "key1": "value1",
//       "key2": "value2",
//     };
//     let form = document.createElement("form");
//     form.method = "POST";
//     form.action = url;
//     Object.keys(post_data).forEach(function (key){
//       let element = document.createElement("input");
//       element.name = key;
//       element.value = post_data[key];
//       form.appendChild(element);
//     })
//     document.body.appendChild(form);
//     form.submit();
// }

// const nbMethod = () => {
//   var xhr = new XMLHttpRequest();
//   xhr.open('GET', 'http://152.136.213.16:8001/video/pull', true);
//   xhr.responseType = 'blob';
//   xhr.onreadystatechange = function () {
//     if (xhr.readyState == 4 && xhr.status == 200) {
//       // 处理数据流
//       var blob = xhr.response;
//       var url = URL.createObjectURL(blob);
//       document.getElementById('img').src = url;
//     }
//   };
//   xhr.send();
// }

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
// var ctx = document.getElementById('test_canvas').getContext('2d');

// 画布处理函数 每30ms绘制一次 并记录该图像的时间戳
const drawCanvas = () => {
  ctx.value = canvas.value.getContext('2d')

  timer.value = window.setInterval(function refreshCanvas() {
    var img = new Image();
    img.src = imageUrl.value;

    try {
      var a = new Date()
      // console.log(a.getTime())
      img.onload = async () => {
        exifr.parse(img).then(exifData => {
          // 处理 exifData
          timeStamp.value = exifData.DocumentName
          var b = new Date()
          // console.log(b.getTime())
          // console.log('时间戳', exifData.ModifyDate)
        });
        ctx.value.drawImage(img, 0, 0);
      };
    } catch (error) {
      // 异常处理代码
      console.log('异常:', error);
      // 根据需要进行错误处理，例如显示错误信息给用户
      // errorMessage.value = '发生了一个异常，请稍后重试';
    }
  }, 10);
}

const imgSrcTimer = ref()
// 设置更新计时器 不行 会出现闪烁
const setIamgeSrcTimer = () => {
  imgSrcTimer.value = window.setInterval(() => {
    document.getElementById('img').src = imageUrl.value
  }, 30);
}

// 点击事件发生 修改行李箱状态
const clickVideo = (type) => {
  var data = {
    frameId: timeStamp.value,
    result: type,
    height: point.value.y,
    width: point.value.x
  }
  console.log(data)
  VideoTrans.ClickVideo(data).then((res) => {
    console.log('点击视频后端接收到的参数', data, '后端返回的结果', res)
  }).catch((err) => {
    console.log(err)
    window.alert('出错了！' + err)
  })
}

// 流式接收数据函数
const getStreamData = () => {
  http://152.136.213.16:8001/video/pull?url=rtmp://152.136.213.16:1935/live/test
  fetch("http://127.0.0.1:8000/api/video/pull?url=test.mp4")
    .then((response) => {
      // 获取可读流
      const stream = response.body;
      // 获取读取器a
      reader = stream.getReader();
      // 递归地从流中读取数据
      // readStream();
      // 循环地从流中读取数据
      readStreamLoop()
    })
    .catch((error) => {
      // 处理错误情况
      console.error(error);
    });

  // fetch("http://127.0.0.1:8000/video/pull")
  // // Retrieve its body as ReadableStream
  // .then((response) => {
  //   const reader = response.body.getReader();
  //   console.log("reader", reader)
  //   return new ReadableStream({
  //     start(controller) {
  //       return pump();
  //       function pump() {
  //         return reader.read().then(({ done, value }) => {
  //           // When no more data needs to be consumed, close the stream
  //           console.log(done, value)
  //           if (done) {
  //             controller.close();
  //             return;
  //           }
  //           // Enqueue the next data chunk into our target stream
  //           controller.enqueue(value);
  //           return pump();
  //         });
  //       }
  //     },
  //   });
  // })
  // // Create a new response out of the stream
  // .then((stream) => new Response(stream))
  // // Create an object URL for the response
  // .then((response) => response.blob())
  // .then((blob) => 
  //   URL.createObjectURL(blob))
  // // Update image
  // .then((url) => console.log((document.getElementById('img').src = url)))
  // .catch((err) => console.error(err));
}

// 循环获取数据 避免长时间递归造成的信息爆栈
async function readStreamLoop() {
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      // 如果流已经结束，跳出循环
      break;
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

      // 根据后端传输的速率绘制画布
      if (!TimerMode) {
        drawCanvasAccrodingBackEnd()
      }
    }
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
  // try {
  //   img.onload = async () => {
  //     exifr.parse(img).then(exifData => {
  //       // 处理 exifData
  //       timeStamp.value = exifData.DocumentName
  //       // console.log('时间戳', exifData.ModifyDate)
  //     });
  //     ctx.value.drawImage(img, 0, 0);
  //   };
  // } catch (error) {
  //   // 异常处理代码
  //   console.log('异常:', error);
  //   // 根据需要进行错误处理，例如显示错误信息给用户
  //   // errorMessage.value = '发生了一个异常，请稍后重试';
  // }
}


// 记录鼠标坐标
const point = ref({ x: 0, y: 0, type: 'NORMAL' })

// 获取鼠标坐标
const savePoint = (e) => {
  e.preventDefault() // 阻止默认右键菜单的弹出

  point.value.x = e.pageX
  point.value.y = e.pageY
  point.value.type = e.button == 0 ? 'NORMAL' : 'DOUBTFUL'

  if (e.button == 0) clickVideo('NORMAL')
  else clickVideo('DOUBTFUL')

  console.log(e.button)
  console.log(point.value)
  console.log(timeStamp.value)
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
  if (!TimerMode) {
    ctx.value = canvas.value.getContext('2d')
  }
  // 获取并处理数据流
  getStreamData()
  // setIamgeSrcTimer()
  // 设置画布处理器 计时器版本 每30ms一次渲染
  if (TimerMode) {
    drawCanvas()
    // setIamgeSrcTimer()
  }
  // drawCanvas()
  // 不设置计时器 根据后端传递的频率渲染画布
  // var imgEl = document.getElementById('image')
  // imgEl.onload = function (e) {
  //   console.log(e, 'success')
  //   console.log(imgEl.complete)
  // }
  // imgEl.onerror = function (e) {
  //   console.log(e, 'fail')
  //   console.log(imgEl.complete) // true
  // }
  // VideoTrans.getVideo({}).then((res) => {
  //   console.log('axios请求返回', res)
  // }).catch((err) => {
  //   console.log(err)
  // })
  // nbMethod()



  // var ctx = document.getElementById('test_canvas').getContext('2d');
  // var img = new Image();
  // img.onload = function () {
  //   ctx.drawImage(img, 0, 0)
  // };

  // img.src = "http://152.136.213.16:8001/video/pull?stream_type=VIDEO&url=rtmp://152.136.213.16:1935/live/1111";
  // window.setInterval(refreshCanvas(), 10);

  // function refreshCanvas() {
  //   ctx.drawImage(img, 0, 0);
  // }
})

onBeforeUnmount(() => {
  // window.removeEventListener('click', savePoint)
  window.clearInterval(imgSrcTimer.value)
  window.clearInterval(timer.value)
})

// const refreshCanvas = () => {
//   ctx.drawImage(img, 0, 0);
// }

// const playerOptions = ref({
//   playbackRates: [0.7, 1.0, 1.5, 2.0], //播放速度
//   autoplay: false, //如果true,浏览器准备好时开始回放。
//   muted: false, // 默认情况下将会消除任何音频。
//   loop: false, // 导致视频一结束就重新开始。
//   preload: 'auto', // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
//   language: 'zh-CN',
//   aspectRatio: '16:9', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
//   techOrder: ['flash', 'html5'],      // 兼容顺序
//   sources: [{ // 流配置，数组形式，会根据兼容顺序自动切换
//     type: 'rtmp/hls',
//     src: 'rtmp://58.200.131.2:1935/livetv/hunantv'
//   }],
//   poster: "", //你的封面地址
//   // width: document.documentElement.clientWidth,
//   notSupportedMessage: '此视频暂无法播放，请稍后再试', // 允许覆盖Video.js无法播放媒体源时显示的默认信息。
//   controlBar: {
//     timeDivider: true,
//     durationDisplay: true,
//     remainingTimeDisplay: false,
//     fullscreenToggle: true  //全屏按钮
//   }
// })
</script>
<style coped>
.main-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
}
</style>
