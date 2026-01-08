const JSON_PATH = "characters.json";
const MAX_TRIES = 6;

// ===== SOUNDS =====
const SOUND_PATH = "sounds/";
const sounds = ["vineboom.mp3","bruh.mp3","goofy.mp3"];
const WIN_SOUND = "win.mp3";

// ===== STATE =====
let mistakes = 0;
let usedGuesses = [];
let people = [];
let answer = null;

// ===== DOM =====
const guessInput = document.getElementById("guess");
const guessBtn = document.getElementById("guessBtn");
const headers = document.getElementById("headers");
const rows = document.getElementById("rows");
const feedback = document.getElementById("feedback");
const triesBox = document.getElementById("tries");
const list = document.getElementById("autocomplete-list");

// ===== INIT =====
fetch(`${JSON_PATH}?t=${Date.now()}`)
  .then(r=>r.json())
  .then(data=>{
    people=data;
    startRound();
  });

function startRound(){
  mistakes=0;
  usedGuesses=[];
  rows.innerHTML="";
  feedback.textContent="";
  triesBox.textContent="Tentativi: 6";
  document.body.className="";
  answer = people[Math.floor(Math.random()*people.length)];
  buildHeaders();
  updateAutocomplete();
}

// ===== AUTOCOMPLETE =====
guessInput.addEventListener("input", updateAutocomplete);

function updateAutocomplete(){
  const q = guessInput.value.toLowerCase();
  list.innerHTML="";
  if(!q) return list.style.display="none";

  people.forEach(p=>{
    if(
      p.name.toLowerCase().includes(q) &&
      !usedGuesses.includes(p.name)
    ){
      const div=document.createElement("div");
      div.className="autocomplete-item";
      div.textContent=p.name;
      div.onclick=()=>{guessInput.value=p.name;list.style.display="none"};
      list.appendChild(div);
    }
  });
  list.style.display=list.children.length?"block":"none";
}

// ===== GAME =====
guessBtn.onclick=()=>{
  const name=guessInput.value.toLowerCase().trim();
  const picked=people.find(p=>p.name.toLowerCase()===name);
  if(!picked||usedGuesses.includes(picked.name))return;

  usedGuesses.push(picked.name);
  list.style.display="none";

  if(picked.name===answer.name){
    playWin();
    feedback.textContent="🎉 Corretto! Nuovo round...";
    setTimeout(startRound,1800);
    return;
  }

  mistakes++;
  triesBox.textContent=`Tentativi: ${MAX_TRIES-mistakes}`;
  playError();

  renderRow(picked);

  if(mistakes>=MAX_TRIES){
    feedback.textContent=`💀 Era ${answer.name}`;
    setTimeout(startRound,2200);
  }

  guessInput.value="";
};

// ===== HELPERS =====
function buildHeaders(){
  headers.innerHTML="";
  
  // Aggiungi prima la colonna "Foto"
  const fotoTh = document.createElement("th");
  fotoTh.textContent = "Foto";
  headers.appendChild(fotoTh);
  
  // Poi le altre colonne (escludendo "name" e "foto")
  Object.keys(answer).filter(k => k !== "name" && k !== "foto").forEach(k => {
    const th = document.createElement("th");
    th.textContent = k;
    headers.appendChild(th);
  });
}

function renderRow(p){
  const tr = document.createElement("tr");
  
  // 1. Cella FOTO
  const fotoTd = document.createElement("td");
  const fotoDiv = document.createElement("div");
  fotoDiv.className = "photo-box";
  
  if (p.foto) {
    const img = document.createElement("img");
    img.src = p.foto;
    img.alt = p.name;
    img.title = p.name;
    fotoDiv.appendChild(img);
    
    // Se hai la foto nella risposta, confrontala
    if (answer.foto && p.foto === answer.foto) {
      fotoDiv.classList.add("ok");
    } else if (answer.foto) {
      fotoDiv.classList.add("err");
    }
  } else {
    // Se non c'è foto
    const noPhotoSpan = document.createElement("span");
    noPhotoSpan.className = "no-photo";
    noPhotoSpan.textContent = "No foto";
    fotoDiv.appendChild(noPhotoSpan);
    
    // Gestione colore bordo se non c'è foto nella risposta
    if (!answer.foto) {
      fotoDiv.classList.add("ok");
    } else {
      fotoDiv.classList.add("err");
    }
  }
  
  fotoTd.appendChild(fotoDiv);
  tr.appendChild(fotoTd);
  
  // 2. Altre celle (escludi "name" e "foto")
  Object.keys(answer).filter(k => k !== "name" && k !== "foto").forEach(k => {
    const td = document.createElement("td");
    
    // Controlla se il valore esiste nella persona selezionata
    const value = p[k] !== undefined ? p[k] : "N/A";
    
    const span = document.createElement("span");
    span.className = "badge " + (value === answer[k] ? "ok" : "err");
    span.textContent = value;
    td.appendChild(span);
    tr.appendChild(td);
  });
  
  rows.appendChild(tr);
}

function playError(){
  const a=new Audio(SOUND_PATH+sounds[Math.floor(Math.random()*sounds.length)]);
  a.volume=0.7;a.play();
}
function playWin(){
  const a=new Audio(SOUND_PATH+WIN_SOUND);
  a.volume=0.8;a.play();
}
;