import sharp from 'sharp';
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';

await mkdir('dist/assets', {recursive: true});
await mkdir('dist/brand', {recursive: true});
const source = 'docs/art/guardian-original.png';
await sharp(source).resize({width:1672,withoutEnlargement:true}).webp({quality:87,effort:6}).toFile('dist/assets/guardian-wide.webp');
await sharp(source).resize({width:1280,withoutEnlargement:true}).webp({quality:85,effort:6}).toFile('dist/assets/guardian-desktop.webp');
await sharp(source).resize({width:1000,withoutEnlargement:true}).webp({quality:85,effort:6}).toFile('dist/assets/guardian-mobile.webp');
await sharp('docs/art/mist-original.png').resize({width:1400,withoutEnlargement:true}).webp({quality:82,alphaQuality:85,effort:6}).toFile('dist/assets/mist-wisps.webp');
for (const weight of [400,500,600]) await copyFile(`node_modules/@fontsource/barlow/files/barlow-latin-${weight}-normal.woff2`,`dist/assets/barlow-latin-${weight}.woff2`);
await copyFile('node_modules/@fontsource/cinzel/files/cinzel-latin-700-normal.woff2','dist/assets/cinzel-latin-700.woff2');
await copyFile('node_modules/gsap/dist/gsap.min.js','dist/assets/gsap.min.js');
await mkdir('dist/assets/licenses', {recursive:true});
await writeFile('dist/assets/licenses/gsap.txt','GSAP 3.13.0 — Copyright 2008–2025 GreenSock. Standard license: https://gsap.com/standard-license/\nThe original license notice is retained in assets/gsap.min.js.\n');
await copyFile('node_modules/@fontsource/cinzel/LICENSE','dist/assets/licenses/cinzel.txt');
await copyFile('node_modules/@fontsource/barlow/LICENSE','dist/assets/licenses/barlow.txt');

// Original, drawn glyphs. All letters are paths; no installed font is required.
const glyphs = {
  M:'M0 52V0H9L23 23 37 0H46V52H36V17L23 38 10 17V52Z',
  I:'M0 0H22V8H16V44H22V52H0V44H6V8H0Z',
  R:'M0 52V0H32L43 11V24L33 34 47 52H34L20 34H10V52ZM10 9V25H28L33 20V14L28 9Z',
  '4':'M29 0H40V31H47V40H40V52H29V40H0V31L21 0H32L11 31H29Z',
  G:'M11 0H43V9H15L10 14V38L15 43H33V32H23V23H43V52H11L0 41V11Z',
  U:'M0 0H10V38L15 43H29L34 38V0H44V42L34 52H10L0 42Z',
  A:'M0 52 18 0H29L48 52H37L33 40H14L10 52ZM17 31H30L23 11Z',
  D:'M0 0H29L43 14V38L29 52H0ZM10 9V43H24L33 34V18L24 9Z'
};
const widths = {M:46,I:22,R:47,'4':47,G:43,U:44,A:48,D:43};
const emblem = '<path d="M32 2 57 13 53 40 32 62 11 40 7 13 22 8 19 19 16 21 19 36 32 50 44 36 47 20 34 14 32 24 40 29 31 39 24 31 28 25 25 19Z"/>';
function wordmark(mono=false){
  let x=81;
  return [...'MIR4GUARD'].map(letter=>{
    const path=`<path fill="${mono?'#F2EFE6':letter==='4'?'#BDA77B':'#F2EFE6'}" fill-rule="evenodd" transform="translate(${x} 8)" d="${glyphs[letter]}"/>`;
    x+=widths[letter]+9;return path;
  }).join('');
}
for (const mono of [false,true]) {
  const name=mono?'mir4guard-monochrome':'mir4guard-horizontal';
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="548" height="68" viewBox="0 0 548 68" role="img" aria-label="MIR4GUARD"><title>MIR4GUARD</title><g fill="${mono?'#F2EFE6':'#B54047'}" transform="translate(0 2)">${emblem}</g>${wordmark(mono)}</svg>`;
  await writeFile(`dist/brand/${name}.svg`,svg);
  await sharp(Buffer.from(svg)).resize({width:1644}).png().toFile(`dist/brand/${name}.png`);
}
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" role="img" aria-label="Emblema MIR4GUARD"><title>Emblema MIR4GUARD</title><g fill="#B54047">${emblem}</g></svg>`;
await writeFile('dist/brand/emblem.svg',svg);
await sharp(Buffer.from(svg)).resize(256,256).png().toFile('dist/brand/emblem.png');
console.log('Optimized art, local fonts, GSAP and six transparent brand files ready.');

