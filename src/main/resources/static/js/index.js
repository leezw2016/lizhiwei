var Index = function () {
    // echarts theme
    var theme = "macarons";

    var option = {
        title: {
            top: '5%',
            left: '10%',
            text: 'title'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            top: '5%',
            data: []
        },
        grid: {
            top: '15%',
            left: '5%',
            right: '5%',
            bottom: '5%',
            containLabel: true
        },
        toolbox: {
            feature: {
                dataZoom: {
                    yAxisIndex: 'none'
                },
                restore: {},
                saveAsImage: {}
            }
        },
        dataZoom: [
            {
                type: 'slider',
                show: true,
                xAxisIndex: [0]
            },
            {
                type: 'inside',
                xAxisIndex: [0]
            }
        ],
        xAxis: {
            type: 'value',
            name: 'xAxis'
        },
        yAxis: {
            type: 'value',
            name: 'yAxis'
        },
        series: []
    };

    var lineChart;

    /**
     * 初始化 EChart
     */
    var lineInit = function () {
        lineChart = echarts.init(document.getElementById('line'), theme);
    };

    /**
     * 初始化 WebSocket
     */
    function webSocketInit() {
        var host = window.location.host;
        var ws;
        if ('WebSocket' in window) {
            ws = new WebSocket("ws://" + host + "/ws")
        } else {
            ws = new SockJS("http://" + host + "/sockjs/ws");
        }

        //连接打开事件
        ws.onopen = function () {
            console.log("onopen");
        };
        //收到消息事件
        ws.onmessage = function (msg) {
            // 将数据转成json对象
            var json = eval("(" + event.data + ")");
            // 如果信息出错，则直接返回，不作处理
            if (json["code"] !== 100) return;
            // handlerMsg(json["extend"]["data"]);
            // console.log(json["extend"]);
            var lineMap = json["extend"]["lineMap"];
            var legendData = [];
            var series = [];
            for (var key in lineMap) {
                var name = key;
                var lineList = lineMap[key];
                legendData.push(name);
                var line = {};
                line["name"] = name;
                line["type"] = "line";
                line["data"] = [];
                for (var i = 0; i < lineList.length; i++) {
                    var point = lineList[i];
                    var pArr = [point["x"], point["y"]];
                    line["data"].push(pArr);
                }
                series.push(line);
            }
            option.legend.data = legendData;
            option.series = series;
            // console.log(option);
            lineChart.setOption(option);
        };
        //连接关闭事件
        ws.onclose = function () {
            console.log("onclose");
        };
        //发生了错误事件
        ws.onerror = function () {
            console.log("onerroe");
        };

        //窗口关闭时，关闭连接
        window.unload = function () {
            ws.close();
        };
    }

    return {
        init: function () {
            lineInit();
            webSocketInit();
        }
    }
}();

jQuery(document).ready(function () {
    Index.init();
});