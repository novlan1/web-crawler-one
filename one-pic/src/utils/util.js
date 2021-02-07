//获取滚动条当前的位置
export function getScrollTop() {
  var scrollTop = 0;
  if (document.documentElement && document.documentElement.scrollTop) {
      scrollTop = document.documentElement.scrollTop;
  } else if(document.body) {
      scrollTop = document.body.scrollTop;
  }
  return scrollTop;
}

//获取当前可视范围的高度  
export function getClientHeight() {
  var clientHeight = 0;
  if(document.body.clientHeight && document.documentElement.clientHeight) {
      clientHeight = Math.min(document.body.clientHeight, document.documentElement.clientHeight);
  } else {
      clientHeight = Math.max(document.body.clientHeight, document.documentElement.clientHeight);
  }
  return clientHeight;
}

//获取文档完整的高度 
export function getScrollHeight() {
  return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
}

/**
 * 获取“一个”图片的原始创建日期 
 * @param {Number} qiniuKey 
 * @returns {Number} stamp
 */
export function getOnePicCreatedStamp(qiniuKey) {
  if (!qiniuKey) {
    return;
  }
  qiniuKey = Number(qiniuKey)

  const todayStamp = new Date('2021-02-07').getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  const todayKey = 3046;
  const stamp = todayStamp - (todayKey - qiniuKey) * oneDay

  return stamp;
}

// unix时间戳格式化显示
export function timeStampFormat(timestamp, fmt, defaultval) {
  if (!timestamp || timestamp == '0') {
    return defaultval || '';
  }
  const date = new Date();
  if ((`${timestamp}`).length == 10) {
    timestamp = timestamp * 1000;
  }
  date.setTime(timestamp);
  const o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds(), // 毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (`${date.getFullYear()}`).substr(4 - RegExp.$1.length));
  for (const k in o) {
    if (new RegExp(`(${k})`).test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : ((`00${o[k]}`).substr((`${o[k]}`).length)));
  }
  return fmt;
};


export function copyLink(value) {
  const input = document.createElement("input");
    input.value = value;
    input.style.opacity = 0;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
}


// 判断是否是PC端
export function isPC() {
  var userAgentInfo = navigator.userAgent;
  var Agents = ["Android", "iPhone",
              "SymbianOS", "Windows Phone",
              "iPad", "iPod"];
  var flag = true;
  for (var v = 0; v < Agents.length; v++) {
      if (userAgentInfo.indexOf(Agents[v]) > 0) {
          flag = false;
          break;
      }
  }
  return flag;
}