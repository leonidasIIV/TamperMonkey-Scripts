// ==UserScript==
// @name         Crunchyroll Simulcast Filter
// @namespace    https://github.com/leonidasIIV/TamperMonkey-Scripts/crunchyroll
// @version      0.1
// @description  filters out dubs items from the crunchyroll simulcast calendar
// @author       LeonidasIIV
// @match        https://www.crunchyroll.com/simulcastcalendar*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=crunchyroll.com
// @grant        GM_addStyle
// @updateURL    https://github.com/leonidasIIV/TamperMonkey-Scripts/raw/master/crunchyroll/CruncyrollSimulcastFilter.meta.js
// @downloadURL  https://github.com/leonidasIIV/TamperMonkey-Scripts/raw/master/crunchyroll/CruncyrollSimulcastFilter.user.js
// ==/UserScript==

(function() {
    'use strict';

    // ===========================================================================================
    // Configurable values
    // ===========================================================================================
    // write debug information to console
    var debug=false;

    // HTML Structure
    // <ol class="releases">
    //   <li>
    //     <article class="release js-release " ... >
    //       <div>
    //         <h1 class="season-name">
    //           <class="js-season-name-link" ... >
    //             <cite itemprop="name">
    //               .+ (.+ Dub)
    //             </cite>
    var filteredItems = $("cite:contains('Dub)')").text() + "\r\n";
    var badElements = $("cite:contains('Dub)')").parents("article.release.js-release").parent();

    // Write our filtered items to our debug output
    if (debug == true) {
        console.log("Filtered elements: ");
        console.log(filteredItems);
        console.log(badElements);
    }

    // hide our unwanted elements
    badElements.hide();

    // Add Button to Simulcast Header to toggle hiding doubs
    GM_addStyle(`.mode-filter { border-radius: 0.25rem 0.25rem 0.25rem 0.25rem; }`);

    function onClickDubs(zEvent) {
        console.log("Entering Click Event for filterDubs");
        console.log(zEvent);
        console.log($(this));
        console.log($("#filterDubs"));
        if ($(this).hasClass("active")) {
            $(this).removeClass('active');
        } else {
            $(this).addClass('active');
        }
        console.log("Leaving Click Event for filterDubs");
    }

    $("header.simulcast-calendar-header").append(`
      <div class="simulcast-lineup-toggle">
        <div class="content">
          <div class="mode-button mode-filter" id="filterDubs">
            <div class="mode-button-text"> Dubs </div>
          </div>
        </div>
      </div>
      `);

    var btnFilter = document.getElementById("filterDubs");
    btnFilter.addEventListener("click",onClickDubs);
})();