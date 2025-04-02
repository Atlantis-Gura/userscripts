// ==UserScript==
// @name         搜索引擎切换器 · 改二（移动端）
// @version      1.3.2
// @description  用于快速切换搜索引擎。有漂亮的高斯模糊外观和深色模式适配。当您滚动网页时，侧栏会自动收起，而当鼠标靠近时，侧栏则会弹出。您可以修改脚本以添加或重新排序搜索引擎。
// @author       Atlantis-Gura
// @originAuthor shunz, Corlius
// @homepageURL  https://github.com/Atlantis-Gura/Userscripts
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bing.com
// @match        *://www.baidu.com/s*
// @match        *://www.baidu.com/baidu*
// @match        *://duckduckgo.com/*
// @match        *://search.brave.com/search*
// @match        *://www.google.com/search*
// @match        *://www.google.com.hk/search*
// @match        *://weixin.sogou.com/weixin*
// @match        *://www.bing.com/search*
// @match        *://cn.bing.com/search*
// @match        *://www.zhihu.com/search*
// @match        *://search.cnki.com.cn/Search/Result*
// @match        *://www.sogou.com/web*
// @match        *://fsoufsou.com/search*
// @match        *://www.xiaohongshu.com/search_result/*
// @match        *://www.douban.com/search*
// @match        *://search.bilibili.com/*
// @match        *://www.youtube.com/results?search_query=*
// @match        *://yandex.com/*
// @match        *://github.com/search*
// @match        *://www.quora.com/search*
// @match        *://quora.com/search*
// @match        *://www.reddit.com/search*
// @match        *://reddit.com/search*
// @license      MIT
// @grant        unsafeWindow
// @grant        window.onload
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-body
// ==/UserScript==

// 搜索网址配置
const urlMapping = [
  {
    name: "V2EX",
    searchUrl: "https://www.google.com/search?q=site:v2ex.com/t%20",
    keyName: "q",
    testUrl: /https:\/\/www.google.com\/search\?q=site:v2ex\.com\/t%20/i,
  },
  {
    name: "Reddit",
    searchUrl: "https://www.reddit.com/search/?q=",
    keyName: "q",
    testUrl: /(?:www\.)?reddit\.com\/search/i,
  },
  {
    name: "Quora",
    searchUrl: "https://www.quora.com/search?q=",
    keyName: "q",
    testUrl: /(?:www\.)?quora\.com\/search/i,
  },
  {
    name: "GitHub",
    searchUrl: "https://github.com/search?q=",
    keyName: "q",
    testUrl: /github.com/i,
  },
  {
    name: "YouTube",
    searchUrl: "https://www.youtube.com/results?search_query=",
    keyName: "search_query",
    testUrl: /https:\/\/www.youtube.com\/results.*/,
  },
  {
    name: "Google",
    searchUrl: "https://www.google.com/search?q=",
    keyName: "q",
    testUrl: /https:\/\/www.google.com\/search.*/,
  },
  {
    name: "Bing",
    searchUrl: "https://www.bing.com/search?q=",
    keyName: "q",
    testUrl: /https:\/\/www.bing.com\/search.*/,
  },
  {
    name: "Brave",
    searchUrl: "https://search.brave.com/search?q=",
    keyName: "q",
    testUrl: /https:\/\/search.brave.com\/search.*/,
  },
  {
    name: "DuckDuckGo",
    searchUrl: "https://duckduckgo.com/?q=",
    keyName: "q",
    testUrl: /https:\/\/duckduckgo.com\/*/,
  },
  {
    name: "Yandex",
    searchUrl: "https://yandex.com/search/?text=",
    keyName: "text",
    testUrl: /yandex.com/i,
  },
  {
    name: "百度",
    searchUrl: "https://www.baidu.com/s?wd=",
    keyName: "wd",
    testUrl: /https:\/\/www.baidu.com\/.*/,
  },
  {
    name: "知乎",
    searchUrl: "https://www.zhihu.com/search?q=",
    keyName: "q",
    testUrl: /https:\/\/www.zhihu.com\/search.*/,
  },
  {
    name: "B站",
    searchUrl: "https://search.bilibili.com/all?keyword=",
    keyName: "keyword",
    testUrl: /https:\/\/search.bilibili.com\/all.*/,
  },
];

