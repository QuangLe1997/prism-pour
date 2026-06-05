import { readFileSync } from 'fs';
const html = readFileSync('index.html','utf8');
const LEVELS = eval(html.match(/const LEVELS = (\[[\s\S]*?\n\]);/)[1]);
const CAP=4, PRISM='*';
const effMatch=(a,b)=>a===b||a===PRISM||b===PRISM;
const topRun=t=>{ if(!t.length)return null; const v=t[t.length-1]; let c=0; for(let i=t.length-1;i>=0&&t[i]===v;i--)c++; return {v,c}; };
const canPour=(s,t)=>{ if(!s.length)return false; if(t.length>=CAP)return false; if(t.length===0)return true; return effMatch(s[s.length-1],t[t.length-1]); };
const isSolvedTube=t=>{ if(t.length!==CAP)return false; let b=null; for(const u of t){ if(u===PRISM)continue; if(b===null)b=u; else if(u!==b)return false; } return true; };
const isWin=tb=>tb.every(t=>t.length===0||isSolvedTube(t));
function doPour(tb,i,j){ const n=tb.map(t=>t.slice()); const r=topRun(n[i]); const sp=CAP-n[j].length; const a=Math.min(r.c,sp); for(let k=0;k<a;k++)n[j].push(n[i].pop()); return n; }
function key(tb){ return tb.map(t=>t.join(',')).sort().join('|'); }
function heur(tb){ let s=0; const c=new Set(); for(const t of tb){ if(!t.length)continue; let p=null; for(const u of t){ if(u!==PRISM)c.add(u); if(u!==p){s++;p=u;} } } return Math.max(0,s-c.size); }
function solve(start){ if(isWin(start))return {path:[]};
  const heap=[]; const push=(f,it)=>{heap.push([f,it]);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(heap[p][0]<=heap[i][0])break;[heap[p],heap[i]]=[heap[i],heap[p]];i=p;}};
  const pop=()=>{const top=heap[0];const last=heap.pop();if(heap.length){heap[0]=last;let i=0;const n=heap.length;for(;;){let l=2*i+1,r=2*i+2,s=i;if(l<n&&heap[l][0]<heap[s][0])s=l;if(r<n&&heap[r][0]<heap[s][0])s=r;if(s===i)break;[heap[s],heap[i]]=[heap[i],heap[s]];i=s;}}return top;};
  const best=new Map(); best.set(key(start),0); push(heur(start),{tb:start,g:0,path:[]});
  while(heap.length){ const [,cur]=pop(); const {tb,g,path}=cur; if(g>(best.get(key(tb))??1e9))continue;
    if(isWin(tb))return {path}; 
    for(let i=0;i<tb.length;i++){ if(!tb[i].length)continue; const ri=topRun(tb[i]); const uni=isSolvedTube(tb[i])||ri.c===tb[i].length;
      for(let j=0;j<tb.length;j++){ if(!canPour(tb[i],tb[j]))continue; if(tb[j].length===0&&uni)continue;
        const nt=doPour(tb,i,j); const nk=key(nt); const ng=g+1; if(ng<(best.get(nk)??1e9)){ best.set(nk,ng); push(ng+heur(nt),{tb:nt,g:ng,path:[...path,[i,j]]}); } } } }
  return null; }
const idx = parseInt(process.argv[2]||'0');
const r = solve(LEVELS[idx].tubes.map(t=>t.slice()));
console.log('Level', idx+1, LEVELS[idx].name, 'path (0-indexed tube pairs src->dst):');
console.log(JSON.stringify(r.path));
