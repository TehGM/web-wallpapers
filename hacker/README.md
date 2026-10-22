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

**Status: released** — in the gallery as SYNAPSE//9. Saved settings, scene
codes and shared links are a public contract from here on: they must keep
loading and keep their look across updates (see the save-compatibility rules
in the root `CLAUDE.md`).

## Settings

**⚙ CFG**, in the title bar of the top-right panel (left of its status dot),
opens the settings window; **H** toggles it, **Esc** closes it, **L** opens
the layout editor. It opens in
the middle of the screen and its title bar drags it; a dragged window stays
where it was put until the screen size changes. It is styled as one more
window of the console. It lays its sections out in as many columns as fit
side by side on the screen, up to three — checked on opening, on a resize and
when the settings-window size changes. Which column a section lands in is
worked out from every section's unfolded height, so it depends only on the
number of columns: folding a section never moves the others, and reopening
puts everything back where it was.

Every slider's value readout is also a text field: click it (or focus it and
press Enter), type, and press Enter or click away; Esc cancels. Typed values
are in the units shown — `137` on a percentage means 137% — accept a decimal
comma, are clamped to the slider's range, and are not snapped to its step, so
they can be finer than the slider. The slider then sits at its nearest step
while the setting keeps the exact value.

| Section | Settings |
| --- | --- |
| LAYOUT | **Layout & panels** (also **L**) — see Layout and Panel settings below. **Gap between panels** (0–200 px) and **Insets** on each side, in px (8 by default) — empty space kept clear of panels, for a taskbar or desktop icons; the background still fills it. Each slider runs up to the current screen's width or height, and follows a resize; a saved value is never cut down for a smaller screen, and however large the insets, a sliver of layout stays on screen. |
| APPEARANCE | Text size — every panel's text, multiplying each panel's own text size (60–250%). Title bars scale with it, and so does everything sitting in them: the CFG button, the panel ⚙ buttons, the layout editor's ⚙ and ✕. |
| | Border glow — strength of the soft glow around every panel's frame, 0–300%, multiplying each panel's own; 0 leaves a plain line. |
| | Border pulse — how fast that glow breathes and the title-bar dots blink, 0–4x, multiplying each panel's own; 0 holds them still. Each breathing step repaints the panel's cached frame, so this is a cost knob too — measured at 1080p: steady 0.25 ms/frame, default 0.30, 4x 0.59. |
| | Settings windows — size of every settings window (this one, each panel's, the layout editor's, the scene-code box), 75–200%. Affects nothing else; applies when the slider is released. |
| BACKGROUND | **Current** — the background on screen now, chosen from the list (picking one that is not ticked ticks it); **Opacity**, **Blur** and **Drift** (distance), each a multiple of the image's own tuned level — 0 blur is sharp, 0 drift is still — and **Drift speed**; blur and opacity are baked into the cached image, drift is read per frame; **Change every** — off, or 5 s to once a day (typed: `90`, `5m`, `1h30m`), counted in real time; and which backgrounds to pick from, **No background** among them. |
| CRT // OVERLAY | Scanlines and their drift speed, refresh band and its speed, flicker, glitch-bar frequency, vignette. Strengths are relative to the original look (100%); 0 switches an effect off and skips its draw. |
| ANIMATION | Master speed — scales everything that moves. 0 freezes the screen, and a frozen screen is not redrawn at all. |
| PERFORMANCE | FPS cap (0 = uncapped), pixel-ratio cap, and **Override WE FPS limit** (see Performance). |
| INTERFACE | Settings button: dim, or hidden until the mouse is over its spot. |

The toolbar has **IMPORT ▾** (scene code, JSON file), **EXPORT ▾** (wallpaper
link, scene code, JSON file) and **RESET**.

### Saving and sharing