// 根据参数名获取URL中的参数值
function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      // 对提取出的参数值进行URI解码并用空格替换加号
      return decodeURIComponent(pair[1].replace(/\+/g, " "));
    }
  }
  return false;
}

// 从当前URL中提取搜索关键词
function getKeywords() {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  const url = window.location.href;

  // 特殊处理抖音搜索关键词
  if (hostname === 'www.douyin.com' && pathname.startsWith('/search/')) {
    const keywordPattern = /^\/search\/([^?]+)/;
    const match = pathname.match(keywordPattern);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
  }
  for (let mapping of urlMapping) {
    if (mapping.name === "Baidu") {
      const params = new URL(url).searchParams;
      if (params.has('wd')) {
        return params.get('wd');
      } else if (url.includes('word=')) {
        let wd = url.match(/word=([^&]*)/)[1];
        return decodeURI(decodeURIComponent(wd));
      }
    } else if (mapping.testUrl.test(url)) {
      return getQueryVariable(mapping.keyName) || "";
    }
  }
  return "";
}

// 特定的配置修改
function adjustForSpecificBrowsers() {
  // 适配火狐浏览器的百度搜索
  if (navigator.userAgent.includes("Firefox")) {
    const baiduMapping = urlMapping.find(item => item.name === "Baidu");
    if (baiduMapping) {
      baiduMapping.searchUrl = "https://www.baidu.com/baidu?wd=";
      baiduMapping.testUrl = /https:\/\/www.baidu.com\/baidu.*/;
    }
  }

  // 适配必应搜索
  if (window.location.hostname === 'cn.bing.com') {
    const bingMapping = {
      name: "Bing",
      searchUrl: "https://cn.bing.com/search?q=",
      keyName: "q",
      testUrl: /https:\/\/cn.bing.com\/search.*/,
    };
    const bingIndex = urlMapping.findIndex(item => item.name === "Bing");
    if (bingIndex !== -1) {
      urlMapping[bingIndex] = bingMapping;
    }
  }
}

