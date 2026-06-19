// =============================================================================
// runtime/generated/reference-panel-bundle.ts — GENERATED FILE, DO NOT EDIT
// -----------------------------------------------------------------------------
// Produced by scripts/bundle-renderer.mjs from runtime/reference-panel.ts.
// Re-run `pnpm run bundle:renderer` after changing that source. Committed to
// git so a clean checkout can typecheck/build the renderer without the bundler.
// =============================================================================

/** Minified reference-panel IIFE; inlined by document.ts when a panel exists. */
export const referencePanelJs = "\"use strict\";(()=>{function c(){let e=document.querySelector(\".reference-panel\");if(!e)return;let s=document.querySelector(\".activity-container\"),t=e.querySelector(\".reference-panel-resize\"),r=e.querySelector(\".reference-panel-body\"),i=()=>{s&&(s.style.paddingBottom=e.offsetHeight+12+\"px\")};if(typeof ResizeObserver<\"u\"?new ResizeObserver(i).observe(e):e.addEventListener(\"toggle\",i),e.addEventListener(\"toggle\",()=>{!e.open&&r&&(r.style.maxHeight=\"\"),i()}),i(),t&&r){let o=!1,d=0;t.addEventListener(\"pointerdown\",n=>{e.open&&(o=!0,d=e.offsetHeight-r.offsetHeight,t.setPointerCapture(n.pointerId),n.preventDefault())}),t.addEventListener(\"pointermove\",n=>{if(!o)return;let l=window.innerHeight*.9-d,f=window.innerHeight-n.clientY-d;r.style.maxHeight=Math.min(l,Math.max(80,f))+\"px\"});let a=n=>{if(o){o=!1;try{t.releasePointerCapture(n.pointerId)}catch{}}};t.addEventListener(\"pointerup\",a),t.addEventListener(\"pointercancel\",a)}}document.readyState===\"loading\"?document.addEventListener(\"DOMContentLoaded\",c):c();})();\n";
