// =============================================================================
// runtime/generated/reference-panel-bundle.ts — GENERATED FILE, DO NOT EDIT
// -----------------------------------------------------------------------------
// Produced by scripts/bundle-renderer.mjs from runtime/reference-panel.ts.
// Re-run `pnpm run bundle:renderer` after changing that source. Committed to
// git so a clean checkout can typecheck/build the renderer without the bundler.
// =============================================================================

/** Minified reference-panel IIFE; inlined by document.ts when a panel exists. */
export const referencePanelJs = "\"use strict\";(()=>{function s(){let e=document.querySelector(\".reference-panel\");if(!e)return;let o=document.querySelector(\".activity-container\"),t=e.querySelector(\".reference-panel-resize\"),i=()=>{o&&(o.style.paddingBottom=e.offsetHeight+12+\"px\")};if(typeof ResizeObserver<\"u\"?new ResizeObserver(i).observe(e):e.addEventListener(\"toggle\",i),e.addEventListener(\"toggle\",()=>{e.open||(e.style.height=\"\",e.style.maxHeight=\"\"),i()}),i(),t){let d=()=>Math.round(window.innerHeight*.9),r=!1;t.addEventListener(\"pointerdown\",n=>{e.open&&(r=!0,e.style.maxHeight=d()+\"px\",t.setPointerCapture(n.pointerId),n.preventDefault())}),t.addEventListener(\"pointermove\",n=>{if(!r)return;let l=Math.min(d(),Math.max(96,window.innerHeight-n.clientY));e.style.height=l+\"px\"});let a=n=>{if(r){r=!1;try{t.releasePointerCapture(n.pointerId)}catch{}}};t.addEventListener(\"pointerup\",a),t.addEventListener(\"pointercancel\",a)}}document.readyState===\"loading\"?document.addEventListener(\"DOMContentLoaded\",s):s();})();\n";
