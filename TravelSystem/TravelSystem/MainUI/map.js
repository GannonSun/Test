
require([
    "esri/Map",
    "esri/views/MapView",
    "dojo/domReady!"
],function(Map,MapView){
    //var mymap = new Map({ basemap: "osm" });
    //var view = new MapView({ container: "map", map: mymap, zoom: 13, center: [119.29, 26.09] });
    var map = new BMap.Map("map");    // 创建Map实例
    var mPoint = new BMap.Point(119.29, 26.09);
    map.centerAndZoom(mPoint, 12);  // 初始化地图,设置中心点坐标和地图级别
    dojo.connect(dojo.byId("searchbutton"), "onclick", function () {
        map.clearOverlays();
        var local = new BMap.LocalSearch(map, {
            renderOptions: { map: map }
        });
        local.search(document.getElementById("textinput").value);
    });

    dojo.connect(dojo.byId("a-rank"), "onclick", function () {//点击a标签之后的div隐藏显示切换
        map.clearOverlays();
        rankresult.search("景点");
        for (var i = 0; i < document.getElementsByClassName("BMapLib_Drawing").length; i++) {
            document.getElementsByClassName("BMapLib_Drawing")[i].style.display = "none";
        }
        document.getElementById("a-select").style.background = "White";
        document.getElementById("a-collect").style.background = "White";
        document.getElementById("rank").style.display = "block";
        document.getElementById("select").style.display = "none";
        document.getElementById("collect").style.display = "none";
        document.getElementById("a-rank").style.background = "Red";
        document.getElementById("a1").style.background = "White";
        document.getElementById("a2").style.background = "White";
        document.getElementById("a3").style.background = "White";
    });
    


    dojo.connect(dojo.byId("a1"), "onclick", function () {//点击a标签之后的div隐藏显示切换
        rankresult.search("山景点");
        document.getElementById("a4").style.background = "White";
        document.getElementById("a2").style.background = "White";
        document.getElementById("a3").style.background = "White";
        document.getElementById("a1").style.background = "Red";
    });

    dojo.connect(dojo.byId("a2"), "onclick", function () {//点击a标签之后的div隐藏显示切换
        rankresult.search("公园");
        document.getElementById("a4").style.background = "White";
        document.getElementById("a1").style.background = "White";
        document.getElementById("a3").style.background = "White";
        document.getElementById("a2").style.background = "Red";
    });

    dojo.connect(dojo.byId("a3"), "onclick", function () {//点击a标签之后的div隐藏显示切换
        rankresult.search("游乐园");
        document.getElementById("a4").style.background = "White";
        document.getElementById("a2").style.background = "White";
        document.getElementById("a1").style.background = "White";
        document.getElementById("a3").style.background = "Red";
    });

    dojo.connect(dojo.byId("a4"), "onclick", function () {//点击a标签之后的div隐藏显示切换
        rankresult.search("古迹");
        document.getElementById("a3").style.background = "White";
        document.getElementById("a2").style.background = "White";
        document.getElementById("a1").style.background = "White";
        document.getElementById("a4").style.background = "Red";
    });

    dojo.connect(dojo.byId("a-select"), "onclick", function () { // 当点击周边查询选项卡时，打开绘制圆形的功能
        map.clearOverlays();
        map.centerAndZoom(mPoint, 12);
        var overlay = null;//圆覆盖物
        var label = null;//显示半径信息
        /**
         * 绘制完成后的事件
         */

        var overlays = [];
        var styleOptions = {
            strokeColor: "red",    //边线颜色。
            fillColor: "red",      //填充颜色。当参数为空时，圆形将没有填充效果。
            strokeWeight: 3,       //边线的宽度，以像素为单位。
            strokeOpacity: 0.8,	   //边线透明度，取值范围0 - 1。
            fillOpacity: 0.6,      //填充的透明度，取值范围0 - 1。
            strokeStyle: 'solid' //边线的样式，solid或dashed。
        }
        //实例化鼠标绘制工具
        var drawingManager = new BMapLib.DrawingManager(map, {
            isOpen: false, //是否开启绘制模式
            enableDrawingTool: true, //是否显示工具栏
            drawingToolOptions: {
                anchor: BMAP_ANCHOR_TOP_RIGHT, //位置
                offset: new BMap.Size(100, 5), //偏离值
                drawingModes: [
                    BMAP_DRAWING_CIRCLE
                ]
            },
            circleOptions: styleOptions, //圆的样式
        });

        var markerArr = [];
        drawingManager.addEventListener('overlaycomplete', function (e, overlay) {
            for (var i = 0; i < markerArr.length; i++) {
                map.removeOverlay(markerArr[i]);
            }
            var local = new BMap.LocalSearch(map, { renderOptions: { map: map, autoViewport: false } });
            local.searchNearby('景点', centerPoint, radius);
            local.setMarkersSetCallback(function (pois) {
                for (var i = 0; i < pois.length; i++) {
                    markerArr[i] = pois[i].marker;
                }
            })
            centerPoint = null;
            overlay = e.overlay;
            map.removeOverlay(label);
            map.removeOverlay(overlay);
        });

        var centerPoint = null;//圆心
        var radius = null;//半径
        map.addEventListener("mousemove", showInfo);
        /**
         * 监听鼠标移动事件
         */
        function showInfo(e) {
            //判断当前是画圆的模式
            if (drawingManager._mask != null) {
                drawingManager._mask.addEventListener('mousedown', getCenter);
                map.removeEventListener("mousemove", showInfo);
            }
        }
        /**
         * 得到当前圆的圆心坐标
         */
        var getCenter = function (e) {
            if (centerPoint == null) {
                centerPoint = e.point;
                drawingManager._mask.addEventListener("mousemove", showRadis);
            }
        }
        /**
         * 实时显示半径
         */
        var showRadis = function (e) {
            radius = drawingManager._map.getDistance(centerPoint, e.point);
            if (!isNaN(radius)) {
                map.removeOverlay(label); //取消上一个显示半径的label
                //添加文字标签
                var opts = {
                    position: e.point,    // 指定文本标注所在的地理位置（当前鼠标的位置）
                    offset: new BMap.Size(0, 0)    //设置文本偏移量
                }
                label = new BMap.Label("当前半径：" + (radius / 1000).toFixed(2) + "公里", opts);  // 创建文本标注对象
                label.setStyle({
                    border: "1px solid #ccc",
                    maxWidth: "none ",
                });
                map.addOverlay(label);//添加label
            }
        }
        document.getElementById("a-rank").style.background = "White";
        document.getElementById("a-collect").style.background = "White";
        document.getElementById("rank").style.display = "none";
        document.getElementById("select").style.display = "block";
        document.getElementById("collect").style.display = "none";
        document.getElementById("a-select").style.background = "Red";
    });

    dojo.connect(dojo.byId("a-collect"), "onclick", function () {
        for (var i = 0; i < document.getElementsByClassName("BMapLib_Drawing").length; i++) {
            document.getElementsByClassName("BMapLib_Drawing")[i].style.display = "none";
        }
        document.getElementById("a-rank").style.background = "White";
        document.getElementById("a-select").style.background = "White";
        document.getElementById("rank").style.display = "none";
        document.getElementById("select").style.display = "none";
        document.getElementById("collect").style.display = "block";
        document.getElementById("a-collect").style.background = "Red";
        map.clearOverlays();
        for (var i = 0; i < pointArr.length; i++)
        {
            var marker = new BMap.Marker(pointArr[i]);
            map.addOverlay(marker);
            var label = new BMap.Label(string, { offset: new BMap.Size(20, -10) });
            marker.setLabel(label);
        }
        map.centerAndZoom(pointArr[0], 14);
    });

    var rankresult = new BMap.LocalSearch("福州市", {
        renderOptions: { map: map, panel: "rankpanel" }, pageCapacity: 12
    });
    rankresult.search("景点");

    //添加地图类型控件
    map.addControl(new BMap.MapTypeControl({
        mapTypes: [
            BMAP_NORMAL_MAP,//普通地图
            BMAP_HYBRID_MAP//混合地图
        ]
    }));
    map.setCurrentCity("福州");          // 设置地图显示的城市 此项是必须设置的
    map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放

    //var b = new BMap.Bounds(new BMap.Point(118.86000, 25.82546), new BMap.Point(119.71000, 26.301254));//设置地图显示范围
    //try {
    //    BMapLib.AreaRestriction.setBounds(map, b);//拖拽超出范围就弹回来
    //} catch (e) {
    //    alert(e);
    //}

    var scalecontrol = new BMap.ScaleControl({ anchor: BMAP_ANCHOR_BOTTOM_RIGHT });// 右下角，添加比例尺
    var zoomupdown = new BMap.NavigationControl({ anchor: BMAP_ANCHOR_TOP_LEFT, type: BMAP_NAVIGATION_CONTROL_ZOOM });  //左上角，添加默认缩放平移控件
    map.addControl(scalecontrol);
    map.addControl(zoomupdown);

    function G(id) {
        return document.getElementById(id);
    }

    var myValue;//全局变量

    function auto(id,pannel) {//将自动提示的代码块整合成一个auto方法，实现多个输入框可以同时实现自动提示的功能，传入id和pannel的参数即可
        var ac = new BMap.Autocomplete(    //建立一个自动完成的对象
            {
              "input": id
            , "location": map
            });

        ac.addEventListener("onhighlight", function (e) {  //鼠标放在下拉列表上的事件
            var str = "";
            var _value = e.fromitem.value;
            var value = "";
            if (e.fromitem.index > -1) {
                value = _value.province + _value.city + _value.district + _value.street + _value.business;
            }
            str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + value;

            value = "";
            if (e.toitem.index > -1) {
                _value = e.toitem.value;
                value = _value.province + _value.city + _value.district + _value.street + _value.business;
            }
            str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + value;
            G("searchResultPanel").innerHTML = str;
        });

        ac.addEventListener("onconfirm", function (e) {    //鼠标点击下拉列表后的事件
            var _value = e.item.value;
            myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
            G("searchResultPanel").innerHTML = "onconfirm<br />index = " + e.item.index + "<br />myValue = " + myValue;

            setPlace();
        });
    }

    auto("textinput", "searchResultPanel");//调用auto方法
    auto("start", "searchResultPanel");
    auto("end", "searchResultPanel");

    var string = "";
    var contxt = "";

    function setPlace() {
        map.clearOverlays();    //清除地图上所有覆盖物
        function myFun() {
            var pp = local.getResults().getPoi(0).point;    //获取第一个智能搜索的结果
            string = local.getResults().keyword;
            contxt = "名称：" + local.getResults().keyword + "</br>" + "地址：" + local.getResults().getPoi(0).address + "</br>" + "电话：" + local.getResults().getPoi(0).phoneNumber;
            var content = "城市：" + local.getResults().getPoi(0).city + "<br/>" + "地址：" + local.getResults().getPoi(0).address + "<br/>" + "电话：" + local.getResults().getPoi(0).phoneNumber + "<br/>" + "类型：" + local.getResults().getPoi(0).tags;
            map.centerAndZoom(pp, 18);
            var mark1 = new BMap.Marker(pp);
            map.addOverlay(mark1);    //添加标注
            searchInfoWindow1 = new BMapLib.SearchInfoWindow(map, content, {
                title: myValue,      //标题
                width: 290,             //宽度
                height: 105,              //高度
                panel: "panel",         //检索结果面板
                enableAutoPan: true,     //自动平移
                searchTypes: [
                    BMAPLIB_TAB_SEARCH,   //周边检索
                    BMAPLIB_TAB_TO_HERE,  //到这里去
                    BMAPLIB_TAB_FROM_HERE //从这里出发
                ]
            });
            mark1.addEventListener("click", function (e) {
                searchInfoWindow1.open(mark1);
            });

            var markerMenu = new BMap.ContextMenu();//创建右键菜单
            markerMenu.addItem(new BMap.MenuItem('收藏', AddPoint.bind(mark1)));
            mark1.addContextMenu(markerMenu);

        }
        var local = new BMap.LocalSearch(map, { //智能搜索
            onSearchComplete: myFun
        });
        local.search(myValue);
    }

    dojo.connect(dojo.byId("busbutton"), "onclick", function () {
        var transit = new BMap.TransitRoute(map, {
            renderOptions: { map: map, panel: "bus-result" }
        });
        transit.search(document.getElementById("start").value, document.getElementById("end").value);
    })

    //收藏功能
    var pointArr = [];//建立一个点数组
    var geoc = new BMap.Geocoder();//地理解析类

    var num = 1;
    var s = "<p id = 'p" + num + "'></p>";
    var AddPoint = function (e, ee, marker) {//添加一个事件
        pointArr.push(marker.getPosition());
        for (var i = 0; i < pointArr.length; i++) {
            var pt = pointArr[i];
        }
        geoc.getLocation(pt, function (rs) {
            //var addComp = rs.business;
            //alert(string);
            s = "<p id = 'p" + num + "'></p>";
            document.getElementById("collect").innerHTML = document.getElementById("collect").innerHTML + s;
            document.getElementsByTagName("p")[num].innerHTML = num + "、" + "</br>" + contxt;
            num++;
        });
        alert("收藏成功！");
    }

});