Every change is saved straight away, two ways: to `localStorage`
(`tehgm.hacker.state`), so a copy a wallpaper host loads from disk comes back
to it, and to the address bar as `?config=…`, so the URL is always a link to
exactly this look. Both hold only the values that differ from the defaults.
On load a link wins, then the local save, then the defaults; a link that
cannot be read is ignored with a console warning.

A **scene code** is the same compressed state as bare text, in the same
format Black Hole and Neonscape use. It is how settings move into a copy
installed from the Workshop or a ZIP, which has no link to read: export it
here, paste it under IMPORT ▸ Scene code there.

### Adding a setting

Settings are declared, not hand-built. Adding one is:

1. a key in `DEFAULTS`;
2. a row in `SETTINGS_SCHEMA` — `{ kind, label, path, ... }`, where `kind` is
   `range`, `check`, `select`, `note` or `button`, plus optional `tip`,
   `show(s)` / `dis(s)` predicates and an `apply` override. A `range` also
   takes a `unit` (`U_PCT`, `U_MUL`, …), which sets both how its readout
   reads and how a typed value is understood;
3. if the wallpaper must rebuild something for it, an entry in `APPLY`.

A new section is one more entry in `SETTINGS_SCHEMA`; a new kind of control
is one more builder in `ROW_KINDS`; a new toolbar action is one more entry in
`TOOLBAR`. The ranges declared in the schema are also what loaded values are
clamped to, so a hand-edited save can never push a value out of range.

None of the window exists until it is first opened; closed, the only cost is
the CFG element and its click handler. Measured: frame time is unchanged
within noise (0.24–0.26 ms/frame at 1080p either way), and with everything
at its default the picture is pixel-identical to the build before settings
existed.

## Layout

**Layout & panels** (in settings, or **L**) puts the editor over the live
wallpaper, Visual Studio-style:

- **Move** — drag a panel. Drop it on another panel's edge to dock beside it
  (that panel is halved), on its middle to swap the two, or on the very edge
  of the screen to run along that whole side (taking a quarter of it). A
  highlight shows where it will land before you let go.
- **Resize** — drag the gap between two panels. Neither side goes below its
  panel's minimum size.
- **Remove** — ✕ in a panel's corner. Removing everything leaves just the
  background.
- **Add** — drag an entry from the list onto the screen, or click it to split
  the largest panel along its longer side. Any panel can be added any number
  of times; the list shows how many of each are already on screen (×2). A drop
  that would squeeze a panel below its minimum size is refused, with a note
  in the status line.
- **Undo** (Ctrl+Z) steps back through this session's edits; **Reset** goes
  back to the default layout; **Done** or Esc leaves. Esc in the middle of a
  drag cancels just the drag.

The layout is a tree: a leaf is a panel (`{ p: type, id }`), a split lays its
children side by side or stacked (`{ d: "h" | "v", c: [...], f: [fractions] }`),
and the tree is kept as simple as it can be — a one-child split collapses, a
split inside one running the same way is folded into it. It lives in
`S.layout` and is saved and shared like every other setting; `null` means the
default layout, which keeps its per-load jitter until the first edit freezes it.
Loaded layouts are rebuilt from scratch (`validateTree`): unknown panel types
and malformed splits are dropped and duplicate ids renumbered.

A leaf's id ties it to its live panel, so moving a panel keeps it running
mid-sentence rather than restarting it, and a removed panel's cache bitmap is
freed straight away. Panel kinds and their minimum sizes are declared in
`PANEL_TYPES`.

Cost scales with what is on screen, roughly with the number of panels: the
default layout costs what it always did, and about thirty panels measured
around 0.95 ms/frame at 1080p. The editor itself is DOM that exists only
while it is open.

## Panel settings

Each panel has a settings window of its own. While the settings window is
open, every panel shows a ⚙ in its title bar — click it (again to close);
in the layout editor, click a panel or its ⚙. Esc closes it, and closing the
settings window takes it along. Every panel has:

