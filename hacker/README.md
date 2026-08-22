# Hacker

The Hollywood hacker screen as a wallpaper: a wall of green-on-black panels
with code being typed, terminals scrolling, hex dumps, telemetry, progress
bars, and a "target acquisition" centrepiece that "breaches" one real
company after another. It is a parody of how films show hacking, and that is
the whole point of it.

**Everything on screen is fake.** Nothing here performs networking, runs
commands, reads memory, scans files or does any real work. Every character is
procedurally generated fiction; the only things the page ever loads are its
own logo and background images in `assets/`. The randomness is rule-based
rather than pure noise — a return is always the last line of its block, a
`ping` loses packets the way ping does, `git clone` counts objects before it
receives them — so it reads as plausible at a glance without being anything.

Open [index.html](index.html) in a browser, or point Wallpaper Engine / Lively
Wallpaper at it as a web wallpaper. It is a single classic-script page with
no dependencies, so it works fully offline and straight off disk.

Three names, deliberately: the folder is `hacker/`, the Wallpaper Engine
title in [project.json](project.json) is **SYNAPSE//9**, and the page's own
`<title>` is the in-fiction `SYNAPSE//9 NODE CONSOLE`.

**Status: work in progress, not released** — not in the gallery yet, and no
save-compatibility obligations (see the table in the root `CLAUDE.md`).

## What is on screen

Eight panels in a fixed three-column grid whose split fractions are jittered
a little on every load, so no two launches have quite the same geometry.

| Panel | Title on screen | What it fakes |
| --- | --- | --- |
| `TerminalPanel` | `SYS://TRACE` | A scrolling event log, colour-coded by severity, with a normal / paused / burst state machine so it never scrolls at a metronome rate. |
| `HexPanel` | `MEMORY INSPECTOR` | A hex viewer: offset, bytes, ASCII column, with the occasional highlighted row. |
| `CodePanel` | `SOURCE SYNTH // LIVE` | Someone typing code, live, in a made-up Rust-flavoured language. A small grammar keeps it from forming shapes that read as wrong (see below). |
| `CompanyPanel` | `TARGET ACQUISITION` | A real company's logo and name, a handful of "analysis" steps with a progress bar, then a red X and `BREACHED SUCCESSFULLY`; then the next company, forever. |
| `ShellPanel` | `TTY // root@synapse-NN` | An interactive-looking Linux terminal: a command is typed character by character, its output plays back on a timed script (including carriage-return style in-place progress lines), then the next one. Nineteen commands, each with its own randomised arguments and timing. |
| `GraphPanel` | `TELEMETRY` | Two line charts plus three counters, all smoothly pursuing random targets. |
| `ProgressPanel` | `TASK PIPELINE` | Six block-character progress bars; some complete, some fail, some loop forever. |
| `BinaryPanel` | `RAW STREAM` | Endless rows of binary with occasional highlighted runs. |

Over the top: a slowly drifting scanline pattern, a refresh band sweeping
down the screen, a faint vignette, brief white flickers and cyan/red glitch
bars. Behind it all, a dimmed, softened, tinted background image that drifts
slightly.

### The code writer

`CodePanel` generates one line at a time with no lookahead and no block
stack — just a few fields of state (indent, what the previous line was, what
container it is in, how many real statements since the block opened). The
rules:

1. a `return` is always the last line of its block
2. a `let` is never the last line of a block
3. a block never closes empty (comments and blanks are not content)
4. no two blank lines in a row at top level
5. an attribute is followed by the kind of item it can decorate
6. `struct` / `enum` bodies hold only members, and member names never repeat
7. `.await` only appears inside an `async fn`
8. a bare statement is always a call — no no-effect arithmetic

Typing speed drifts, and between lines it sometimes pauses as if thinking.

### The shell

Each command is a class with `build()` (returns the command line, choosing
its arguments) and `run()` (returns a list of timed output events). Events
either append a line or replace the previous one, which is how `wget`,
`docker pull`, `git clone`, `rsync` and the invented `synctl` draw their
in-place progress. All hosts live under invented internal domains
(`mesh.internal`, `synapse.grid`, `lattice.local`) — nothing resolvable.
New commands go in `buildShellDeck()`.

