var Index = function () {
    // echarts theme
    var theme = "macarons";

    var option = {
        title: {
            top: '5%',
            left: '10%',
            text: ''
        },
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                var rs = [];
                if (params.length <= 0) return "";
                rs.push(params[0]["axisValue"] + " （百万请求量）<br>");
                for (var i = 0; i < params.length; i++) {
                    rs.push(params[i]["seriesName"] + " : " + params[i]["data"][1] + " （每秒请求数）<br>");
                }
                return rs.join("");
            }
        },
        legend: {
            top: '5%',
            left: '30%',
            textStyle: {
                fontSize: 20
            },
            data: []
        },
        grid: {
            top: '15%',
            left: '10%',
            right: '15%',
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
            interval: 20,
            name: '总共请求数（单位：百万）',
            nameTextStyle: {
                fontSize: 20
            }
        },
        yAxis: {
            type: 'value',
            min: 100000,
            interval: 10000,
            name: '吞吐量（每秒处理请求数）',
            nameTextStyle: {
                fontSize: 20
            }
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
                line["showSymbol"] = false;
                line["hoverAnimation"] = false;
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