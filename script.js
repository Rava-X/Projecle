const JSON_PATH = "characters.json";
const MAX_TRIES = 6;

// ===== BRAINROT =====
const BRAINROT_PATH = "brainrot/";
const brainrotImages = ["ahh.png","skibidi.jpg","troll.webp"];
const brainrotContainer = document.getElementById("brainrot-container");

// ===== SOUNDS =====
const SOUND_PATH = "sounds/";
const sounds = ["vineboom.mp3","bruh.mp3","goofy.mp3"];
const WIN_SOUND = "win.mp3";

// ===== STATE =====
let mistakes = 0;
let chaosEnabled = true;
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
const chaosToggle = document.getElementById("chaosToggle");
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
  clearBrainrot();
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
  spawnBrainrot();

  if(mistakes>=6 && chaosEnabled){
    document.body.classList.add("chaos-4");
    spawnBrainrot(true);
  }

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
  Object.keys(answer).filter(k=>k!=="name").forEach(k=>{
    const th=document.createElement("th");
    th.textContent=k;
    headers.appendChild(th);
  });
}

function renderRow(p){
  const tr=document.createElement("tr");
  Object.keys(answer).filter(k=>k!=="name").forEach(k=>{
    const td=document.createElement("td");
    const span=document.createElement("span");
    span.className="badge "+(p[k]===answer[k]?"ok":"err");
    span.textContent=p[k];
    td.appendChild(span);
    tr.appendChild(td);
  });
  rows.appendChild(tr);
}

function spawnBrainrot(multi=false){
  const count = multi ? 3 : 1;
  for(let i=0;i<count;i++){
    const img=document.createElement("img");
    img.src=BRAINROT_PATH+brainrotImages[Math.floor(Math.random()*brainrotImages.length)];
    img.style.position="fixed";
    img.style.width="200px";
    img.style.left=Math.random()*(window.innerWidth-200)+"px";
    img.style.top=Math.random()*(window.innerHeight-200)+"px";
    img.style.pointerEvents="none";
    img.style.animation="spin "+(Math.random()*3+2)+"s linear infinite";
    brainrotContainer.appendChild(img);
    setTimeout(()=>img.remove(),2500);
  }
}

function clearBrainrot(){
  brainrotContainer.innerHTML="";
}

function playError(){
  const a=new Audio(SOUND_PATH+sounds[Math.floor(Math.random()*sounds.length)]);
  a.volume=0.7;a.play();
}
function playWin(){
  const a=new Audio(SOUND_PATH+WIN_SOUND);
  a.volume=0.8;a.play();
}
