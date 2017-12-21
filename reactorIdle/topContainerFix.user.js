// ==UserScript==
// @name         Factory Idle - Control Fix
// @namespace    https://github.com/leonidasIIV/TamperMonkey-Scripts/factoryIdle
// @version      0.1
// @description  try to take over the world!
// @author       Kevin Powell
// @match        http://reactoridle.com/*
// @grant        none
// @updateURL    https://github.com/leonidasIIV/TamperMonkey-Scripts/raw/master/reactorIdle/topContainerFix.meta.js
// @downloadURL  https://github.com/leonidasIIV/TamperMonkey-Scripts/raw/master/reactorIdle/topContainerFix.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    function addGlobalStyle(css) {
        var head, style;
        head = document.getElementsByTagName('head')[0];
        if (!head) { return; }
        style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = css;
        head.appendChild(style);
    }

    addGlobalStyle('.topContainer { height: 160px !important; }');
    addGlobalStyle('.componentControls { height: 120px !important; }');
})();