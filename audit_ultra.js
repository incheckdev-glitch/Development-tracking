
const data = {
  locations: [
    { name: "Hamra", score: 92, result: "pass" },
    { name: "Achrafieh", score: 88, result: "pass" },
    { name: "Verdun", score: 84, result: "pass" },
    { name: "Dbayeh", score: 68, result: "fail" },
    { name: "Jounieh", score: 90, result: "pass" },
    { name: "Tripoli", score: 81, result: "pass" }
  ],
  audits: [
    ["22 Jun", "Dbayeh Branch", "Omar Chatila", "68%", "Fail", "Critical section failed: Food Safety"],
    ["21 Jun", "Hamra Branch", "Rana N.", "94%", "Pass", "No critical failure"],
    ["20 Jun", "Achrafieh Branch", "Omar Chatila", "88%", "Pass", "No critical failure"],
    ["19 Jun", "Verdun Branch", "Rana N.", "72%", "Fail", "Formula threshold not reached"]
  ]
};

function setBars(mode){
  document.querySelectorAll("[data-location-bar]").forEach((el, idx)=>{
    const loc = data.locations[idx];
    let score = loc.score;
    if(mode === "section"){
      score = [96,81,78,55,87,75][idx];
    }
    if(mode === "urgent"){
      score = [1,2,2,5,1,3][idx] * 17;
    }
    const h = Math.max(34, Math.round(score * 2.45));
    const bar = el.querySelector(".bar");
    bar.style.setProperty("--h", h + "px");
    bar.dataset.value = mode === "urgent" ? Math.round(score/17) + " flags" : score + "%";
    bar.classList.toggle("fail", score < 72 || (mode === "urgent" && score > 55));
    bar.classList.toggle("mid", score >= 72 && score < 84 && mode !== "urgent");
  });
}

document.addEventListener("click", (event)=>{
  const btn = event.target.closest("[data-segment]");
  if(!btn) return;
  const group = btn.parentElement;
  group.querySelectorAll("button").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  setBars(btn.dataset.segment);
});

document.addEventListener("DOMContentLoaded", ()=>{
  setBars("score");
});
