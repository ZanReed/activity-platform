import{c as A,d as te,i as ae,k as re,l as oe,m as ie}from"./graph-kit-chunk-UJYY6CTU.js";import{c as W,d as J,e as Q,i as Z,k as j,n as ee}from"./graph-kit-chunk-O35MR3CL.js";import{c as ne,o as G,p as m}from"./graph-kit-chunk-2VMOZRK7.js";function le(){return window.mathVirtualKeyboard}function me(t){return Number.isInteger(t)&&Math.abs(t)<1e15?String(t):String(Number.parseFloat(t.toPrecision(12)))}function ke(t){let k=Math.max(10,Math.ceil(Math.abs(t)*2));return{min:-k,max:k}}function se(t,k){return k?u=>Z(u,k)?t(u):NaN:t}function be(t,k,u){let l=(p,w)=>t.g(p,w,k),r=W(l);if(r.kind==="error")return r.message;let z=t.op==="<"||t.op===">";return r.kind==="vertical"?t.domain?"A 'for x \u2026' restriction doesn't apply to a vertical boundary":{kind:"inequality",color:u,strict:z,side:Q(l,r.x,t.op),boundary:{type:"vertical",x:()=>{let p=l(0,0),w=l(1,0)-p;return Math.abs(w)<1e-12?NaN:-p/w}}}:{kind:"inequality",color:u,strict:z,side:J(l,r.fn,t.op),boundary:{type:"fn",fn:se(r.fn,t.domain)}}}function de(t){let k=document.createElement("div");k.className="gk-exprlist";let u=document.createElement("div");u.className="gk-exprlist-rows";let l=document.createElement("div");l.className="gk-exprlist-cap",l.hidden=!0,k.append(u,l);let r=[],z=0,p={},w=()=>t.maxRows!==void 0&&r.length>=t.maxRows;function s(){t.maxRows!==void 0&&w()?(l.hidden=!1,l.textContent=`Expression limit for this activity: ${t.maxRows}`):l.hidden=!0}function T(){let n=r[r.length-1];n&&n.field.getValue("ascii-math")!==""&&!w()&&M();for(let o of r){let a=o.field.getValue("ascii-math");a!==o.lastText&&(o.classified=ee(a,t.opts()),o.lastText=a,o.dragValue=null)}for(let o of Object.keys(p))delete p[o];for(let o of r)o.classified.kind==="slider"&&(p[o.classified.name]=o.dragValue??o.classified.value);let v=[];for(let o of r){let a=o.classified,f=null;if(a.kind==="inequality"){let c=be(a,p,o.color);typeof c=="string"?f=c:v.push(c)}if(a.kind==="error"||f?(o.note.textContent=a.kind==="error"?a.message:f,o.note.dataset.kind="error"):a.kind==="calculation"?(o.note.textContent="= "+me(a.value),o.note.dataset.kind="calc"):(o.note.textContent="",delete o.note.dataset.kind),o.sliderBox.hidden=a.kind!=="slider",a.kind==="slider"?K(o,a.name):o.sliderBox.textContent="",a.kind==="function"){let c=a.fn;v.push({kind:"curve",color:o.color,fn:se(x=>c(x,p),a.domain)})}else if(a.kind==="point"){let{px:c,py:x}=a;v.push({kind:"point",color:o.color,px:()=>c(p),py:()=>x(p)})}}s(),t.onPlotsChange(v)}function K(n,v){let o=p[v]??0,a=n.sliderBox.querySelector("input"),f=n.sliderBox.querySelector("span");(!a||!f)&&(n.sliderBox.textContent="",f=document.createElement("span"),f.className="gk-slider-label",a=document.createElement("input"),a.type="range",a.className="gk-slider-range",a.addEventListener("input",()=>{let g=Number(a.value);n.dragValue=g,n.classified.kind==="slider"&&(p[n.classified.name]=g,f.textContent=`${n.classified.name} = ${g}`),t.onScopeDrag()}),n.sliderBox.append(f,a));let{min:c,max:x}=ke(n.dragValue??o);a.min=String(c),a.max=String(x),a.step=String((x-c)/200),a.value=String(o),a.setAttribute("aria-label",`Value of ${v}`),f.textContent=`${v} = ${o}`}function M(){let n={wrap:document.createElement("div"),field:new A,color:G[z++%G.length]??ne,note:document.createElement("div"),sliderBox:document.createElement("div"),lastText:null,classified:{kind:"empty"},dragValue:null};n.wrap.className="gk-exprrow",n.note.className="gk-exprrow-note",n.sliderBox.className="gk-exprrow-slider",n.sliderBox.hidden=!0;let v=document.createElement("div");v.className="gk-exprrow-line";let o=document.createElement("span");o.className="gk-exprrow-dot",o.style.background=n.color,n.field.className="gk-exprfield",n.field.mathVirtualKeyboardPolicy="manual";let a=document.createElement("button");a.type="button",a.className="gk-exprrow-kb",a.setAttribute("aria-label","Show or hide the on-screen keyboard"),a.title="On-screen keyboard",a.setAttribute("aria-pressed","false"),a.textContent="\u2328",a.addEventListener("pointerdown",c=>c.preventDefault()),a.addEventListener("click",()=>{var g;n.field.focus();let c=le();if(!c)return;c.visible?c.hide():c.show();let x=!!((g=le())!=null&&g.visible);u.querySelectorAll(".gk-exprrow-kb").forEach(R=>R.setAttribute("aria-pressed",String(x)))});let f=document.createElement("button");f.type="button",f.className="gk-exprrow-remove",f.setAttribute("aria-label","Remove expression"),f.textContent="\xD7",n.field.addEventListener("focus",()=>t.onFieldFocus(n.field)),n.field.addEventListener("input",T),v.addEventListener("click",c=>{let x=c.target;x.closest("button")||x.closest("math-field")||n.field.focus()}),f.addEventListener("click",()=>{if(r.length>1){let c=r.indexOf(n);c!==-1&&r.splice(c,1);try{n.field.blur()}catch{}n.wrap.remove()}else n.field.value="",n.lastText=null;T()}),v.append(o,n.field,a,f),n.wrap.append(v,n.sliderBox,n.note),r.push(n),u.appendChild(n.wrap),s()}return M(),{root:k,rebuild:T,reclassifyAll(){for(let n of r)n.lastText=null;T()},destroy(){for(let n of r)try{n.field.blur()}catch{}k.remove()}}}var ce=["linear","quadratic","exponential","logarithmic"];function he(t){let k=typeof t=="object"&&t!==null?t:{},u=k.allowedRegressionModels,l=k.maxExpressions;return{mode:k.mode==="graphing"?"graphing":"scientific",allowTrig:k.allowTrig!==!1,allowLogExp:k.allowLogExp!==!1,allowInequalities:k.allowInequalities!==!1,allowedRegressionModels:Array.isArray(u)?ce.filter(r=>u.includes(r)):ce,maxExpressions:typeof l=="number"&&Number.isInteger(l)&&l>=1?l:void 0}}function ge(t){return Number.isInteger(t)&&Math.abs(t)<1e15?String(t):String(Number.parseFloat(t.toPrecision(12)))}var ue=[{label:"sin",action:{insert:"\\sin("},gate:"trig",variant:"fn"},{label:"cos",action:{insert:"\\cos("},gate:"trig",variant:"fn"},{label:"tan",action:{insert:"\\tan("},gate:"trig",variant:"fn"},{label:"ln",action:{insert:"\\ln("},gate:"logexp",variant:"fn"},{label:"log",action:{insert:"\\log("},gate:"logexp",variant:"fn"},{label:"x\xB2",action:{insert:"^{2}"},variant:"fn"},{label:"x\u02B8",action:{insert:"^{#?}"},variant:"fn"},{label:"\u221A",action:{insert:"\\sqrt{#?}"},variant:"fn"},{label:"\u03C0",action:{insert:"\\pi"},variant:"fn"},{label:"e",action:{insert:"e"},variant:"fn"},{label:"7",action:{insert:"7"},variant:"num"},{label:"8",action:{insert:"8"},variant:"num"},{label:"9",action:{insert:"9"},variant:"num"},{label:"(",action:{insert:"("},variant:"op"},{label:")",action:{insert:")"},variant:"op"},{label:"4",action:{insert:"4"},variant:"num"},{label:"5",action:{insert:"5"},variant:"num"},{label:"6",action:{insert:"6"},variant:"num"},{label:"\xD7",action:{insert:"\\times"},variant:"op"},{label:"\xF7",action:{insert:"\\div"},variant:"op"},{label:"1",action:{insert:"1"},variant:"num"},{label:"2",action:{insert:"2"},variant:"num"},{label:"3",action:{insert:"3"},variant:"num"},{label:"+",action:{insert:"+"},variant:"op"},{label:"\u2212",action:{insert:"-"},variant:"op"},{label:"0",action:{insert:"0"},variant:"num"},{label:".",action:{insert:"."},variant:"num"},{label:"!",action:{insert:"!"},variant:"op"},{label:"C",action:{clear:!0},variant:"accent"},{label:"\u232B",action:{cmd:"deleteBackward"},variant:"accent"}];function b(t,k,u={}){let l=document.createElement(t);l.className=k;for(let[r,z]of Object.entries(u))l.setAttribute(r,z);return l}var X=!1;function ve(){if(X||document.getElementById("graph-kit-styles")){X=!0;return}let t=document.createElement("style");t.id="graph-kit-styles",t.textContent=we,document.head.appendChild(t),X=!0}var L={};function xe(){return window.mathVirtualKeyboard}function ye(t){var k;try{t.layouts=["numeric"];let u=(k=t.normalizedLayouts)==null?void 0:k[0];if(!(u!=null&&u.layers))return"numeric";let l=structuredClone(u),r={latex:",",label:",",class:"big-op hide-shift"},z=p=>typeof p!="string"&&typeof p.command=="string"&&p.command.includes("insertDecimalSeparator");for(let p of l.layers??[])for(let w of p.rows??[]){let s=w.findIndex(z);if(s>=0)return w.splice(s+1,0,r),[l]}return"numeric"}catch{return"numeric"}}function De(t,k,u={}){var U;ve(),te();let l=he(k),r=l.mode==="graphing",z=u.floating??!1,p=r?"rad":"deg",w=!1,s=b("div","gk-cal",{role:"dialog","aria-label":"Calculator"});z&&s.classList.add("gk-cal-floating");let T=r?l.allowedRegressionModels:[],K=T.length>0,M=b("div","gk-cal-header"),n=b("span","gk-cal-title");n.textContent="Calculator";let v=b("button","gk-cal-data-btn",{type:"button","aria-pressed":"false","aria-label":"Toggle the data and regression panel"});v.textContent="Data";let o=b("button","gk-cal-angle",{type:"button","aria-label":"Toggle degrees or radians"});o.textContent=p.toUpperCase();let a=b("button","gk-cal-close",{type:"button","aria-label":"Close calculator"});a.textContent="\xD7",K?M.append(n,v,o,a):M.append(n,o,a);let f=new A;f.className="gk-cal-field",f.mathVirtualKeyboardPolicy="manual";let c=b("div","gk-cal-result",{"aria-live":"polite"}),x=b("div","gk-cal-graph"),g=null,R=null,H=r?null:f,E=r?de({opts:()=>({angleMode:p,allowTrig:l.allowTrig,allowLogExp:l.allowLogExp,allowInequalities:l.allowInequalities}),maxRows:l.maxExpressions,onPlotsChange:e=>{g?g.setPlots(e):R=e},onScopeDrag:()=>g==null?void 0:g.refresh(),onFieldFocus:e=>{H=e}}):null,D=b("div","gk-cal-data");D.hidden=!0;let B=null,P=T[0]??"linear",S=b("div","gk-cal-fit",{"aria-live":"polite"});function $(){if(!B)return;let e=B.getPoints();g==null||g.setScatter(e);let i=ae(P,e);if(S.textContent="",i.ok){g==null||g.plotFit(i.predict);let d=b("div","gk-fit-eq");d.textContent=re(i.fit);let C=b("div","gk-fit-r2");C.textContent=oe(i.fit),S.append(d,C),S.dataset.state="ok"}else{g==null||g.plotFit(null),S.textContent=i.error;let d=e.length>=(P==="quadratic"?3:2);S.dataset.state=d?"err":"hint"}}if(K){let e=b("div","gk-data-scroll");B=ie(e,$);let i=b("div","gk-fit-controls"),d=b("select","gk-fit-model",{"aria-label":"Regression model"});for(let h of T){let y=b("option","");y.value=h,y.textContent=h.charAt(0).toUpperCase()+h.slice(1),d.appendChild(y)}d.addEventListener("change",()=>{P=T.find(h=>h===d.value)??P,$()});let C=b("button","gk-fit-view-btn",{type:"button","aria-label":"Fit the view to the data points"});C.textContent="Fit view",C.addEventListener("click",()=>{B&&(g==null||g.fitView(B.getPoints()))}),i.append(d,C),D.append(e,i,S)}let O=!1;function pe(e){O=e,v.setAttribute("aria-pressed",String(e)),s.dataset.view=e?"data":"expr",D.hidden=!e,e&&$()}v.addEventListener("click",()=>pe(!O));let F=b("div","gk-cal-keypad");function _(){if(r)return;let e=f.getValue("ascii-math"),i=j(e,{angleMode:p,allowTrig:l.allowTrig,allowLogExp:l.allowLogExp});i.ok?(c.textContent="= "+ge(i.value),c.dataset.state="ok"):i.error?(c.textContent=i.error,c.dataset.state="err"):(c.textContent="",delete c.dataset.state)}function Y(e){let i=H??(E?E.root.querySelector("math-field"):null);if(!i)return;let d=e.action;if("insert"in d)i.insert(d.insert);else if("cmd"in d)i.executeCommand(d.cmd);else if("clear"in d)i.value="";else if("equals"in d){let C=j(i.getValue("ascii-math"),{angleMode:p,allowTrig:l.allowTrig,allowLogExp:l.allowLogExp});C.ok&&(i.value=ge(C.value))}i.focus(),r?E==null||E.rebuild():_()}let fe=r?ue.map(e=>e.label==="!"?{label:"x",action:{insert:"x"},variant:"fn"}:e):ue;for(let e of fe){let i=b("button","gk-cal-key",{type:"button"});e.variant&&(i.dataset.variant=e.variant),i.textContent=e.label,e.gate==="trig"&&!l.allowTrig||e.gate==="logexp"&&!l.allowLogExp?(i.disabled=!0,i.title="Turned off for this activity"):i.addEventListener("click",()=>Y(e)),F.appendChild(i)}let I=b("button","gk-cal-key gk-cal-equals",{type:"button"});if(I.dataset.variant="equals",I.textContent="=",I.addEventListener("click",()=>Y(r?{label:"=",action:{insert:"="}}:{label:"=",action:{equals:!0}})),F.appendChild(I),s.dataset.mode=l.mode,r&&E){let e=b("div","gk-cal-body"),i=b("div","gk-cal-left");i.append(E.root,D);let d=b("div","gk-cal-splitter",{role:"separator","aria-orientation":"vertical","aria-label":"Resize the expression list"}),C=!1;d.addEventListener("pointerdown",y=>{C=!0,d.setPointerCapture(y.pointerId),y.preventDefault()}),d.addEventListener("pointermove",y=>{if(!C)return;let N=e.getBoundingClientRect(),q=Math.min(Math.max(y.clientX-N.left,112),N.width-128);i.style.flexBasis=q+"px",L.splitBasis=q+"px"});let h=y=>{C=!1;try{d.releasePointerCapture(y.pointerId)}catch{}};d.addEventListener("pointerup",h),d.addEventListener("pointercancel",h),L.splitBasis&&(i.style.flexBasis=L.splitBasis),e.append(i,d,x),s.append(M,e),s.dataset.view="expr"}else s.append(M,f,c,F);if(r||f.addEventListener("input",_),s.addEventListener("keydown",e=>{e.key==="Escape"&&(e.stopPropagation(),V(!1))}),o.addEventListener("click",()=>{p=p==="deg"?"rad":"deg",o.textContent=p.toUpperCase(),r?E==null||E.reclassifyAll():(f.focus(),_())}),a.addEventListener("click",()=>V(!1)),z){let e=0,i=0,d=!1;M.addEventListener("pointerdown",h=>{if(h.target.closest("button"))return;d=!0;let y=s.getBoundingClientRect();s.style.left=y.left+"px",s.style.top=y.top+"px",s.style.right="auto",s.style.bottom="auto",e=h.clientX-y.left,i=h.clientY-y.top,M.setPointerCapture(h.pointerId),h.preventDefault()}),M.addEventListener("pointermove",h=>{if(!d)return;let y=s.offsetWidth,N=Math.min(Math.max(h.clientX-e,8-y+64),window.innerWidth-64),q=Math.min(Math.max(h.clientY-i,8),window.innerHeight-40);s.style.left=N+"px",s.style.top=q+"px",L.left=N,L.top=q});let C=h=>{d=!1;try{M.releasePointerCapture(h.pointerId)}catch{}};M.addEventListener("pointerup",C),M.addEventListener("pointercancel",C),L.width&&(s.style.width=L.width),L.height&&(s.style.height=L.height),L.left!=null&&L.top!=null&&(s.style.left=L.left+"px",s.style.top=L.top+"px",s.style.right="auto",s.style.bottom="auto")}if(t.appendChild(s),r){let e=xe();if(e)try{e.layouts=ye(e),e.container=s}catch{}}r&&(x.textContent="Loading graph\u2026",import("./graph-kit-chunk-F7YIL4GZ.js").then(({createBoard:e})=>{x.textContent="",g=e(x,"light"),R&&(g.setPlots(R),R=null),O&&$()}).catch(e=>{x.textContent="Graph failed to load",console.error("Calculator board failed to load",e)}));function V(e){var i,d;e!==w&&(w=e,t.hidden=!e,e&&(r?(i=H??(E==null?void 0:E.root.querySelector("math-field")))==null||i.focus():f.focus()),(d=u.onToggle)==null||d.call(u,e))}return w=!0,t.hidden=!1,(U=u.onToggle)==null||U.call(u,!0),{get isOpen(){return w},open:()=>V(!0),close:()=>V(!1),toggle:()=>V(!w),destroy:()=>{z&&(s.style.width&&(L.width=s.style.width),s.style.height&&(L.height=s.style.height));try{f.blur()}catch{}E==null||E.destroy(),g==null||g.destroy(),s.remove()}}}var we=`
.gk-cal {
  /* Chrome tokens \u2014 single-sourced from GK_CHROME (graph-colors.ts). Defined on
     the widget root so the whole calculator reads var(--gk-*); a later
     published-dark pass re-points these under .gk-cal[data-theme='dark']. */
  --gk-bg: ${m.bg};
  --gk-ink-strong: ${m.inkStrong};
  --gk-ink: ${m.ink};
  --gk-text-2: ${m.text2};
  --gk-text-secondary: ${m.textSecondary};
  --gk-muted: ${m.muted};
  --gk-faint: ${m.faint};
  --gk-border: ${m.border};
  --gk-surface: ${m.surface};
  --gk-surface-2: ${m.surface2};
  --gk-hover: ${m.hover};
  --gk-accent: ${m.accent};
  --gk-accent-text: ${m.accentText};
  --gk-accent-border: ${m.accentBorder};
  --gk-accent-bg: ${m.accentBg};
  --gk-accent-bg-active: ${m.accentBgActive};
  --gk-accent-alt: ${m.accentAlt};
  --gk-accent-alt-bg: ${m.accentAltBg};
  --gk-accent-alt-bg-2: ${m.accentAltBg2};
  --gk-error: ${m.error};
  --gk-error-bg: ${m.errorBg};
  --gk-success: ${m.success};
  --gk-success-accent: ${m.successAccent};
  --gk-success-bg: ${m.successBg};
  --gk-overlay-chip: ${m.overlayChip};
  --gk-shadow: ${m.shadow};
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 17rem;
  padding: 0.6rem;
  background: var(--gk-bg);
  color: var(--gk-ink);
  border: 1px solid var(--gk-border);
  border-radius: 10px;
  box-shadow: 0 8px 28px var(--gk-shadow);
  font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
}
/* Floating window (published page): pinned to a viewport corner by default,
   draggable by its header. The in-flow default (editor preview) is unchanged. */
.gk-cal-floating {
  position: fixed; right: 1rem; bottom: 1rem;
  z-index: 120; /* above the reference bar; the summon button hides while open */
  max-height: 92vh;
}
.gk-cal-header { display: flex; align-items: center; gap: 0.5rem; }
.gk-cal-floating .gk-cal-header {
  cursor: move; user-select: none; touch-action: none; /* header owns the drag */
}
.gk-cal-floating .gk-cal-header button { cursor: pointer; } /* controls still click */
.gk-cal-title { font-weight: 600; font-size: 0.9rem; flex: 1; }
.gk-cal-angle {
  font: inherit; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em;
  cursor: pointer; padding: 0.15rem 0.5rem; border-radius: 999px;
  border: 1px solid var(--gk-accent); background: var(--gk-accent-bg); color: var(--gk-accent);
}
.gk-cal-close {
  font-size: 1.25rem; line-height: 1; cursor: pointer; border: none;
  background: none; color: var(--gk-muted); padding: 0 0.2rem;
}
.gk-cal-close:hover { color: var(--gk-ink); }
.gk-cal-field {
  width: 100%; min-height: 2.4rem; padding: 0.3rem 0.4rem;
  border: 1px solid var(--gk-border); border-radius: 6px; font-size: 1.1rem;
  background: var(--gk-surface);
}
.gk-cal-result {
  min-height: 1.4rem; text-align: right; font-size: 1.05rem;
  font-variant-numeric: tabular-nums; padding: 0 0.2rem; color: var(--gk-ink-strong);
}
.gk-cal-result[data-state='err'] { color: var(--gk-error); font-size: 0.85rem; }
.gk-cal-graph {
  width: 100%; height: 200px;
  position: relative; /* anchors the on-graph nav buttons */
  border: 1px solid var(--gk-border); border-radius: 6px; background: var(--gk-bg);
  touch-action: none; /* JSXGraph owns touch pan/zoom */
  display: flex; align-items: center; justify-content: center;
  color: var(--gk-muted); font-size: 0.85rem; overflow: hidden;
}
.gk-board-nav {
  position: absolute; right: 0.4rem; bottom: 0.4rem; z-index: 2;
  display: flex; flex-direction: column; gap: 0.25rem;
}
.gk-board-nav button {
  width: 1.7rem; height: 1.7rem; padding: 0;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--gk-border); border-radius: 6px;
  background: var(--gk-overlay-chip); color: var(--gk-text-2);
  font: inherit; font-size: 1rem; line-height: 1; cursor: pointer;
}
.gk-board-nav button:hover { background: var(--gk-hover); }
.gk-board-readout {
  position: absolute; left: 0.4rem; top: 0.4rem; z-index: 2;
  padding: 0.15rem 0.4rem; border-radius: 6px;
  background: var(--gk-overlay-chip); border: 1px solid var(--gk-border);
  font-size: 0.8rem; color: var(--gk-ink-strong); font-variant-numeric: tabular-nums;
  pointer-events: none; /* never intercept a pan/trace */
}
.gk-cal-keypad {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.3rem;
}
/* ---- Graphing layout (Stage 4): expression list | board, two columns ---- */
.gk-cal[data-mode='graphing'] {
  width: 30rem; height: 26rem;
  /* Native drag-resize (bottom-right handle) \u2014 an enhancement, never a
     prerequisite: the default size is fully usable. JSXGraph's own
     ResizeObserver re-fits the board as the graph cell grows. */
  resize: both; overflow: hidden;
  min-width: 24rem; min-height: 20rem; max-width: 95vw; max-height: 92vh;
}
.gk-cal-body { display: flex; flex-direction: row; align-items: stretch; gap: 0.5rem; min-width: 0; flex: 1 1 auto; min-height: 0; }
.gk-cal-left { display: flex; flex-direction: column; gap: 0.5rem; flex: 0 0 14rem; min-width: 0; min-height: 0; }
.gk-cal-splitter {
  flex: 0 0 6px; align-self: stretch; cursor: col-resize;
  border-radius: 3px; background: var(--gk-hover); touch-action: none;
}
.gk-cal-splitter:hover { background: var(--gk-border); }
.gk-cal[data-mode='graphing'] .gk-cal-graph { height: auto; min-height: 0; flex: 1 1 auto; }
/* Data view (Stage 3): the left column swaps list+keypad for the data section */
.gk-cal[data-view='data'] .gk-exprlist,
.gk-cal[data-view='data'] .gk-cal-keypad { display: none; }
/* ---- Expression list (Stage 4) ---- */
.gk-exprlist { display: flex; flex-direction: column; gap: 0.3rem; flex: 1 1 auto; min-height: 0; overflow-y: auto; }
.gk-exprlist-rows { display: flex; flex-direction: column; gap: 0.3rem; }
.gk-exprrow-line { display: flex; align-items: center; gap: 0.35rem; }
.gk-exprrow-dot { width: 0.6rem; height: 0.6rem; border-radius: 50%; flex: none; }
.gk-exprfield {
  flex: 1 1 auto; min-width: 0; min-height: 2.5rem; padding: 0.35rem 0.4rem;
  border: 1px solid var(--gk-border); border-radius: 6px; font-size: 1.05rem; background: var(--gk-surface);
  /* NOTE: do NOT set display:flex here \u2014 it collapses MathLive's editable area
     to the content width, so clicks land only near the caret. MathLive centers
     content vertically itself given a min-height. */
}
/* Hide MathLive's \u2630 menu toggle (matrix/text/colour/variants \u2014 out of scope)
   and its built-in in-field keyboard toggle (we supply our own \u2328 button at the
   field's right edge). !important beats MathLive's internal part styling. */
.gk-exprfield::part(menu-toggle),
.gk-cal-field::part(menu-toggle),
.gk-exprfield::part(virtual-keyboard-toggle),
.gk-cal-field::part(virtual-keyboard-toggle) { display: none !important; }
.gk-exprrow-remove {
  border: none; background: none; color: var(--gk-faint); cursor: pointer;
  font-size: 1rem; line-height: 1; padding: 0 0.25rem; flex: none;
}
.gk-exprrow-remove:hover { color: var(--gk-error); }
/* A real button, not a bare glyph \u2014 bordered box + pressed state so students
   read it as "the keyboard toggle". */
.gk-exprrow-kb {
  flex: none; display: inline-flex; align-items: center; justify-content: center;
  width: 1.9rem; height: 1.9rem; padding: 0;
  border: 1px solid var(--gk-border); border-radius: 6px;
  background: var(--gk-surface-2); color: var(--gk-text-secondary); cursor: pointer;
  font-size: 1.1rem; line-height: 1;
}
.gk-exprrow-kb:hover { background: var(--gk-accent-alt-bg-2); border-color: var(--gk-accent-border); color: var(--gk-accent); }
.gk-exprrow-kb[aria-pressed='true'] {
  background: var(--gk-accent-bg-active); border-color: var(--gk-accent); color: var(--gk-accent-text);
}
/* MathLive renders its virtual keyboard into the panel (container = panel).
   Keep it inside the popup's rounded frame and above the board. */
.gk-cal-floating .ML__keyboard { position: absolute; z-index: 130; }

/* Responsive keyboard: the graphing panel is a size-query container, so the
   in-panel virtual keyboard (and the expression field) scale DOWN as the panel
   is resized narrower \u2014 otherwise the keys cram. MathLive reads these custom
   properties off the keyboard element. Default (\u2265 ~27rem) uses MathLive's own
   full-size defaults. */
.gk-cal-floating[data-mode='graphing'] {
  container-type: inline-size;
  container-name: gkcal;
}
@container gkcal (max-width: 27rem) {
  .ML__keyboard {
    --keycap-height: 2.1rem;
    --keycap-font-size: 0.85rem;
    --keycap-glyph-size: 0.85rem;
    --keycap-gap: 2px;
    --keyboard-toolbar-font-size: 0.75rem;
  }
  .gk-exprfield { font-size: 0.95rem; min-height: 2.2rem; }
}
@container gkcal (max-width: 23rem) {
  .ML__keyboard {
    --keycap-height: 1.75rem;
    --keycap-font-size: 0.72rem;
    --keycap-glyph-size: 0.72rem;
    --keycap-gap: 1px;
    --keyboard-toolbar-font-size: 0.68rem;
  }
  .gk-exprfield { font-size: 0.88rem; min-height: 2rem; }
}
.gk-exprrow-note { font-size: 0.78rem; padding-left: 0.95rem; }
.gk-exprrow-note:empty { display: none; }
.gk-exprrow-note[data-kind='error'] { color: var(--gk-error); }
.gk-exprrow-note[data-kind='calc'] {
  color: var(--gk-ink-strong); font-size: 0.95rem; font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.gk-exprrow-slider { display: flex; gap: 0.4rem; align-items: center; padding-left: 0.95rem; }
.gk-exprrow-slider[hidden] { display: none; }
.gk-slider-label {
  font-size: 0.8rem; color: var(--gk-text-2); min-width: 3.5rem;
  font-variant-numeric: tabular-nums; white-space: nowrap;
}
.gk-slider-range { flex: 1; min-width: 0; }
.gk-exprlist-cap { font-size: 0.72rem; color: var(--gk-muted); }
.gk-cal-data-btn {
  font: inherit; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em;
  cursor: pointer; padding: 0.15rem 0.5rem; border-radius: 999px;
  border: 1px solid var(--gk-border); background: var(--gk-surface); color: var(--gk-text-secondary);
}
.gk-cal-data-btn[aria-pressed='true'] {
  border-color: var(--gk-success-accent); background: var(--gk-success-bg); color: var(--gk-success);
}
.gk-cal-data { display: flex; flex-direction: column; gap: 0.4rem; min-width: 0; min-height: 0; flex: 1 1 auto; }
.gk-cal-data[hidden] { display: none; }
.gk-data-scroll {
  overflow-y: auto; flex: 1 1 auto; min-height: 0;
  border: 1px solid var(--gk-hover); border-radius: 6px;
}
.gk-data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.gk-data-table th {
  text-align: center; font-weight: 600; padding: 0.15rem;
  background: var(--gk-surface); position: sticky; top: 0;
}
.gk-data-table td { padding: 0.1rem; }
.gk-data-input {
  width: 100%; font: inherit; font-size: 0.85rem; padding: 0.2rem 0.3rem;
  border: 1px solid var(--gk-hover); border-radius: 4px;
  appearance: textfield; -moz-appearance: textfield;
}
.gk-data-input::-webkit-outer-spin-button,
.gk-data-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.gk-data-remove {
  border: none; background: none; color: var(--gk-faint); cursor: pointer;
  font-size: 1rem; line-height: 1; padding: 0 0.25rem;
}
.gk-data-remove:hover { color: var(--gk-error); }
.gk-fit-controls { display: flex; gap: 0.4rem; align-items: center; }
.gk-fit-model {
  flex: 1; min-width: 0; font: inherit; font-size: 0.85rem; padding: 0.25rem;
  border: 1px solid var(--gk-border); border-radius: 6px; background: var(--gk-bg);
}
.gk-fit-view-btn {
  font: inherit; font-size: 0.72rem; font-weight: 600; cursor: pointer;
  padding: 0.25rem 0.5rem; border-radius: 6px;
  border: 1px solid var(--gk-border); background: var(--gk-surface); color: var(--gk-text-secondary);
  white-space: nowrap;
}
.gk-fit-view-btn:hover { background: var(--gk-hover); }
.gk-cal-fit {
  min-height: 2.2rem; font-size: 0.9rem; padding: 0 0.1rem;
  font-variant-numeric: tabular-nums;
}
.gk-cal-fit[data-state='hint'] { color: var(--gk-muted); font-size: 0.8rem; }
.gk-cal-fit[data-state='err'] { color: var(--gk-error); font-size: 0.8rem; }
.gk-fit-eq { font-weight: 600; color: var(--gk-success); } /* matches the fit curve */
.gk-fit-r2 { color: var(--gk-text-2); }
.gk-cal-key {
  font: inherit; font-size: 0.95rem; cursor: pointer; padding: 0.55rem 0;
  border: 1px solid var(--gk-hover); border-radius: 6px; background: var(--gk-surface-2);
  color: var(--gk-ink); min-height: 44px;
}
.gk-cal-key:hover:not(:disabled) { background: var(--gk-hover); }
.gk-cal-key:active:not(:disabled) { transform: translateY(1px); }
.gk-cal-key:disabled { opacity: 0.4; cursor: not-allowed; }
.gk-cal-key[data-variant='fn'] { background: var(--gk-accent-alt-bg); color: var(--gk-accent-alt); font-size: 0.85rem; }
.gk-cal-key[data-variant='op'] { background: var(--gk-hover); font-weight: 600; }
.gk-cal-key[data-variant='accent'] { background: var(--gk-error-bg); color: var(--gk-error); }
.gk-cal-key[data-variant='equals'] {
  grid-column: 1 / -1; background: var(--gk-accent); color: var(--gk-bg); font-weight: 700;
}
.gk-cal-key[data-variant='equals']:hover { background: var(--gk-accent-text); }
`;export{De as mountCalculator};
