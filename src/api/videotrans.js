import service from "../http/request";
const url = {
    clickVideo: '/api/video/check',
    getLuggageList: '/api/luggage/page/list'
}
// 详细参考见：https://www.axios-http.cn/docs/req_config
export class VideoTrans {
    // 本次的body默认使用JSON而不是FormData
    static async getVideo(data) {
        return service(url.video, {
            // 方法，默认为 get
            method: "post",
            // 返回值类型，默认为json
            responseType: "blob",
            headers: {
                'Content-Type': 'application/json'
            },
            dataType: "text",
            xhrFields: {
                onprogress: function (e) {
                    console.log(e)
                    // let progressResponse, lastResponseLength = false;
                    // let response = e.currentTarget.response;
                    // if (lastResponseLength === false) {
                    //     progressResponse = response;
                    //     lastResponseLength = response.length;
                    // } else {
                    //     progressResponse = response.substring(lastResponseLength);
                    //     lastResponseLength = response.length;
                    // }
                    // console.log(progressResponse)
                }
            },
            // 这里是 data: data的简写
            data
        });
    }

    static async ClickVideo(param) {
        return service(url.clickVideo, {
            // 方法，默认为 get
            method: "get",
            // 这里是 data: data的简写
            params: param
        });
    }

    static async GetLuggageList(param) {
        return service(url.getLuggageList, {
            // 方法，默认为 get
            method: "get",
            // 这里是 data: data的简写
            params: param
        });
    }
}