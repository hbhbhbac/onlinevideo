<template>
  <!-- <videoPlayer ref="videoPlayer" :options="playerOptions" class="vjs-custom-skin videoPlayer" :playsinline="true" />-->
  <img id="img" src="http://152.136.213.16:8001/video/pull" />

  <!-- <canvas id='test_canvas' width='640px' height='480px' style='border:1px solid #d3d3d3'>
  </canvas> -->
</template>
<script setup>
import { onMounted } from 'vue';
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
const readStream = () => {
  reader.read().then(({ done, value }) => {
    if (done) {
      // 如果流已经结束，返回
      return;
    }
    // 否则，继续处理数据
    const data = new Uint8Array(value);
    const index = indexOfSOI(data);
    if (index > -1) {
      const blob = new Blob([data.slice(index)], {
        type: "image/jpeg",
      });
      stream = URL.createObjectURL(blob);
      document.getElementById('img').src = stream;
    }
    // 再次调用自身函数，继续读取数据
    readStream();
  });
}

// @ is an alias to /src
// import { ref } from 'vue'
// import 'video.js/dist/video-js.css'
// import 'vue-video-player/src/custom-theme.css'
// import { videoPlayer } from 'vue-video-player'
// import 'videojs-flash'
onMounted(() => {
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
  fetch("http://152.136.213.16:8001/video/pull?url=rtmp://152.136.213.16:1935/live/test")
    .then((response) => {
      // 获取可读流
      const stream = response.body;
      console.log(stream)
      // 获取读取器
      reader = stream.getReader();
      // 递归地从流中读取数据
      readStream();
    })
    .catch((error) => {
      // 处理错误情况
      console.error(error);
    });


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
