// ==UserScript==
// @name         Grab The Book
// @author       Xian Hong
// @namespace    http://www.cnblogs.com/xianhong/
// @description  抢汤姆大叔的书咯
// @include      http://www.cnblogs.com/TomXu/archive/2012/10/22/2733027.html
// ==/UserScript==
function withjQuery(callback, safe) {
    if (typeof (jQuery) == "undefined") {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js";

        if (safe) {
            var cb = document.createElement("script");
            cb.type = "text/javascript";
            cb.textContent = "jQuery.noConflict();(" + callback.toString() + ")(jQuery);";
            script.addEventListener('load', function () {
                document.head.appendChild(cb);
            });
        }
        else {
            var dollar = undefined;
            if (typeof ($) != "undefined") dollar = $;
            script.addEventListener('load', function () {
                jQuery.noConflict();
                $ = dollar;
                callback(jQuery);
            });
        }
        document.head.appendChild(script);
    } else {
        callback(jQuery);
    }
};

withjQuery(function ($) {
    Array.prototype.remove = function () {
        var newArr = new Array();
        var a = arguments[0];
        for (var i = 0; i < this.length; i++) {
            if (typeof (a) == "function") {
                if (!a(this[i]))
                    newArr.push(this[i]);
            } else if (this[i] != a) {
                newArr.push(this[i]);
            }
        }
        return newArr;
    };

    Array.prototype.find = function () {
        var args = arguments[0];
        for (var i = 0; i < this.length; i++) {
            if (typeof (args) == "function") {
                if (args(this[i])) {
                    return this[i];
                }
            }
        }
        return false;
    };

    var div = $("<div>", { html: '.', style: 'text-align:left;position: fixed;top: 10px;right: 10px;display: block;-webkit-text-size-adjust: none;font-size: 15px;width: 200px;background-color:white;' }).appendTo($(document.body));

    $("<div>", {
        html:
            '<div style="background-color:white;">小时:<input type="text" style="width:50px;" id="txtHour" value="12"/>' +
            '当前时<input type="checkbox" id="chkCurrentHour" checked="checked" /><br />' +
            '分数:<input type="text" style="width:50px;" id="txtMinutes" value="0"/>' +
            '下一分<input type="checkbox" id="chkNextMinutes" checked="checked" /><br />' +
            '秒数:<input type="text" style="width:50px;" id="txtSecond" value="4"/><br />' +
            '毫秒:<input type="text" style="width:50px;"  id="txtMilliseconds" value="150"/><br />' +
            '间隔:<input type="text" style="width:50px;"  id="txtInterval" value="5"/>(ms)<br />' +
            '内容:<textarea id="txtComment" style="height:30px;width:100px;"></textarea><br />' +
            '<input type="button" id="btnExecSettings" value="执行设定" />' +
            '<input type="button" id="btnExec" value="添加任务" />' +
            '<br /> <a id="btnRemoveAll" href="javascript:;">[X]</a> 任务:</div><div id="taskContainer" style="background-color:white;"></div>',
        style: 'text-align:left;position: fixed;top: 40px;right: 10px;display: block;-webkit-text-size-adjust: none;font-size: 15px;width: 200px;height: 50px;background-color:white;'
    }).appendTo($(document.body));

    var settings = {
        minutes: 0, //初始化抢书的分数
        second: 4, //初始化本地时间的抢书秒数
        milliseconds: 150, //初始化本地时间的抢书毫秒数
        interval: 5
    };

    //获取当前时间
    var getCurTime = function () {
        var curTime = new Date();
        return {
            hour: curTime.getHours(),
            minutes: curTime.getMinutes(),
            second: curTime.getSeconds(),
            milliseconds: curTime.getMilliseconds()
        };
    };

    var strContent = "";
    var grabTheBook = function () {
        var curTime = getCurTime();
        var content = $("#txtComment").val() + "  本地时间:------------" + curTime.minutes + ":" + curTime.second + ":" + curTime.milliseconds;
        var comment = {};
        comment.postId = cb_entryId;
        comment.Body = content;
        comment.ParentCommentID = 0;
        var startDate = new Date();
        $.ajax({
            url: '/mvc/PostComment/New.aspx',
            data: JSON.stringify(comment),
            type: "post",
            dataType: "json",
            contentType: "application/json; charset=utf8",
            success: function (data) {
                if (data) {
                    var dt = (new Date()).getTime() - startDate;
                    strContent += "提交耗时:" + dt + " 提交内容:" + content + "<br />";
                    ShowCommentMsg(strContent);
                } else {
                    var errorMsg = "抱歉！评论提交失败！";
                    ShowCommentMsg(errorMsg);
                }
            },
            error: function (xhr) {
                ShowCommentMsg("error：" + xhr.responseText);
            }
        });
    };

    var taskArray = [];

    var renderHtml = function () {
        $("#taskContainer").empty();
        $(taskArray).each(function (i) {
            var task = this;
            if (typeof (this.h) != "function") {
                var removeE = $("<a>", { html: ' [X] ', href: 'javascript:;' });
                var span = $('<span>', { html: '(' + (i + 1) + ')<<' + task.h + ":" + task.m + ":" + task.s + ":" + task.ms });
                span.appendTo($("#taskContainer"));
                removeE.click(function () {
                    task.breakFlag = true;
                    taskArray = taskArray.remove(function (t) { return t.id == task.id; });
                    renderHtml();
                }).appendTo(span);
                span.append("<br />");
            }
        });
    };

    var id = 0;
    var templateFun = function (h, m, s, ms) {
        if (h && typeof (h) != "number") return;
        id++;
        m = m || settings.minutes;
        s = s || settings.second;
        ms = ms || settings.milliseconds;
        var task = { id: id, h: h, m: m, s: s, ms: ms, breakFlag: false };
        taskArray.push(task);
        renderHtml();
        var f = function () {
            if (task.breakFlag)
                return;
            var curTime = getCurTime();
            div.html(curTime.hour + ':' + curTime.minutes + ":" + curTime.second + ":" + curTime.milliseconds);
            if (curTime.hour == h && curTime.minutes == m && curTime.second == s && curTime.milliseconds >= ms) {
                task.breakFlag = true;
                grabTheBook();
                taskArray = taskArray.remove(function (t) { return t.id == task.id; });
                renderHtml();
            }
            else {
                setTimeout(f, settings.interval); //每间隔?毫秒执行一次
            }
        };
        return f;
    };

    var settingFun = function () {
        var curTime = getCurTime();
        settings.minutes = parseInt($("#txtMinutes").val());
        settings.second = parseInt($("#txtSecond").val());
        settings.milliseconds = parseInt($("#txtMilliseconds").val());
        settings.interval = parseInt($("#txtInterval").val());
    };
    var removeAll = function () {
        $(taskArray).each(function () {
            var task = this;
            task.breakFlag = true;
            taskArray = taskArray.remove(function (t) { return t.id == task.id; });
            renderHtml();
        });
    };

    $("#btnRemoveAll").click(removeAll);
    $("#btnExecSettings").click(function () {
        settingFun();
        removeAll();
        templateFun(10)();
        templateFun(12)();
        templateFun(14)();
        templateFun(16)();
        templateFun(18)();
        templateFun(20)();
    });
    $("#btnExec").click(function () { //点击按钮，重新为抢书秒数和抢书毫秒数赋值
        settingFun();
        var curTime = getCurTime();
        var minite = $("#chkNextMinutes").attr("checked") ? curTime.minutes + 1 : parseInt($("#txtMinutes").val());
        var hour = $("#chkCurrentHour").attr("checked") ? curTime.hour : parseInt($("#txtHour").val());
        templateFun(hour, minite, parseInt($("#txtSecond").val()), parseInt($("#txtMilliseconds").val()))();
    });

}, true);