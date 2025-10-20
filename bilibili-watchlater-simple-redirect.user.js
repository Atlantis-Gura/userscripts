// ==UserScript==
// @name         Bilibili 稍后再看简单重定向
// @namespace    http://tampermonkey.net/
// @version      1.1.0
// @description  将稍后再看的链接直接重定向到普通视频页面，修复因B站页面加载机制变化导致的失效问题。
// @author       Atlantis-Gura
// @homepageURL  https://github.com/Atlantis-Gura/Userscripts
// @match        https://www.bilibili.com/list/watchlater*
// @license      MIT
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // 更新：使用 URLSearchParams API，比正则表达式更健壮、更易读
    const urlParams = new URLSearchParams(window.location.search);
    const bvid = urlParams.get('bvid');

    // 如果 URL 中包含 bvid 参数，则立即重定向
    if (bvid) {
        const newUrl = `https://www.bilibili.com/video/${bvid}/`;
        window.location.replace(newUrl);
    }
})();
