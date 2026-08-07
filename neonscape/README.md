# Neonscape

A synthwave / retrowave scene builder and animated wallpaper, rendered with
Three.js. Everything on screen — sun, grid floor, road, the car on it, horizon,
palms, neon text, weather, post FX — is editable live from the built-in panel,
and every scene can be randomized, saved, and shared as a link. Almost every
element can also be driven by audio (bass, mids or treble).

Open [index.html](index.html) in a browser, or point Wallpaper Engine / Lively
Wallpaper at it as a web wallpaper. The one dependency, Three.js, is vendored
next to it ([three.min.js](three.min.js), licence in
[three.LICENSE](three.LICENSE)), so it works fully offline and straight off
disk.

## Controls

The panel opens on the left. Its toolbar:

- 📼 **Load preset** — curated scenes, including *Countach Cruise* and
  *TehGM's Eerie Whispers*.
- ⚂ **Randomize** — a whole new scene; the glued ▾ picks a mood that biases
  what the randomizer builds. Hotkey **R**.
- 🎨 **Palette** — reroll only the colors, keep the scene.
- ⭱ **Import** / ⭳ **Export** — scene code, JSON file, or a wallpaper link.
- **Reset** — back to defaults. **Hide UI** (**H**) and **⛶ Full** (**F**).

Below that, collapsible sections cover every part of the scene: General, Sky,
Sun · Moon, Grid floor, Road, Car, Horizon, Stars, Clouds · Haze, Extras
(palms, neon text, light beams, weather), Camera, Post FX, Audio reactive, and
Animation · Perf. The footer shows the fps, and the scene seed — click it to
type a seed and regenerate.

## The car

**Car** puts a Lamborghini Countach on the tarmac. It is a real low-poly mesh,
not a sprite, so it holds up as an object standing on the road while the camera
sways, dollies and orbits: it follows the road's bend, keeps its lane as the
road is widened, casts a contact shadow and is mirrored in the wet surface
along with everything else the Scene reflection slider covers.

Which way it faces follows the world rather than a setting. The floor scrolling
toward you means you are moving forward, so the car ahead is driving away;
reverse the scroll and it turns into oncoming traffic with its four pop-up
headlights raised. Wheels, speed streaks and tyre marks all run at the road's
speed, so a stopped road parks it.

Solid bodywork, a glowing wireframe or both at once, with body and accent
colours, lane, distance, size, lights, underglow, speed streaks, tyre marks and
the rear wing. The underglow is strip lighting: it spills onto the road along
the body's own outline rather than pooling in a circle, and it lights the
ground only. The speed streaks come off the car itself and stream past it; the
tyre marks are rubber laid down behind the rear wheels, wandering and patchy
and fading out with distance. Between them they are what makes it read as
driving rather than parked. Switched off the car costs nothing at all —
no geometry is built until the first time it is turned on, and turning it off
returns the scene to exactly the draw calls it had without it. The tyre marks
are the same: at 0 they are compiled out of the shader.

Hotkeys: **H** hide/show UI · **R** randomize · **F** fullscreen · **Space**
play/pause · **S** copy a wallpaper link.

## Sharing a scene

Three interchangeable forms, all containing the identical full scene:

- **Wallpaper link** — a `?config=…` URL (compressed state in the query
  string). Add `&ui=0` to start with the panel hidden — the export does this
  for you.
- **Scene code** — the same blob as bare text. This is the way to move a scene
  into a copy a wallpaper host loads straight off disk, where a link has no
  query string to apply: paste it under ⭱ Import. Once applied it is
  remembered in `localStorage`, along with every later tweak.
- **JSON file** — human-readable, hand-editable.

Presets have short readable links too: `?preset=<id>` (e.g.
`?preset=eerie-whispers`). Loading a preset puts its id in the address bar;
editing anything withdraws it, since the scene no longer is that preset. When
both are present `config=` wins — it pins an exact scene, while a preset is a
name whose definition may be retuned in a later release.

Precedence on load: `?config=` → `?preset=` → the autosaved local scene →
defaults. A shared link always looks the way the sender saw it. With nothing
saved and nothing asked for, the opening scene — and **Reset** — is *Classic
Outrun*.

## Audio reactivity

Map bass / mids / treble to whatever should move: grid pulse, sun, bloom,
stars, road, horizon, camera, the car's lights and speed streaks,
neon text, palms, beams. Every
preset arrives with reactivity on and mapped to what that scene actually
shows, so the choice of bands is part of the preset. Sources:

- **Wallpaper Engine** — the system audio feed is automatic (the `auto`
  source; requires the wallpaper to be *installed*, WE does not feed audio to
  wallpapers opened by URL).
- **System audio** in a browser — screen share with the "share audio" box
  ticked.
- **Microphone**, or a local **audio file** with built-in playback.

In a browser, `auto` falls back to the microphone but never on its own: it
waits for you to touch an audio control or load a preset, so simply opening
the page never raises a permission prompt.

## Performance

These run all day on someone's desktop, so the cheap knobs are front and
centre in **Animation · Perf**: pixel-ratio cap, fps cap, adaptive quality,
and a global speed / pause. Idle scenes render lazily, and features that are
switched off are compiled out of the shaders rather than branched over —
a disabled control costs nothing.

Inside a host that limits frame rate for the whole desktop — Wallpaper Engine
does — that limit takes over the fps cap and locks the slider, so the host's
setting is respected by default. **Override WE FPS Limit**, right above the
slider, hands the cap back to you for this wallpaper alone; it and the cap are
both remembered. In a browser no limit is ever reported, so the switch stays
hidden and the slider is always yours.
