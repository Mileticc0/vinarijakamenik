# Vinarija Kamenik – sajt

Statičan sajt, spreman za GitHub Pages.

## Objavljivanje
1. Napravite novi repozitorijum na GitHubu.
2. Ubacite **sav sadržaj ovog foldera** (uključujući `.nojekyll` i folder `slike/` sa svih 26 fotografija) u koren repozitorijuma.
3. Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)` → Save.
4. Posle minut-dva sajt je na `https://<korisnik>.github.io/<repo>/`.

## Pre objave
- **Forme:** u `kamenik-core.js` zamenite `OVDE_KLJUC` svojim Web3Forms ključem (besplatan na web3forms.com).
- **Domen:** ako koristite kamenik.rs, dodajte fajl `CNAME` sa sadržajem `kamenik.rs`; inače zamenite `https://kamenik.rs` u `sitemap.xml`, `robots.txt` i meta tagovima.
- **Podaci:** adresa, telefon, koordinate (`kamenik-mapa.html`), cene i datumi su primeri.

## Ako se ne vide slike
U repozitorijumu na GitHubu mora da postoji folder **slike/** sa 26 .webp fajlova, tačno pored index.html. Ako ga nema, otvorite repo → Add file → Upload files i prevucite ceo folder `slike` (ne pojedinačne fajlove).

## Važno
Sajt se mora otvarati preko servera (GitHub Pages ili lokalno `npx serve`), ne duplim klikom na fajl – delovi stranice (meni, futer, vina) učitavaju se iz posebnih fajlova.