// 根据搜索关键词和配置给搜索链接设置样式和动作
function setupSearchLinks(keywords) {

  // 判断是否为暗色模式
  let isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // 如果当前页面是YouTube，则设置为深色模式
  //if (window.location.hostname === 'www.youtube.com') {
  //  isDarkMode = true; // 强制深色模式
  //}

  // 如果当前页面是DouYin，则设置为深色模式
  if (window.location.hostname === 'www.douyin.com') {
    isDarkMode = true; // 强制深色模式
  }

  // 创建一个固定位置的包装器
  const wrapper = document.createElement("div");
  wrapper.id = "search-app-wrapper";
  Object.assign(wrapper.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "0",
    height: "100%",
    zIndex: "9999",
    pointerEvents: "none",
  });

  // 修改主容器的样式
  const mainDiv = document.createElement("div");
  mainDiv.id = "search-app-box";
  Object.assign(mainDiv.style, {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    left: "-100px",
    width: "115px",
    fontSize: "13px",
    fontFamily: "sans-serif",
    backgroundColor: isDarkMode ? 'hsla(0, 0%, 15%, .8)' : 'hsla(0, 0%, 98%, .8)',
    backdropFilter: "blur(10px)",
    webkitBackdropFilter: "blur(10px)",
    borderRadius: "0 15px 15px 0",
    transition: "left 0.5s ease-in-out",
    cursor: "pointer",
    boxShadow: "0 8px 10px rgba(0,0,0,0.06)",
    overflow: "hidden",
    pointerEvents: "auto",
  });

  // 将主容器添加到包装器中
  wrapper.appendChild(mainDiv);

  // 修改触发区域的位置
  const triggerDiv = document.createElement("div");
  triggerDiv.id = "search-app-trigger";
  Object.assign(triggerDiv.style, {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    left: "0",
    width: "50px",
    height: "400px",
    backgroundColor: "transparent",
    zIndex: "9998",
    pointerEvents: "auto",
  });

  // 将触发区域也添加到包装器中
  wrapper.appendChild(triggerDiv);

  // 将包装器添加到 body
  document.body.appendChild(wrapper);


  // 在搜索引擎链接前添加居中显示的标题"Engines"
  const enginesTitle = document.createElement('div');
  enginesTitle.textContent = "🔍 引擎";
  Object.assign(enginesTitle.style, {
    fontSize: "15px",
    fontWeight: "bold",
    padding: '6px 0 6px 15px',
    color: isDarkMode ? 'hsla(0, 0%, 80%, 1)' : 'hsla(0, 0%, 20%, 1)',
    backgroundColor: isDarkMode ? 'hsla(0, 0%, 10%, .8)' : 'hsla(0, 0%, 80%, .8)',
  });
  mainDiv.appendChild(enginesTitle);

  // 为每个搜索引擎创建链接
  urlMapping.forEach(({ name, searchUrl }) => {
    const link = document.createElement('a');
    link.textContent = name;
    link.href = `${searchUrl}${encodeURIComponent(keywords)}`;
    mainDiv.appendChild(link);

    // 设置链接样式
    Object.assign(link.style, {
      display: 'block',
      padding: '5px 0 5px 15px',
      textDecoration: 'none',
      color: isDarkMode ? 'hsla(0, 0%, 80%, 1)' : 'hsla(0, 0%, 40%, 1)',
    });

    // 添加鼠标放置在链接上时的背景色变化
    link.addEventListener('mouseenter', () => {
      link.style.backgroundColor = isDarkMode ? 'hsla(0, 0%, 30%, .8)' : 'hsla(0, 0%, 92%, .8)';
    });

    // 当鼠标离开链接时恢复背景色
    link.addEventListener('mouseleave', () => {
      link.style.backgroundColor = '';
    });
  });

  // 滚动时隐藏主容器
  window.addEventListener('scroll', () => {
    mainDiv.style.left = "-105px"; // 默认为95px，移动端可设置为100px或105px以防遮挡内容
    triggerDiv.style.display = "block"; // 显示触发区域
  });

  // 鼠标接近主容器时显示容器
  window.addEventListener("mousemove", function (event) {
    const rect = mainDiv.getBoundingClientRect();
    const triggerRect = triggerDiv.getBoundingClientRect();
    const dx = Math.abs(event.clientX - rect.right);
    const dy = Math.abs(event.clientY - ((rect.top + rect.bottom) / 2));
    var dxLimit = 130;
    if (window.location.hostname === 'www.bing.com') {
      dxLimit = 25;
    }
    if (dx < dxLimit && dy < 200 || (event.clientX <= triggerRect.right && event.clientY >= triggerRect.top && event.clientY <= triggerRect.bottom)) {
      mainDiv.style.left = "0";
      triggerDiv.style.display = "none"; // 隐藏触发区域
    }
  });

  // 添加触摸事件处理
  triggerDiv.addEventListener("touchstart", function(event) {
    mainDiv.style.left = "0";
    triggerDiv.style.display = "none";
    event.preventDefault(); // 防止触发搜索页面上的元素
  });

  // 当主容器移出时，显示触发区域
  mainDiv.addEventListener("transitionend", function() {
    if (mainDiv.style.left === "-105px") {
      triggerDiv.style.display = "block";
    }
  });
}