Commands: `ping`, `wget`, `docker pull`, `apt-get install`, `git clone`,
`make`, `ls -la`, `df -h`, `dd`, `grep -rn`, `journalctl`, `tar -xvzf`,
`rsync`, `systemctl status`, `curl -sI`, `sha256sum`, `top`, and two
invented tools, `synctl` and `meshctl`.

### Target acquisition

`COMPANY_DATA` near the top of the file is the catalogue — `Name|RRGGBB`,
267 entries, one brand colour each. A logo is loaded from
`assets/logos/<slug>.png` (slug = name lower-cased, non-alphanumerics
dropped) the first time it is needed and released once that company has had
its turn; if the file is missing, a procedural monogram in the brand colour
is drawn instead, so the panel never depends on an asset being there. The
deck is shuffled and replayed endlessly.

## Backgrounds

`BG_ENTRIES` lists the background images with per-image readability tuning
(opacity, scrim, tint, focal point, zoom, soften radius, drift, cover vs
contain). One is picked at random on load. **F6** swaps to a different one
with a glitch burst. Adding an image means dropping it into
`assets/backgrounds/` and adding an entry — the defaults in `BG_DEFAULT` are
a reasonable start and each entry only states what differs.

The MAUI original faked its blur by compositing nine copies of the image
every frame; here the same composite (plus the scrim, tint and edge falloff)
is baked once into offscreen canvases on load and on resize, so the
background costs one `drawImage` per frame.

## Performance

Canvas 2D, one `requestAnimationFrame` loop, capped at **60 fps** (everything
is delta-time based, so a faster display only burns GPU for identical
frames). Device pixel ratio is capped at 2. The loop stops entirely while the
page is hidden or while Wallpaper Engine reports the wallpaper paused.

Inside Wallpaper Engine, the app's own FPS limit takes over the cap when it
is lower than 60 (pushed through `wallpaperPropertyListener`); in a browser
nothing ever reports a limit and the cap is simply 60.

**Measured**, minimum of ten 300-frame batches on a real GPU:

| | 1920x1080 | 3840x2160 |
| --- | --- | --- |
| Before panel caching | 1.48 ms/frame | 3.51 ms/frame |
| Now | **0.23 ms/frame** | **0.76 ms/frame** |

### Why it is cheap: the panel cache

Almost nothing on these panels changes at the frame rate. A terminal emits a
few lines a second, the hex dump eight rows, the code writer finishes a line
about twice a second, the charts sample ten times a second. Redrawing thirty
or forty `fillText` calls sixty times a second for output that is
character-for-character identical to the last frame was over 80% of the total
cost — `CodePanel` alone spent 0.77 ms per frame repainting its fifty-line
backlog so that the bottom line could grow by one character.

So each panel owns one offscreen bitmap (a `Layer`) holding its frame, its
title bar and whatever part of its content is stable. It repaints only when
the panel invalidates it — on a new line, a new sample, a finished line of
code, or a step of the border glow (`fade()` quantises alpha to 1/64, so the
glow only changes colour about five times a second). Everything that really
does move every frame — the line being typed, the blinking cursors, the
telemetry counters, the progress bars, the target-acquisition panel — is
drawn live on top. In practice the layers repaint 4-14 times a second instead
of 60.

Panels therefore split their drawing in two: `drawStatic(rect)` goes into the
cache, `drawLive(rect)` is painted over it every frame. A panel with no live
content skips the clip and the live pass entirely.

Three things this had to get right, all of which were verified by rendering
the same frozen frame both ways and diffing the pixels:

- **Device-pixel alignment.** The bitmap is aligned to whole device pixels and
  blitted at an integer device offset, so glyphs land on exactly the subpixel
  positions they would have landed on when drawn straight to the screen.
  Getting this wrong resamples the blit and softens every character.
- **Antialiasing has to match.** An opaque canvas gets LCD subpixel-antialiased
  text; a transparent offscreen one gets grayscale. With the screen canvas
  opaque the two disagreed on 11% of pixels — up to 143 code values on a
  single channel — and text would have changed character the instant it moved
  into a cache. The screen canvas is therefore created with `alpha: true`
  even though its alpha channel is never used. Grayscale is also the better
  choice for a wallpaper: subpixel AA bakes in one physical RGB-stripe layout,
  and a host may scale and recomposite the page onto a panel that has none.
