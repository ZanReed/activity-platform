// =============================================================================
// runtime/generated/calculator-summon-bundle.ts — GENERATED FILE, DO NOT EDIT
// -----------------------------------------------------------------------------
// Produced by scripts/bundle-renderer.mjs from runtime/calculator-summon.ts.
// Re-run `pnpm run bundle:renderer` after changing that source. Committed to
// git so a clean checkout can typecheck/build the renderer without the bundler.
// =============================================================================

/** Minified calculator-summon IIFE; inlined by document.ts when a calculator exists. */
export const calculatorSummonJs = "\"use strict\";(()=>{function d(e){let o=e.querySelector(\".calculator-summon\"),r=e.querySelector(\".calculator-mount\"),c=e.getAttribute(\"data-calculator-kit-src\");if(!o||!r||!c)return;let l={};try{let t=e.getAttribute(\"data-calculator-config\");t&&(l=JSON.parse(t))}catch{l={}}let a=null,n=!1,u=t=>{o.setAttribute(\"aria-expanded\",String(t))};o.addEventListener(\"click\",async()=>{if(a){a.toggle();return}if(!n){n=!0,o.setAttribute(\"aria-busy\",\"true\");try{a=(await import(c)).mountCalculator(r,l,{onToggle:u}),u(a.isOpen)}catch(t){console.error(\"Calculator failed to load\",t),n=!1}finally{o.removeAttribute(\"aria-busy\")}}})}function i(){document.querySelectorAll(\".calculator-tool\").forEach(d)}document.readyState===\"loading\"?document.addEventListener(\"DOMContentLoaded\",i):i();})();\n";