// 页面加载完成后进行初始化
window.addEventListener("DOMContentLoaded", function () {
  adjustForSpecificBrowsers(); // 调整特定浏览器的配置
  setupSearchLinks(getKeywords()); // 设置搜索链接
});
// ==UserScript==
// @name         搜索引擎切换器 · 改二（移动端）
// @version      1.3.2
// @description  用于快速切换搜索引擎。有漂亮的高斯模糊外观和深色模式适配。当您滚动网页时，侧栏会自动收起，而当鼠标靠近时，侧栏则会弹出。您可以修改脚本以添加或重新排序搜索引擎。
// @author       Atlantis-Gura
// @originAuthor shunz, Corlius
// @homepageURL  https://github.com/Atlantis-Gura/Userscripts
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bing.com
// @match        *://www.baidu.com/s*
// @match        *://www.baidu.com/baidu*
// @match        *://duckduckgo.com/*
// @match        *://search.brave.com/search*
// @match        *://www.google.com/search*
// @match        *://www.google.com.hk/search*
// @match        *://weixin.sogou.com/weixin*
// @match        *://www.bing.com/search*
// @match        *://cn.bing.com/search*
// @match        *://www.zhihu.com/search*
// @match        *://search.cnki.com.cn/Search/Result*
// @match        *://www.sogou.com/web*
// @match        *://fsoufsou.com/search*
// @match        *://www.xiaohongshu.com/search_result/*
// @match        *://www.douban.com/search*
// @match        *://search.bilibili.com/*
// @match        *://www.youtube.com/results?search_query=*
// @match        *://yandex.com/*
// @match        *://github.com/search*
// @match        *://www.quora.com/search*
// @match        *://quora.com/search*
// @match        *://www.reddit.com/search*
// @match        *://reddit.com/search*
// @match        *://linux.do/search*
// @license      MIT
// @grant        unsafeWindow
// @grant        window.onload
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-body
// ==/UserScript==

// 搜索网址配置
const urlMapping = [
  {
    name: "LINUX DO",
    searchUrl: "https://linux.do/search?q=",
    keyName: "q",
    testUrl: /(?:www\.)?linux\.do\/search/i,
  },
  {
    name: "V2EX",
    searchUrl: "https://www.google.com/search?q=site:v2ex.com/t%20",
    keyName: "q",
    testUrl: /https:\/\/www.google.com\/search\?q=site:v2ex\.com\/t%20/i,
  },
  {
    name: "Reddit",
    searchUrl: "https://www.reddit.com/search/?q=",
    keyName: "q",
    testUrl: /(?:www\.)?reddit\.com\/search/i,
  },
  {
    name: "Quora",
    searchUrl: "https://www.quora.com/search?q=",
    keyName: "q",
    testUrl: /(?:www\.)?quora\.com\/search/i,
  },
  {
    name: "GitHub",
    searchUrl: "https://github.com/search?q=",
    keyName: "q",
    testUrl: /github.com/i,
  },
  {
    name: "YouTube",
    searchUrl: "https://www.youtube.com/results?search_query=",
    keyName: "search_query",
    testUrl: /https:\/\/www.youtube.com\/results.*/,
  },
  {
    name: "B站",
    searchUrl: "https://search.bilibili.com/all?keyword=",
    keyName: "keyword",
    testUrl: /https:\/\/search.bilibili.com\/all.*/,
  },
  {
    name: "Google",
    searchUrl: "https://www.google.com/search?q=",
    keyName: "q",
    testUrl: /https:\/\/www.google.com\/search.*/,
  },
  {
    name: "Bing",
    searchUrl: "https://www.bing.com/search?q=",
    keyName: "q",
    testUrl: /https:\/\/www.bing.com\/search.*/,
  },
  {
    name: "Brave",
    searchUrl: "https://search.brave.com/search?q=",
    keyName: "q",
    testUrl: /https:\/\/search.brave.com\/search.*/,
  },
  {
    name: "DuckDuckGo",
    searchUrl: "https://duckduckgo.com/?q=",
    keyName: "q",
    testUrl: /https:\/\/duckduckgo.com\/*/,
  },
  {
    name: "Yandex",
    searchUrl: "https://yandex.com/search/?text=",
    keyName: "text",
    testUrl: /yandex.com/i,
  },
  {
    name: "百度",
    searchUrl: "https://www.baidu.com/s?wd=",
    keyName: "wd",
    testUrl: /https:\/\/www.baidu.com\/.*/,
  },
  {
    name: "知乎",
    searchUrl: "https://www.zhihu.com/search?q=",
    keyName: "q",
    testUrl: /https:\/\/www.zhihu.com\/search.*/,
  },
];

