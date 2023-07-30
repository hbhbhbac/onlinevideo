<template>
    <div>
        <!-- <img id="image" src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg"> -->
        <img src="http://127.0.0.1:8000/api/video/pull?url=test.mp4">
        {{ exifdata }}
        {{ exifdata2 }}
    </div>
</template>
<script setup>
import exifr from 'exifr'
import { onBeforeUnmount, onMounted, ref, nextTick } from 'vue';
const exifdata = ref('')
const exifdata2 = ref('')
onMounted(() => {
    var test1 = new Image()
    test1.src = 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg'
    var test2 = document.getElementById('image')
    console.log(test2)
    exifr.parse(test2).then(output => {

        exifdata2.value = output
        console.log(output)
    })
    test1.onload = function () {
        console.log(test1)
        exifr.parse(test1).then(output => {
            exifdata.value = output
            console.log(output)
        })
    }
})
</script>