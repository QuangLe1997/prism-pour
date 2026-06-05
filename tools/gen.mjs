/* ============================================================
   PRISM POUR — Level Generator + Solver (A*)
   Generates solvable water-sort levels with exact optimal pour counts.
   Run: node tools/gen.mjs  -> prints LEVELS array JS to stdout
   ============================================================ */

const CAP = 4;

// Color palette (hex). '*' = PRISM wildcard (rendered as rainbow).
const PALETTE = ['#FF5A6A','#FFA500','#FFE45A','#5BE58A','#39E0C8','#56D4FF','#C77DFF','#FF6B9D'];

// ---- core rules (mirror the game) ----
const effMatch = (a, b) => a === b || a === '*' || b === '*';

function topRun(tube){ // {color, count} of the top contiguous identical-stored run
  if(tube.length === 0) return null;
  const v = tube[tube.length-1];
  let c = 0;
  for(let i = tube.length-1; i >= 0 && tube[i] === v; i--) c++;
  return { v, c };
}
function canPour(tubes, i, j){
  if(i === j) return false;
  const s = tubes[i], t = tubes[j];
  if(s.length === 0) return false;
  if(t.length >= CAP) return false;
  if(t.length === 0) return true;
  return effMatch(s[s.length-1], t[t.length-1]);
}
function isSolvedTube(tube){
  if(tube.length !== CAP) return false;
  let base = null;
  for(const u of tube){
    if(u === '*') continue;
    if(base === null) base = u;
    else if(u !== base) return false;
  }
  return true; // all same color (prism units allowed as filler)
}
function isWin(tubes){
  return tubes.every(t => t.length === 0 || isSolvedTube(t));
}
function doPour(tubes, i, j){
  const next = tubes.map(t => t.slice());
  const run = topRun(next[i]);
  const space = CAP - next[j].length;
  const amt = Math.min(run.c, space);
  for(let k = 0; k < amt; k++) next[j].push(next[i].pop());
  return next;
}

// canonical key: tube order irrelevant -> sort tube strings
function key(tubes){
  return tubes.map(t => t.join(',')).sort().join('|');
}

// admissible-ish heuristic: (#color-segments) - (#distinct colors) ... lower bound on remaining pours
function heuristic(tubes){
  let segs = 0;
  const colorsSeen = new Set();
  for(const t of tubes){
    if(t.length === 0) continue;
    let prev = null;
    for(const u of t){
      if(u !== '*') colorsSeen.add(u);
      if(u !== prev){ segs++; prev = u; }
    }
  }
  return Math.max(0, segs - colorsSeen.size);
}

// A* for minimum number of pours. Returns {moves} or null (over budget).
function solve(start, nodeBudget = 1500000){
  if(isWin(start)) return { moves: 0 };
  // simple binary-heap priority queue
  const heap = [];
  const push = (f, item) => { heap.push([f, item]); let i = heap.length-1;
    while(i>0){ const p=(i-1)>>1; if(heap[p][0]<=heap[i][0]) break; [heap[p],heap[i]]=[heap[i],heap[p]]; i=p; } };
  const pop = () => { const top=heap[0]; const last=heap.pop();
    if(heap.length){ heap[0]=last; let i=0; const n=heap.length;
      for(;;){ let l=2*i+1,r=2*i+2,s=i; if(l<n&&heap[l][0]<heap[s][0])s=l; if(r<n&&heap[r][0]<heap[s][0])s=r; if(s===i)break; [heap[s],heap[i]]=[heap[i],heap[s]]; i=s; } }
    return top; };

  const best = new Map(); // key -> g
  const k0 = key(start);
  best.set(k0, 0);
  push(heuristic(start), { tubes: start, g: 0 });
  let nodes = 0;

  while(heap.length){
    const [, cur] = pop();
    const { tubes, g } = cur;
    const ck = key(tubes);
    if(g > (best.get(ck) ?? Infinity)) continue;
    if(isWin(tubes)) return { moves: g };
    if(++nodes > nodeBudget) return null;

    const n = tubes.length;
    for(let i = 0; i < n; i++){
      if(tubes[i].length === 0) continue;
      // prune: don't disturb an already-finished single-color tube
      const ri = topRun(tubes[i]);
      const iUniform = isSolvedTube(tubes[i]) || (ri.c === tubes[i].length);
      for(let j = 0; j < n; j++){
        if(!canPour(tubes, i, j)) continue;
        // prune pointless whole-tube shuffles into an empty tube
        if(tubes[j].length === 0 && iUniform) continue;
        const nt = doPour(tubes, i, j);
        const nk = key(nt);
        const ng = g + 1;
        if(ng < (best.get(nk) ?? Infinity)){
          best.set(nk, ng);
          push(ng + heuristic(nt), { tubes: nt, g: ng });
        }
      }
    }
  }
  return null;
}

