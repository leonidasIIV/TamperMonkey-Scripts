// ==UserScript==
// @name         Crunchyroll Simulcast Filter
// @namespace    https://github.com/leonidasIIV/TamperMonkey-Scripts/crunchyroll
// @version      0.2
// @description  filters out dubs items from the crunchyroll simulcast calendar
// @author       LeonidasIIV
// @match        https://www.crunchyroll.com/simulcastcalendar*
// @match        https://www.crunchyroll.com/*/simulcastcalendar*
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
  // Configurable values
  // ===========================================================================================
  // write debug information to console
  var debug=true;

  // Get our last known state
  var filterState = GM_getValue("filterDubs", true);

  var currentLanguage = getCurrentLanguage();
  var dubFilter = getFilterKey(currentLanguage);

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
  var filteredItems = $(`cite:contains('${dubFilter}')`).text() + "\r\n";
  var badElements = $(`cite:contains('${dubFilter}')`).parents("article.release.js-release").parent();

  // Write our filtered items to our debug output
  if (debug == true) {
      console.log("Filtered elements: ");
      console.log(filteredItems);
      console.log(badElements);
  }

  // Add Button to Simulcast Header to toggle hiding doubs
  GM_addStyle(`.mode-button-filter { padding: 0.275em 2.5em 0.275em 2.5em !important; }`);
  GM_addStyle(`.mode-button-filter-text { max-width: none !important; }`);
  GM_addStyle(`.mode-filter { border-radius: 0.25rem 0 0 0.25rem; }`);
  GM_addStyle(`.mode-filter-language { border-radius: 0 0.25rem 0.25rem 0; }`);
  GM_addStyle(`.mode-filter-language-options { display: none; position: absolute; border-radius: 0.25rem 0.25rem 0.25rem 0.25rem; box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2); z-index: 1;}`);
  GM_addStyle(`.mode-filter-language-option { display: block; position: absolute; border-radius: 0.25rem 0.25rem 0.25rem 0.25rem; box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2); z-index: 1;}`);

  // Get the current language of the crunchyroll site.
  // Returns string
  //   ""      : English     (US)
  //   "en-gb" : English     (UK)
  //   "es"    : Español     (América Latina)
  //   "es-es" : Español     (España)
  //   "pt-br" : Português   (Brasil)
  //   "pt-pt" : Português   (Portugal)
  //   "fr"    : Français    (France)
  //   "de"    : Deutsch     (German)
  //   "ar"    : العربية        (Arabic)
  //   "it"    : Italiano    (Italian)
  //   "ru"    : Русский     (Russian)
  function getCurrentLanguage() {
      var pathName = window.location.pathname;
      var currentLanguage = "";

      if (pathName.indexOf("/simulcastcalendar") > 0) {
          currentLanguage = pathName.substring(1, pathName.indexOf("/simulcastcalendar"));
      }

      return currentLanguage;
  }

  // Given a language code, return the proper dub filter text
  function getFilterKey(language) {
      var filterKey;
      switch (language) {
          case "es":
          case "es-es":
              filterKey="Doblaje";
              break;

          default:
              filterKey="Dub";
      }

      return filterKey;
  }

  function getDubLanguageOptions(language) {
      var DubLanguageOptions;
      switch (language) {
          case "es":
          case "es-es":
              dubLanguageOptions = ["Todos", "Inglés", "Español", "Portugués", "Francés", "Alemán", "Arábica", "Italiano", "Ruso"];
              break;

          default:
              dubLanguageOptions = ["All", "English", "Spanish", "Portuguese", "French", "German", "Arabic", "Italian", "Russian"];
      }

      return dubLanguageOptions;
  }

  function onClickFilterDubs(zEvent) {
      //console.log("Entering Click Event for filterDubs");
      //console.log(zEvent);
      //console.log($(this));
      //console.log($("#filterDubs"));
      if ($(this).hasClass("active")) {
          $(this).removeClass('active');
          filterState = true;
          badElements.hide();
      } else {
          $(this).addClass('active');
          filterState = false;
          badElements.show();
      }
      GM_setValue("filterDubs", filterState);
      //console.log("Leaving Click Event for filterDubs");
  }

  function onClickFilterLanguage(zEvent) {
      alert("Test");
  }

  var cssActive = ""
  if (filterState) {
      badElements.hide();
  } else {
      cssActive = " active"
  }

  $("header.simulcast-calendar-header").append(`
    <div class="simulcast-lineup-toggle">
      <div class="content">
        <div class="mode-button mode-button-filter mode-filter ${cssActive}" id="filterDubs">
          <div class="mode-button-text mode-button-filter-text"> ${dubFilter}s </div>
        </div>
        <div class="mode-button mode-button-filter mode-filter-language" id="filterDubsLanguage">
          <div class="mode-button-text mode-button-filter-text" id="filterCurrentLanugage"> All </div>
          <div class="mode-filter-lanugage-options" id="filterLanguageOptions"> </div>
        </div>
      </div>
    </div>
    `);

  var dubLanguageOptions = getDubLanguageOptions(currentLanguage);
  console.log(dubLanguageOptions);
  for (var i = 0; i < dubLanguageOptions.length; i++) {
      $("#filterLanguageOptions").append(`
        <div class="mode-button mode-filter-language-option ">
          <div class="mode-button-text mode-button-filter-text"> ${dubLanguageOptions[i]} </div>
        </div>`);
  };

  var btnFilter = document.getElementById("filterDubs");
  btnFilter.addEventListener("click",onClickFilterDubs);

  var btnFilterLanguage = document.getElementById("filterDubsLanguage");
  btnFilterLanguage.addEventListener("click",onClickFilterLanguage);
})();