- **Invalidating on resize.** A resize can change DPR and re-measure every
  font while a panel keeps its pixel size, so every cache is dropped
  explicitly rather than relying on geometry comparison.

With those in place the cached output is pixel-identical to drawing live:
across 2.07 M pixels no pixel differs by more than 2 code values (8-bit
compositing round-off), at every resolution and DPR tested.

### What was tried and rejected

Caching the panel chrome in its own second bitmap, separate from the content,
was **0.05 ms/frame faster but cost a whole extra screen of RAM** (32 MB at
4K). Merging chrome and content into one layer per panel gives that memory
back. Conversely, dropping the chrome cache altogether and merely reusing a
`Path2D` for the frame was 4.5x *slower* (0.80 ms) — filling and stroking
eight large translucent rounded rects every frame is genuinely expensive, and
a first estimate that put it at 0.06 ms was simply wrong.

Canvas memory now, backing stores only: 33 MB at 1080p, 129 MB at 4K. The
caches are one screen of that; the largest single consumer is the background
layer's baked composite, which is around two screens and is the obvious next
thing to look at.

There is no settings panel yet — customisation is planned. Knobs currently
live as constants in the source: `FPS_MAX`, the fonts and rates in each
panel class, `BG_ENTRIES`, `COMPANY_DATA`.

## Numbers and locale

Two number formats are on screen, deliberately different:

- **Panel readouts** — the telemetry counters and chart values — follow the
  viewer's locale, the way any desktop app's readouts would: `31,190` in
  en-US, `31 190` in pl-PL, `31.190` in de-DE. Latin digits are forced and
  the output is sanitised (U+00A0/U+202F group separators and U+2212 minus
  become plain ASCII) so every glyph keeps the monospace advance the layout
  is built on.
- **Shell output** does not, and must not. A real terminal runs in the C
  locale: `ls`, `df`, `apt`, `rsync` and the rest print `1,234` with a comma
  and `0.5` with a point wherever in the world they run. Localising them
  would be the one detail that gives the illusion away.

The MAUI build had no such split — it ran under a pl-PL culture and leaked
that locale into the fake shell output too.

## Testing hook

The script is a classic script, so every top-level name is reachable from
the console; `window.__hacker` is the stable surface:

```js
__hacker.step(dt)           // advance dt seconds (default 1/60) and draw, synchronously;
                            // bypasses the fps cap and the running state
__hacker.stop() / .start()  // pause / resume the live rAF loop
__hacker.reroll()           // next background with a glitch burst (same as F6)
__hacker.setBackground(key) // a specific background; keys in __hacker.backgrounds
__hacker.setHostFps(v)      // pretend Wallpaper Engine reported an FPS limit
__hacker.fpsCap()           // the cap currently in force
__hacker.dashboard() / .panels()
```

The Claude Browser pane reports `document.hidden = true`, so rAF never fires
there — drive it with `step()` and sample the canvas.

`Layer` is a top-level class, so it is reachable too, which is how the cache
is checked against the thing it replaced. Stubbing its `draw` makes every
panel paint live; drawing the same frozen frame both ways and diffing the
canvas is what proves the cache is not showing anything stale or misaligned:

```js
__hacker.stop();
for (let i = 0; i < 1800; i++) __hacker.step(1/60);
Date.now = () => 1700000000000;        // freeze, or cursors blink between draws
const d = __hacker.dashboard(), x = document.getElementById('screen').getContext('2d');
d.draw();                              // cached
const A = x.getImageData(0, 0, innerWidth, innerHeight).data;
const orig = Layer.prototype.draw;
Layer.prototype.draw = (r, fn) => fn(r);
d.draw();                              // live
// ...diff against A, then restore Layer.prototype.draw = orig
```

Expect no pixel to differ by more than about 2. A large difference means a
layer is not being invalidated when its content changes.

## Assets

- `assets/logos/*.png` — 267 company logos, one per `COMPANY_DATA` entry,
  mostly 256×256. These are the companies' trademarks, used here in parody.
- `assets/backgrounds/*` — eight Anonymous-mask / glitch-art images, up to
  1920×1080. Source and licence of these images are not recorded in the
  repo.