// 根据参数名获取URL中的参数值
function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      // 对提取出的参数值进行URI解码并用空格替换加号
      return decodeURIComponent(pair[1].replace(/\+/g, " "));
    }
  }
  return false;
}

// 从当前URL中提取搜索关键词
function getKeywords() {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  const url = window.location.href;

  // 特殊处理抖音搜索关键词
  if (hostname === 'www.douyin.com' && pathname.startsWith('/search/')) {
    const keywordPattern = /^\/search\/([^?]+)/;
    const match = pathname.match(keywordPattern);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
  }
  for (let mapping of urlMapping) {
    if (mapping.name === "Baidu") {
      const params = new URL(url).searchParams;
      if (params.has('wd')) {
        return params.get('wd');
      } else if (url.includes('word=')) {
        let wd = url.match(/word=([^&]*)/)[1];
        return decodeURI(decodeURIComponent(wd));
      }
    } else if (mapping.testUrl.test(url)) {
      return getQueryVariable(mapping.keyName) || "";
    }
  }
  return "";
}

// 特定的配置修改
function adjustForSpecificBrowsers() {
  // 适配火狐浏览器的百度搜索
  if (navigator.userAgent.includes("Firefox")) {
    const baiduMapping = urlMapping.find(item => item.name === "Baidu");
    if (baiduMapping) {
      baiduMapping.searchUrl = "https://www.baidu.com/baidu?wd=";
      baiduMapping.testUrl = /https:\/\/www.baidu.com\/baidu.*/;
    }
  }

  // 适配必应搜索
  if (window.location.hostname === 'cn.bing.com') {
    const bingMapping = {
      name: "Bing",
      searchUrl: "https://cn.bing.com/search?q=",
      keyName: "q",
      testUrl: /https:\/\/cn.bing.com\/search.*/,
    };
    const bingIndex = urlMapping.findIndex(item => item.name === "Bing");
    if (bingIndex !== -1) {
      urlMapping[bingIndex] = bingMapping;
    }
  }
}

