// =============================================================================
// runtime/generated/calculator-summon-bundle.ts — GENERATED FILE, DO NOT EDIT
// -----------------------------------------------------------------------------
// Produced by scripts/bundle-renderer.mjs from runtime/calculator-summon.ts.
// Re-run `pnpm run bundle:renderer` after changing that source. Committed to
// git so a clean checkout can typecheck/build the renderer without the bundler.
// =============================================================================

/** Minified calculator-summon IIFE; inlined by document.ts when a calculator exists. */
export const calculatorSummonJs = "\"use strict\";(()=>{function d(o){let e=o.querySelector(\".calculator-summon\"),r=o.querySelector(\".calculator-mount\"),u=o.getAttribute(\"data-calculator-kit-src\");if(!e||!r||!u)return;let l={};try{let t=o.getAttribute(\"data-calculator-config\");t&&(l=JSON.parse(t))}catch{l={}}let a=null,n=!1,c=t=>{e.setAttribute(\"aria-expanded\",String(t)),e.hidden=t};e.addEventListener(\"click\",async()=>{if(a){a.toggle();return}if(!n){n=!0,e.setAttribute(\"aria-busy\",\"true\");try{a=await(await import(u)).mountCalculator(r,l,{onToggle:c,floating:!0}),c(a.isOpen)}catch(t){console.error(\"Calculator failed to load\",t),n=!1}finally{e.removeAttribute(\"aria-busy\")}}})}function i(){document.querySelectorAll(\".calculator-tool\").forEach(d)}document.readyState===\"loading\"?document.addEventListener(\"DOMContentLoaded\",i):i();})();\n";
