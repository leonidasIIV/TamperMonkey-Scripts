// ==UserScript==
// @name         Crunchyroll Simulcast Filter
// @namespace    https://github.com/leonidasIIV/TamperMonkey-Scripts/crunchyroll
// @version      0.4
// @description  filters out dubs items and unqueued items from the crunchyroll simulcast calendar
// @author       LeonidasIIV
// @match        https://www.crunchyroll.com/simulcastcalendar
// @match        https://www.crunchyroll.com/simulcastcalendar?*
// @match        https://www.crunchyroll.com/*/simulcastcalendar
// @match        https://www.crunchyroll.com/*/simulcastcalendar?*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=crunchyroll.com
// @require      http://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @updateURL    https://github.com/leonidasIIV/TamperMonkey-Scripts/raw/master/crunchyroll/CruncyrollSimulcastFilter.meta.js
// @downloadURL  https://github.com/leonidasIIV/TamperMonkey-Scripts/raw/master/crunchyroll/CruncyrollSimulcastFilter.user.js
// ==/UserScript==