/*
==========================================
 GHOSH HUNTER
 GOOGLE SHEETS DATABASE
==========================================

Masukkan URL Google Apps Script kamu
di bagian API_URL.
*/

const API_URL =
  "https://script.google.com/macros/s/AKfycbz-kFPQPJkc1JbA_FcOCr6AEXL3MfPS5q6dOnKzmFnZjbAQOU5q74TkTdgXyc9Aoaub/exec";


const GAME_TIME = 30;

const POINT = 10;


let username = "";

let whatsapp = "";

let score = 0;

let time = GAME_TIME;

let gameTimer;

let gameRunning = false;


/* =================================
   HELPER
================================= */

function $(id) {
  return document.getElementById(id);
}


/* =================================
   START GAME
================================= */

function startGame() {

  username =
    $("username")
      .value
      .trim();

  whatsapp =
    $("whatsapp")
      .value
      .replace(/\D/g, "");


  if (username.length < 2) {

    $("error").textContent =
      "Username minimal 2 karakter.";

    return;
  }


  if (!/^08\d{8,13}$/.test(whatsapp)) {

    $("error").textContent =
      "Masukkan nomor WhatsApp yang valid.";

    return;
  }


  $("error").textContent = "";


  score = 0;

  time = GAME_TIME;

  gameRunning = true;


  $("playerName")
    .textContent =
    username;

  $("score")
    .textContent =
    score;

  $("timer")
    .textContent =
    time;


  $("menu")
    .classList
    .add("hidden");

  $("game")
    .classList
    .remove("hidden");


  moveGhost();


  clearInterval(
    gameTimer
  );


  gameTimer =
    setInterval(
      function () {

        time--;

        $("timer")
          .textContent =
          time;


        if (time <= 0) {

          endGame();

        }

      },
      1000
    );

}


/* =================================
   MOVE GHOST
================================= */

function moveGhost() {

  if (!gameRunning)
    return;


  const area =
    $("gameArea");

  const ghost =
    $("ghost");


  const maxX =
    area.clientWidth -
    ghost.offsetWidth -
    10;


  const maxY =
    area.clientHeight -
    ghost.offsetHeight -
    10;


  const x =
    Math.random() *
    maxX;


  const y =
    Math.random() *
    maxY;


  ghost.style.left =
    Math.max(5, x) + "px";


  ghost.style.top =
    Math.max(5, y) + "px";

}


/* =================================
   TANGKAP HANTU
================================= */

$("ghost")
  .addEventListener(
    "pointerdown",
    function (event) {

      event.preventDefault();


      if (!gameRunning)
        return;


      score += POINT;


      $("score")
        .textContent =
        score;


      const effect =
        $("pointEffect");


      effect.style.left =
        $("ghost").style.left;

      effect.style.top =
        $("ghost").style.top;


      effect.classList
        .remove(
          "pointAnimation"
        );


      void effect.offsetWidth;


      effect.classList
        .add(
          "pointAnimation"
        );


      moveGhost();

    }
  );


/* =================================
   END GAME
================================= */

function endGame() {

  gameRunning = false;


  clearInterval(
    gameTimer
  );


  $("finalScore")
    .textContent =
    score;


  $("result")
    .classList
    .remove("hidden");


  saveScore();

}


/* =================================
   GOOGLE SHEETS
================================= */

async function sendData(
  action,
  data = {}
) {

  const response =
    await fetch(
      API_URL,
      {

        method: "POST",

        body:
          JSON.stringify({
            action: action,
            ...data
          })

      }
    );


  return response.json();

}


/* =================================
   SAVE SCORE
================================= */

async function saveScore() {

  if (
    API_URL.includes(
      "MASUKKAN_URL"
    )
  ) {

    console.log(
      "Google Sheets belum terhubung."
    );

    return;
  }


  try {

    await sendData(
      "saveScore",
      {

        username:
          username,

        whatsapp:
          whatsapp,

        score:
          score

      }
    );

  }

  catch(error) {

    console.error(
      "Gagal menyimpan score:",
      error
    );

  }

}


/* =================================
   LEADERBOARD
================================= */

async function showLeaderboard() {

  $("result")
    .classList
    .add("hidden");


  $("menu")
    .classList
    .add("hidden");


  $("game")
    .classList
    .add("hidden");


  $("leaderboard")
    .classList
    .remove("hidden");


  $("loading")
    .textContent =
    "👻 Memanggil Hunter...";


  $("leaderboardBody")
    .innerHTML = "";


  if (
    API_URL.includes(
      "MASUKKAN_URL"
    )
  ) {

    $("loading")
      .textContent =
      "⚙️ Hubungkan Google Sheets terlebih dahulu.";

    return;
  }


  try {

    const data =
      await sendData(
        "leaderboard"
      );


    $("loading")
      .textContent = "";


    const rows =
      data.rows || [];


    if (
      rows.length === 0
    ) {

      $("leaderboardBody")
        .innerHTML = `
          <tr>
            <td colspan="3">
              Belum ada Hunter 👻
            </td>
          </tr>
        `;

      return;
    }


    rows.forEach(
      function(row, index) {

        const tr =
          document.createElement(
            "tr"
          );


        tr.innerHTML = `
          <td>${index + 1}</td>
          <td>${escapeHTML(row[0])}</td>
          <td>⭐ ${row[2]}</td>
        `;


        $("leaderboardBody")
          .appendChild(tr);

      }
    );

  }

  catch(error) {

    console.error(error);


    $("loading")
      .textContent =
      "❌ Gagal mengambil leaderboard.";

  }

}


/* =================================
   SECURITY
================================= */

function escapeHTML(value) {

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    value ?? "";


  return div.innerHTML;

}


/* =================================
   BACK MENU
================================= */

function backMenu() {

  gameRunning = false;

  clearInterval(
    gameTimer
  );


  $("result")
    .classList
    .add("hidden");


  $("game")
    .classList
    .add("hidden");


  $("leaderboard")
    .classList
    .add("hidden");


  $("menu")
    .classList
    .remove("hidden");

}


/* =================================
   RESPONSIVE
================================= */

window.addEventListener(
  "resize",
  function() {

    if (gameRunning) {

      moveGhost();

    }

  }
);
