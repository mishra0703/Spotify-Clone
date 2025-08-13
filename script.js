let currentsong = new Audio();
let name_list = [];
let songs = [];
let currfolder;

document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector(".hamburger");
  const close = document.querySelector(".close");

  // Toggle menu when hamburger is clicked
  hamburger.addEventListener("click", function () {
    document.body.classList.toggle("menu-active");
  });

  // Close menu when clicking on the overlay
  close.addEventListener("click", function () {
    document.body.classList.remove("menu-active");
  });
});

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getaudio(folder) {
  currfolder = folder;
  let a = await fetch(`/${folder}`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      // let songPath = element.href.split('/').pop();
      // songs.push(decodeURIComponent(songPath));
      songs.push(element.href.split("/").pop());
    }
  }

  // Show all the songs in the playlist

  let songlist = document
    .querySelector(".songcards")
    .getElementsByTagName("ul")[0];

  songlist.innerHTML = "";

  for (const song of songs) {
    let song_name = song
      .replaceAll("%20", " ")
      .replace(".mp3", "")
      .replace("128 Kbps", "")
      .replace("320 Kbps", "")
      .replace("- (Raag.Fm)", "")
      .split(";")[0];
    let singer_name = song
      ? song
          .replaceAll("%20", " ")
          .replace(".mp3", "")
          .replace("128 Kbps", "")
          .replace("- (Raag.Fm)", "")
          .split(";")[1] || "Unknown Artist"
      : "Unknown Artist";
    name_list.push({ Only_name: song_name, Full_name: song });

    let listitem = document.createElement("li");

    listitem.innerHTML = `<div class="songinfo">
                        <img src="Logos/music.svg" alt="">
                            <div class="song-name">${song_name}</div>
                            <div class="song-singer">(${singer_name})</div>
                        </div>
                        <img src="Logos/playbutton.svg" class="playbutton2"> `;

    listitem.setAttribute("track", song);
    listitem.setAttribute("name", song_name);

    songlist.appendChild(listitem);
  }

  // Attach an event listener to each song
  Array.from(
    document.querySelector(".songcards").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      let track = e.getAttribute("track");
      let cleaned_name = e.getAttribute("name");
      playmusic(track, cleaned_name);
    });
  });

  return songs;
}

const playmusic = (track, track_names, pause = false) => {
  currentsong.src = `/${currfolder}/` + track;
  if (!pause) {
    currentsong.play();
    play.src = "./Logos/pause.svg";
  }

  document.querySelector(".info").innerHTML = track_names;
  document.querySelector(".timestamp").innerHTML = "00:00 / 00:00";
};

async function displayalbum() {
  // console.log("Displaying album");

  let a = await fetch(`./Songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".card_container");
  let array = Array.from(anchors);
  for (let i = 0; i < array.length; i++) {
    const e = array[i];
    if (e.href.includes("/Songs")) {
      let folder = e.href.split("/").slice(-2)[0].replaceAll("%20", " ");

      // Get metadata of the folder
      let a = await fetch(`./Songs/${folder}/info.json`);
      let response = await a.json();

      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card" style="width: 18rem;">
                    <div class="playbutton">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                            color="#000000#" fill="black">
                            <path d="M5 5.12132L19 12L5 18.87868V5.12132Z" stroke="currentColor" stroke-width="0"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                    <img src="./Songs/${folder}/cover.jpg" alt="">
                    <div class="card-body">
                        <h3 class="card-title">${response.Title}</h3>
                        <p class="card-text">${response.Description}</p>
                    </div>
          </div>
        `;
    }
  }


  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      let folder = item.currentTarget.dataset.folder;

      // Reset name_list before populating with new songs
      name_list = [];

      // Wait for the songs to be fetched
      songs = await getaudio(`./Songs/${folder}`);

      // Note: name_list is already being populated inside the getaudio function
      // So no need to manually update it here

      console.log("console after calling displayalbum func", songs, name_list);

      if (name_list.length > 0) {
        playmusic(name_list[0].Full_name, name_list[0].Only_name, false);
      }
    });
  });
}

