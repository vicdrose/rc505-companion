// library.js
//
// RC-505 Loop Mixer Library Layer
// Handles Favorites virtual folder from manifest.json

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

      console.log("Library loaded:", favorites);

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

        if (beat && beat.favorite === true) {

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
      return;
    }


    const option = document.createElement("option");

    option.value = FAVORITES_KEY;
    option.textContent = `★ FAVORITES (${favorites.length})`;

    dateSelect.insertBefore(option, dateSelect.firstChild);


    dateSelect.addEventListener("change", () => {

      if(dateSelect.value === FAVORITES_KEY){

        showFavoriteBeats();

      }

    });

  }


  function showFavoriteBeats(){

    const beatSelect = document.getElementById("beatSelect");

    if(!beatSelect) return;


    if(favorites.length === 0){

      beatSelect.innerHTML =
        "<option>No favorites</option>";

      return;

    }


    beatSelect.innerHTML = favorites.map((item,index)=>{

      return `<option value="${index}">
      ★ ${item.date} — Beat ${item.beat}
      </option>`;

    }).join("");


    beatSelect.disabled = false;


    beatSelect.onchange = loadFavorite;


    loadFavorite();

  }



  async function loadFavorite(){

    const beatSelect =
      document.getElementById("beatSelect");

    const favorite =
      favorites[parseInt(beatSelect.value)];


    if(!favorite) return;


    // temporarily tell main app what folder to load
    if(window.manifest){

      window.manifest = libraryManifest;

    }


    if(window.LoopMixerAPI){

      await window.LoopMixerAPI.loadBeat(
        favorite.date,
        favorite.beat
      );

    }

  }


  window.LoopLibrary = {

    getFavorites(){
      return favorites;
    },

    reload(){
      initLibrary();
    }

  };


  window.addEventListener("load",()=>{

    setTimeout(initLibrary,1000);

  });


})();