| Setting | What it does |
| --- | --- |
| Title | Blank keeps the panel's own title. |
| Accent colour | Frame, title and cursor colour, from a colour picker: saturation/brightness square, hue bar, hex field (`#RRGGBB` or `#RGB`), and the wallpaper's palette plus **default** (the panel's own colour) one click away. |
| Title bar | Off gives the content the whole panel. |
| Text size | 60–250%, multiplied by the global text size. Scales the content only — title bars follow the global size, so they all stay level. Larger text shows fewer lines, and costs less. |
| Speed | On top of master speed; 0 freezes just this panel. |
| Border glow | 0–300%, multiplied by the global border glow. |
| Border pulse | 0–4x, multiplied by the global border pulse; 0 holds this panel's border and dot still, and spares it the repaints. |

And by type:

| Panel | Settings |
| --- | --- |
| SYS://TRACE | Feed (system log or event feed), how often lines are errors and warnings |
| MEMORY INSPECTOR | How often a row is highlighted |
| SOURCE SYNTH | Thinking pauses on or off |
| TARGET ACQUISITION | Company logos, or monograms only |
| TTY | Prompt user and host (anyone but root gets a `$` prompt; a blank host is made up per terminal), and which commands it runs — with none ticked it runs them all |
| TELEMETRY | Number of charts (1–4) and counters (0–6); charts side by side, stacked, or chosen from the panel's shape |
| TASK PIPELINE | Number of bars (1–12), how often tasks fail, how often they loop forever |
| RAW STREAM | How often a run is highlighted |

Settings belong to the panel, not to its place: they move and swap with it,
and two panels of the same type have their own. A leaf stores only what
differs from its type's defaults, in `s`, so they save and share with the
layout. Undo steps back through the layout but leaves panel settings as they
are; **RESET PANEL** puts one panel back, and the layout's **RESET** puts
back everything, panel settings included. Editing a panel of the default
layout freezes the default layout's per-load jitter, as any edit does.

The rows are declared like the main settings: `PANEL_COMMON_ROWS` and
`PANEL_ROWS` in the same row format, each with its default in `def`. A
panel class applies them in `configure(cfg)`, which runs after construction
and on every change. Both windows are built by the same `Form` code.

## What is on screen

The default layout is eight panels in a three-column grid whose split fractions
are jittered a little on every load, so no two launches have quite the same
geometry. The layout can be rearranged freely — see Layout.

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
New commands go in `SHELL_COMMANDS`, which is also the list a TTY panel's
settings offer.

Commands: `ping`, `wget`, `docker pull`, `apt-get install`, `git clone`,
`make`, `ls -la`, `df -h`, `dd`, `grep -rn`, `journalctl`, `tar -xvzf`,
`rsync`, `systemctl status`, `curl -sI`, `sha256sum`, `top`, and two
invented tools, `synctl` and `meshctl`.

### Target acquisition

`COMPANY_DATA` near the top of the file is the catalogue — `Name|RRGGBB`,
267 entries, one brand colour each. A logo is loaded from
`assets/logos/<slug>.webp` (slug = name lower-cased, non-alphanumerics
dropped) the first time it is needed and released once that company has had
its turn; if the file is missing, a procedural monogram in the brand colour
is drawn instead, so the panel never depends on an asset being there. The
deck is shuffled and replayed endlessly.

## Backgrounds

`BG_ENTRIES` lists the background images with per-image readability tuning
(opacity, scrim, tint, focal point, zoom, soften radius, drift, cover vs
contain). Adding an image means dropping it into `assets/backgrounds/` and
adding an entry — the defaults in `BG_DEFAULT` are a reasonable start and
each entry only states what differs — plus a label in `BG_LABELS`.

`BG_CHOICES` is every image plus `none`, which is picked, ticked and cycled
like an image and simply draws nothing. The settings tick which ones may be
picked (every image by default, not `none`): one of them is chosen at random
on load and by the optional timer, each change with a glitch burst. The one
on screen is always a ticked one — unticking it switches to another, and
unticking the last ticks `none` and shows it. The timer counts real time, so
it neither stretches with master speed nor stops while the screen is frozen;
it does stop while the wallpaper is hidden or paused, like everything else.