// ---- PRNG (seeded) ----
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }

// ---- generator ----
function genLevel(rng, { colors, empties, prism }){
  const groups = colors + (prism ? 1 : 0);
  const used = PALETTE.slice(0, colors).slice();
  const pool = [];
  for(const c of used) for(let k=0;k<CAP;k++) pool.push(c);
  if(prism) for(let k=0;k<CAP;k++) pool.push('*');

  for(let attempt = 0; attempt < 4000; attempt++){
    // shuffle pool
    const p = pool.slice();
    for(let i=p.length-1;i>0;i--){ const j=Math.floor(rng()*(i+1)); [p[i],p[j]]=[p[j],p[i]]; }
    // fill `groups` full tubes + `empties` empty tubes
    const tubes = [];
    for(let g=0; g<groups; g++) tubes.push(p.slice(g*CAP,(g+1)*CAP));
    for(let e=0;e<empties;e++) tubes.push([]);
    if(isWin(tubes)) continue;                       // skip already-solved
    // avoid a tube that's already a finished single color at start (too easy / boring)
    if(tubes.some(t => t.length===CAP && isSolvedTube(t))) continue;
    const res = solve(tubes);
    if(res && res.moves >= groups){                  // require a non-trivial solve
      return { tubes, optimal: res.moves, prism: !!prism };
    }
  }
  return null;
}

// ---- difficulty plan (20 levels) ----
const PLAN = [
  { colors:3, empties:2 }, { colors:3, empties:2 }, { colors:3, empties:1 },
  { colors:4, empties:2 }, { colors:4, empties:2 }, { colors:4, empties:1 },
  { colors:5, empties:2 }, { colors:5, empties:2 }, { colors:5, empties:1 },
  { colors:4, empties:2, prism:true },
  { colors:6, empties:2 }, { colors:6, empties:2 }, { colors:6, empties:1 },
  { colors:5, empties:2, prism:true },
  { colors:6, empties:2 }, { colors:7, empties:2 }, { colors:6, empties:1 },
  { colors:5, empties:1, prism:true },
  { colors:6, empties:2, prism:true },
  { colors:7, empties:2 },
];

const NAMES = ['First Drops','Easy Flow','Tight Trio','Four Hues','Color Mix','Packed Four',
  'Five Alive','Spectrum','Squeeze','Prism Intro','Six Shades','Rainbow','Dense Six',
  'Prism Flow','Chromatic','Seven Seas','Compact','Prism Path','Prism Master','Zenith'];

const rng = mulberry32(20260604);
const out = [];
for(let i=0;i<PLAN.length;i++){
  let lvl = null;
  for(let retry=0; retry<6 && !lvl; retry++) lvl = genLevel(rng, PLAN[i]);
  if(!lvl){ console.error(`FAILED level ${i+1}`, PLAN[i]); process.exit(1); }
  out.push({ ...lvl, name: NAMES[i] || `Level ${i+1}` });
  console.error(`L${String(i+1).padStart(2)} ok  tubes=${lvl.tubes.length} optimal=${lvl.optimal} prism=${lvl.prism}`);
}

// emit JS
const lines = out.map((l,i) => {
  const tubes = JSON.stringify(l.tubes);
  return `  /* ${i+1} ${l.name} */ { name:'${l.name}', optimal:${l.optimal}, prism:${l.prism}, tubes:${tubes} },`;
});
console.log('const LEVELS = [\n' + lines.join('\n') + '\n];');