(async function main() {
  await getaudio("./Songs/Honey Singh Hits");

  // Display all the albums on the page
  await displayalbum();

  if (name_list.length > 0) {
    playmusic(name_list[0].Full_name, name_list[0].Only_name, true);
  }

  // Attach an event listner for pause and play a song
  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "./Logos/pause.svg";
    } else {
      currentsong.pause();
      play.src = "./Logos/playbutton.svg";
    }
  });

  function updatePlaceholder() {
    const input = document.getElementById("search?");
    if (window.matchMedia("(max-width: 550px)").matches) {
      input.placeholder = "Search music";
      document.querySelector(".volumeicon").addEventListener("click", () => {
        document.querySelector(".range").toggleAttribute("hidden");
      });
    }
  }

  updatePlaceholder();
  window.addEventListener("resize", updatePlaceholder);

  document.addEventListener("keydown", (event) => {
    // Check if the pressed key is spacebar (key code 32)
    if (event.code === "Space" || event.keyCode === 32) {
      const activeElement = document.activeElement;
      if (
        activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA"
      ) {
        // If it's an input or textarea, let the spacebar behave normally
        return; // Exit the function without toggling play/pause
      }

      // Prevent default spacebar behavior (like scrolling the page)
      event.preventDefault();

      // Toggle play/pause
      if (currentsong.paused) {
        currentsong.play();
        play.src = "./Logos/pause.svg";
      } else {
        currentsong.pause();
        play.src = "./Logos/playbutton.svg";
      }
    }
  });

  // Attach an time updation event listner
  currentsong.addEventListener("timeupdate", () => {
    document.querySelector(".timestamp").innerHTML = `${formatTime(
      currentsong.currentTime
    )}/${formatTime(currentsong.duration)}`;
    // document.querySelector(".point").style.left = (currentsong.currentTime/currentsong.duration)*100 + "%"
    document.querySelector(".point").style.width =
      (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  // Adding seeking movement in seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".point").style.width = percent + "%";
    currentsong.currentTime = (currentsong.duration * percent) / 100;
  });

  // Seeking with mouse drag functionality
  const seekbar = document.querySelector(".seekbar");
  const point = document.querySelector(".point");
  let isDragging = false;

  // Click event for immediate seeking
  seekbar.addEventListener("click", (e) => {
    if (e.target === seekbar) {
      // Only trigger if clicking on the seekbar itself
      const percent = (e.offsetX / seekbar.clientWidth) * 100;
      point.style.width = percent + "%";
      currentsong.currentTime = (currentsong.duration * percent) / 100;
    }
  });

  // Mouse down to start dragging
  seekbar.addEventListener("mousedown", (e) => {
    isDragging = true;
    // Prevent default behavior to avoid text selection while dragging
    e.preventDefault();
  });

  // Mouse move to track dragging
  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    // Get seekbar dimensions
    const rect = seekbar.getBoundingClientRect();

    // Calculate position relative to seekbar
    let x = e.clientX - rect.left;

    // Constrain to seekbar boundaries
    x = Math.max(0, Math.min(x, rect.width));

    // Convert to percentage
    const percent = (x / rect.width) * 100;

    // Update visual indicator
    point.style.width = percent + "%";

    // Update audio time
    currentsong.currentTime = (currentsong.duration * percent) / 100;
  });

  // Mouse up to end dragging (anywhere on document)
  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // Handle mouse leaving the window
  document.addEventListener("mouseleave", () => {
    isDragging = false;
  });

  //Adding event listner for prev and next
  prev.addEventListener("click", () => {
    let song = currentsong.src.split("/").slice(-1);
    let index;
    for (let i = 0; i < name_list.length; i++) {
      if (name_list[i].Full_name == song) {
        index = i;
      }
    }

    if (index - 1 >= 0) {
      playmusic(
        name_list[index - 1].Full_name,
        name_list[index - 1].Only_name,
        false
      );
    }
  });

  next.addEventListener("click", () => {
    let song = currentsong.src.split("/").slice(-1);
    let index;
    for (let i = 0; i < name_list.length; i++) {
      if (name_list[i].Full_name == song) {
        index = i;
      }
    }

    if (index + 1 >= 0) {
      playmusic(
        name_list[index + 1].Full_name,
        name_list[index + 1].Only_name,
        false
      );
    }
  });

  currentsong.volume = 0.2; // Sets the defualt volume to 20%



  //Adding listner to volume icon if volume is not 0

  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentsong.volume = parseInt(e.target.value) / 100;
      if (currentsong.volume > 0) {
        document.querySelector(".volume>img").src = document
          .querySelector(".volume>img")
          .src.replace("/mute.svg", "/volume.svg");
      }
    });

  // Add event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("/volume.svg", "/mute.svg");
      currentsong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("/mute.svg", "/volume.svg");
      currentsong.volume = 0.2;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });

  // Default Music will show on our webpage
  if (name_list.length > 0) {
    playmusic(name_list[0].Full_name, name_list[0].Only_name, true);
  }

  //main function end
})();