The MAUI original faked its blur by compositing nine copies of the image
every frame; here the same composite (plus the scrim, tint and edge falloff)
is baked once into offscreen canvases on load and on resize, so the
background costs one `drawImage` per frame.

## Performance

Canvas 2D, one `requestAnimationFrame` loop, capped at **60 fps** by default
(everything is delta-time based, so a faster display mostly burns GPU for
near-identical frames). Device pixel ratio is capped at 2 by default. Both
caps are settings. The loop stops entirely while the page is hidden or while
Wallpaper Engine reports the wallpaper paused. At master speed 0 it draws
nothing, and stops waking up for frames at all until something needs drawing —
a setting, a resize, a background loading or changing on its timer (which is
woken for, and counts the time slept). With the settings window open it keeps
running, for the fps meter. A very low FPS cap still runs in real time: one
frame's time step is allowed to reach one and a half capped frames.

Inside a host that limits the frame rate of the whole desktop — Wallpaper
Engine does, through `wallpaperPropertyListener` — that limit takes over the
FPS cap and locks its slider, so the host's setting is respected by default.
**Override WE FPS limit**, right above the slider, hands the cap back for this
wallpaper alone; the switch and the cap are both remembered. In a browser no
limit is ever reported, so the switch stays hidden. This is the same
behaviour as Black Hole and Neonscape — note it means a host limit above 60
now raises the cap rather than being clamped to 60.

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
                            // bypasses the fps cap, the running state and master speed
__hacker.stop() / .start()  // pause / resume the live rAF loop
__hacker.reroll()           // another ticked background, with a glitch burst
__hacker.setBackground(key) // a specific background: a key of __hacker.backgrounds, or "none"
__hacker.setHostFps(v)      // pretend Wallpaper Engine reported an FPS limit
__hacker.fpsCap()           // the cap currently in force (0 = uncapped)
__hacker.settings()         // the live settings object
__hacker.set(path, v)       // set one setting, e.g. set("fx.scan", 2), as the panel would
__hacker.loadState(obj)     // replace all settings: defaults with obj merged over them
__hacker.ui                 // the settings window: open() / close() / toggle() / refresh()
__hacker.dashboard() / .panels()
```

For a deterministic frame — A/B diffs between two builds — seed
`Math.random`, freeze `Date`, and stub `requestAnimationFrame` before the page
loads (CDP `Page.addScriptToEvaluateOnNewDocument`). Without the rAF stub the
live loop runs in real time while assets load and consumes random numbers at
a timing-dependent rate, so even a build compared with itself differs.

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

Everything under `assets/` is **WebP**, and the loaders assume it: a logo is
`assets/logos/<key>.webp` and a background is `assets/backgrounds/<key>.webp`,
where the key is the `BG_ENTRIES` key. A background entry may override the
filename with a `file` property if one ever needs a different name or format;
nothing currently does. The extensions are the constants `LOGO_EXT` and
`BG_EXT`.

- `assets/logos/*.webp` — 267 company logos, one per `COMPANY_DATA` entry,
  mostly 256×256. These are the companies' trademarks, used here in parody.
  A missing or undecodable file is not fatal: the panel falls back to a
  procedural monogram, which also means a broken path fails *silently* —
  check logos actually decode rather than assuming they do.
- `assets/backgrounds/*.webp` — eight Anonymous-mask / glitch-art images, up
  to 1920×1080. Source and licence of these images are not recorded in the
  repo.

Converting both sets from PNG/JPEG to WebP took them from 3.33 MB to 1.65 MB
(logos −33%, backgrounds −73%), which is download and disk only — once
decoded, a frame costs exactly the same either way.

`preview.jpg` stays JPEG on purpose: it is the Wallpaper Engine preview
image, and WE's own format requirements govern it, not the page.
