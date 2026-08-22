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

There is no settings panel yet — customisation is planned. Knobs currently
live as constants in the source: `FPS_MAX`, the fonts and rates in each
panel class, `BG_ENTRIES`, `COMPANY_DATA`.

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

## Assets

- `assets/logos/*.png` — 267 company logos, one per `COMPANY_DATA` entry,
  mostly 256×256. These are the companies' trademarks, used here in parody.
- `assets/backgrounds/*` — eight Anonymous-mask / glitch-art images, up to
  1920×1080. Source and licence of these images are not recorded in the
  repo.