// 根据搜索关键词和配置给搜索链接设置样式和动作
function setupSearchLinks(keywords) {

  // 判断是否为暗色模式
  let isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // 如果当前页面是YouTube，则设置为深色模式
  //if (window.location.hostname === 'www.youtube.com') {
  //  isDarkMode = true; // 强制深色模式
  //}

  // 如果当前页面是DouYin，则设置为深色模式
  if (window.location.hostname === 'www.douyin.com') {
    isDarkMode = true; // 强制深色模式
  }

  // 创建主容器
  const mainDiv = document.createElement("div");
  mainDiv.id = "search-app-box";
  Object.assign(mainDiv.style, {
    position: "fixed",
    top: "50%",
    transform: "translateY(-50%)",
    left: "-100px", // 初始位置在左侧外部
    width: "115px",
    fontSize: "13px",
    fontFamily: "sans-serif",
    backgroundColor: isDarkMode ? 'hsla(0, 0%, 15%, .8)' : 'hsla(0, 0%, 98%, .8)',
    backdropFilter: "blur(10px)",
    webkitBackdropFilter: "blur(10px)",
    borderRadius: "0 15px 15px 0",
    zIndex: "9999",
    transition: "left 0.5s ease-in-out",
    cursor: "pointer",
    boxShadow: "0 8px 10px rgba(0,0,0,0.06)",
    overflow: "hidden",
  });

  // 创建透明触发区域
  const triggerDiv = document.createElement("div");
  triggerDiv.id = "search-app-trigger";
  Object.assign(triggerDiv.style, {
    position: "fixed",
    top: "50%",
    transform: "translateY(-50%)",
    left: "0",
    width: "50px", // 向右延伸50px
    height: "400px", // 与主容器高度相同
    backgroundColor: "transparent",
    zIndex: "9998", // 低于主容器的z-index
  });

  document.body.appendChild(mainDiv);
  document.body.appendChild(triggerDiv);

  // 在搜索引擎链接前添加居中显示的标题"Engines"
  const enginesTitle = document.createElement('div');
  enginesTitle.textContent = "🔍 引擎";
  Object.assign(enginesTitle.style, {
    fontSize: "15px",
    fontWeight: "bold",
    padding: '6px 0 6px 15px',
    color: isDarkMode ? 'hsla(0, 0%, 80%, 1)' : 'hsla(0, 0%, 20%, 1)',
    backgroundColor: isDarkMode ? 'hsla(0, 0%, 10%, .8)' : 'hsla(0, 0%, 80%, .8)',
  });
  mainDiv.appendChild(enginesTitle);

  // 为每个搜索引擎创建链接
  urlMapping.forEach(({ name, searchUrl }) => {
    const link = document.createElement('a');
    link.textContent = name;
    link.href = `${searchUrl}${encodeURIComponent(keywords)}`;
    mainDiv.appendChild(link);

    // 设置链接样式
    Object.assign(link.style, {
      display: 'block',
      padding: '5px 0 5px 15px',
      textDecoration: 'none',
      color: isDarkMode ? 'hsla(0, 0%, 80%, 1)' : 'hsla(0, 0%, 40%, 1)',
    });

    // 添加鼠标放置在链接上时的背景色变化
    link.addEventListener('mouseenter', () => {
      link.style.backgroundColor = isDarkMode ? 'hsla(0, 0%, 30%, .8)' : 'hsla(0, 0%, 92%, .8)';
    });

    // 当鼠标离开链接时恢复背景色
    link.addEventListener('mouseleave', () => {
      link.style.backgroundColor = '';
    });
  });

  // 滚动时隐藏主容器
  window.addEventListener('scroll', () => {
    mainDiv.style.left = "-105px"; // 默认为95px，移动端可设置为100px或105px以防遮挡内容
    triggerDiv.style.display = "block"; // 显示触发区域
  });

  // 鼠标接近主容器时显示容器
  window.addEventListener("mousemove", function (event) {
    const rect = mainDiv.getBoundingClientRect();
    const triggerRect = triggerDiv.getBoundingClientRect();
    const dx = Math.abs(event.clientX - rect.right);
    const dy = Math.abs(event.clientY - ((rect.top + rect.bottom) / 2));
    var dxLimit = 130;
    if (window.location.hostname === 'www.bing.com') {
      dxLimit = 25;
    }
    if (dx < dxLimit && dy < 200 || (event.clientX <= triggerRect.right && event.clientY >= triggerRect.top && event.clientY <= triggerRect.bottom)) {
      mainDiv.style.left = "0";
      triggerDiv.style.display = "none"; // 隐藏触发区域
    }
  });

  // 添加触摸事件处理
  triggerDiv.addEventListener("touchstart", function(event) {
    mainDiv.style.left = "0";
    triggerDiv.style.display = "none";
    event.preventDefault(); // 防止触发搜索页面上的元素
  });

  // 当主容器移出时，显示触发区域
  mainDiv.addEventListener("transitionend", function() {
    if (mainDiv.style.left === "-105px") {
      triggerDiv.style.display = "block";
    }
  });
}

// 页面加载完成后进行初始化
window.addEventListener("DOMContentLoaded", function () {
  adjustForSpecificBrowsers(); // 调整特定浏览器的配置
  setupSearchLinks(getKeywords()); // 设置搜索链接
});
