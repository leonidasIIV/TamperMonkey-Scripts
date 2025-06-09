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

(function() {
  'use strict';

  // ===========================================================================================
  // Defines
  // ===========================================================================================
  const Filters = Object.freeze({
    NONE: 'none',              // This is a placeholder value when no filter is selected
    DUBS: 'dubs',              // This filter is an inverted filter. Inactive hides dubs, active shows dubs
    QUEUED: 'queued'           // This filter is a normal filter. Inactive shows all entries, active shows only queued entries
  });

  const LogLevel = Object.freeze({
    NONE: 0, // Turns off logging. Not meant to be used as a log level
    CRITICAL: 1,
    ERROR: 2,
    WARNING: 3,
    INFO: 4,
    DEBUG: 5
  })

  // ===========================================================================================
  // Configurable values
  // ===========================================================================================
  // write debug information to console
  var debug=true;
  var debugLevel=LogLevel.ERROR;

  // HTML Structure
  // <ol class="releases">
  //   <li>
  //     <article class="release js-release" ... >
  //       <div>
  //         <div class="queue-flag queued" ... >
  //         </div>
  //         <h1 class="season-name">
  //           <class="js-season-name-link" ... >
  //             <cite itemprop="name">
  //               .+ (.+ Dub)
  //             </cite>

  var allElements = $("article.release.js-release").parent();

  var filteredItems = $("cite:contains('Dub)')").text() + "\r\n";
  var badElements = $("cite:contains('Dub)')").parents("article.release.js-release").parent();

  var queuedItems = $(".queued").text() + "\r\n";
  var queuedElements = $(".queued").parents("article.release.js-release").parent();
  var unqueuedElements = $("article.release.js-release").parent().filter(":not(:has(.queued))");

  // Get our last known state
  var dubsFilterState = GM_getValue("filterDubs", true);
  var queuedFilterState = GM_getValue("filterQueued", true);

  // Write our filtered items to our debug output
  logMessage(LogLevel.DEBUG, "Filtered elements: ");
  logMessage(LogLevel.DEBUG, dubsFilterState);
  logMessage(LogLevel.DEBUG, queuedFilterState);
  logMessage(LogLevel.DEBUG, badElements);
  logMessage(LogLevel.DEBUG, unqueuedElements);

  // Add Button to Simulcast Header to toggle hiding dubs
  GM_addStyle(`.mode-filter { border-radius: 0.25rem 0.25rem 0.25rem 0.25rem; padding-left: 1.5em !important; padding-right: 1.5em !important; }`);
  GM_addStyle(`.filter-button { display: table-cell; padding: 0 0.5em 0 0.5em; }`);
  GM_addStyle(`.filter-button-text {max-width: 100% !important;}`);

  function logMessage(level = LogLevel.INFO, message) {
    if (debug == true && level <= debugLevel) {
      //var levelName = Object.keys(LogLevel).find((key) => LogLevel[key] === level);
      switch (level) {
        case LogLevel.CRITICAL:
        case LogLevel.ERROR:
          console.error(message);
          break;
        case LogLevel.WARN:
          console.warn(message);
          break;
        case LogLevel.INFO:
          console.info(message);
          break;
        case LogLevel.DEBUG:
          console.debug(message);
          break;
        default:
          console.log(message);
          break;
      }
    }
  }

  function updateDubsFilter() {
    logMessage(LogLevel.INFO, "+ updateDubsFilter()");
    var currentElements = [];
    if (dubsFilterState == true) {
      // get all currently visible elements
      currentElements = badElements.filter(":not(':hidden')");
      // hide only the ones affected by this filter
      currentElements.hide();
    } else {
      // get list of all elements this filter hides
      currentElements = badElements.filter(":hidden");
      // show all of the elements this filter hides
      currentElements.show();
      // update the other filters
      updateFilters(Filters.DUBS);
    }
    logMessage(LogLevel.INFO, "- updateDubsFilter()");
  }

  function updateQueuedFilter() {
    logMessage(LogLevel.INFO, "+ updateQueuedFilter()");
    var currentElements = [];
    if (queuedFilterState == false) {
      // get all elements this filter hides
      currentElements = unqueuedElements.filter(":hidden");
      // show all of the elements this filter hides
      currentElements.show();
      logMessage(LogLevel.DEBUG, currentElements);
      // update the other filters
      updateFilters(Filters.QUEUED);
    } else {
      // get all currently visible elements affected by this filter
      currentElements = unqueuedElements.filter(":not(':hidden')");
      // hide only the ones affected by this filter
      currentElements.hide();
    }
    logMessage(LogLevel.INFO, "- updateQueuedFilter()");
  }

  function updateFilters(caller = Filters.NONE) {
    logMessage(LogLevel.INFO, "+ updateFilters()");
    if (caller !== Filters.QUEUED) {
      updateQueuedFilter();
    }
    if (caller !== Filters.DUBS) {
      updateDubsFilter();
    }
    logMessage(LogLevel.INFO, "- updateFilters()");
  }

  function onClickDubs(zEvent) {
    logMessage(LogLevel.INFO, "+ onClickDubs(zEvent)");
    logMessage(LogLevel.DEBUG, zEvent);
    logMessage(LogLevel.DEBUG, $(this));
    logMessage(LogLevel.DEBUG, $("#filterDubs"));
    if ($(this).hasClass("active")) {
      $(this).removeClass('active');
      dubsFilterState = true;
    } else {
      $(this).addClass('active');
      dubsFilterState = false;
    }
    GM_setValue("filterDubs", dubsFilterState);
    updateDubsFilter();
    logMessage(LogLevel.INFO, "- onClickDubs(zEvent)");
  }

  function onClickQueued(zEvent) {
    logMessage(LogLevel.INFO, "+ onClickQueued(zEvent)");
    logMessage(LogLevel.DEBUG, zEvent);
    logMessage(LogLevel.DEBUG, $(this));
    logMessage(LogLevel.DEBUG, $("#filterQueued"));
    if ($(this).hasClass("active")) {
      $(this).removeClass('active');
      queuedFilterState = false;
    } else {
      $(this).addClass('active');
      queuedFilterState = true;
    }
    GM_setValue("filterQueued", queuedFilterState);
    updateQueuedFilter();
    logMessage(LogLevel.INFO, "- onClickQueued(zEvent)");
  }

  var cssDubsActive = ""
  if (dubsFilterState) {
    // if filter is active, hide elements
    badElements.hide();
  } else {
    // if filter is inactive, set active style
    cssDubsActive = " active";
  }

  // if filter is active, hide elements and set active style
  var cssQueuedActive = ""
  if (queuedFilterState) {
    unqueuedElements.hide();
    cssQueuedActive = " active";
  }

  $("header.simulcast-calendar-header").append(`
  <div class="simulcast-lineup-toggle">
    <div class="content">
      <label class="filter-button">
        <span class="content">
          <div class="mode-button mode-filter ${cssDubsActive}" id="filterDubs">
            <div class="mode-button-text filter-button-text"> Dubs </div>
          </div>
        </span>
      </label>
      <label class="filter-button">
        <span class="content">
          <div class="mode-button mode-filter ${cssQueuedActive}" id="filterQueued">
            <div class="mode-button-text filter-button-text"> Queued </div>
          </div>
        </span>
      </label>
    </div>
  </div>
  `);

  var btnDubsFilter = document.getElementById("filterDubs");
  btnDubsFilter.addEventListener("click",onClickDubs);

  var btnQueuedFilter = document.getElementById("filterQueued");
  btnQueuedFilter.addEventListener("click",onClickQueued);
})();
