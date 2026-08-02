// library.js
//
// RC-505 Loop Mixer Library Layer
//
// Handles:
// - Favorites virtual folder
// - Metadata from manifest.json
// - Future expansion point for playlists, ratings, notes
//
// Requires:
// - index.html already loaded
// - window.LoopMixerAPI from main app

(() => {

  let libraryManifest = {};
  let favorites = [];

  const FAVORITES_KEY = "__favorites__";

  async function initLibrary() {

    try {

      const response = await fetch("./manifest.json");

      if (!response.ok) {
        throw new Error(`manifest.json error: ${response.status}`);
      }

      libraryManifest = await response.json();

      buildFavorites();

      injectFavoritesOption();

      console.log("Library loaded:", {
        favorites
      });

    } catch(err) {

      console.error("Library initialization failed:", err);

    }

  }


  function buildFavorites() {

    favorites = [];

    Object.keys(libraryManifest).forEach(dateFolder => {

      const beats = libraryManifest[dateFolder];

      Object.keys(beats).forEach(beatNumber => {

        const beat = beats[beatNumber];

        if (
          beat &&
          beat.favorite === true
        ) {

          favorites.push({

            date: dateFolder,
            beat: beatNumber,
            stems: beat.stems

          });

        }

      });

    });

  }


  function injectFavoritesOption() {

    const dateSelect = document.getElementById("dateSelect");

    if (!dateSelect) {

      console.warn(
        "dateSelect not found"
      );

      return;

    }


    const option = document.createElement("option");

    option.value = FAVORITES_KEY;

    option.textContent =
      `★ FAVORITES (${favorites.length})`;


    dateSelect.insertBefore(
      option,
      dateSelect.firstChild
    );


    dateSelect.addEventListener(
      "change",
      handleLibrarySelection
    );

  }



  async function handleLibrarySelection(e) {

    if (e.target.value !== FAVORITES_KEY) {

      return;

    }


    showFavoriteBeats();

  }



  function showFavoriteBeats() {

    const beatSelect =
      document.getElementById("beatSelect");


    if (!beatSelect) {

      return;

    }


    if (favorites.length === 0) {

      beatSelect.innerHTML =
        "<option>No favorites yet</option>";

      beatSelect.disabled = true;

      return;

    }


    beatSelect.innerHTML =
      favorites.map((item,index)=>{

        return `
        <option value="${index}">
          ★ ${item.date} — Beat ${item.beat}
        </option>
        `;

      }).join("");


    beatSelect.disabled = false;


    beatSelect.onchange =
      loadFavoriteSelection;


    loadFavoriteSelection();

  }



  async function loadFavoriteSelection() {

    const beatSelect =
      document.getElementById("beatSelect");


    const index =
      parseInt(
        beatSelect.value,
        10
      );


    const favorite =
      favorites[index];


    if (!favorite) {

      return;

    }


    console.log(
      "Loading favorite:",
      favorite
    );


    if (
      window.LoopMixerAPI &&
      window.LoopMixerAPI.loadBeat
    ) {

      await window.LoopMixerAPI.loadBeat(
        favorite.date,
        favorite.beat
      );

    }
    else {

      console.warn(
        "LoopMixerAPI not available"
      );

    }

  }



  // Expose for debugging / future features

  window.LoopLibrary = {

    getFavorites(){

      return favorites;

    },

    reload(){

      initLibrary();

    }

  };


  // Wait until main app exists

  window.addEventListener(
    "load",
    () => {

      setTimeout(
        initLibrary,
        500
      );

    }
  );


})();
