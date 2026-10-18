# AGENTS.md — Leren met Loes

## Project
Leren met Loes is a Dutch educational web app for a young child. It is deployed with GitHub Pages.

Repository:
- https://github.com/rdegroot1/lerenmetloes
Live app:
- https://rdegroot1.github.io/lerenmetloes/

The app currently lives mainly in a single large `index.html` with embedded CSS and JavaScript. Keep the app dependency-light and suitable for GitHub Pages.

## Main goals
- Fun, low-friction learning for a 5-year-old.
- Large touch targets, very little scrolling during exercises.
- Dutch reading, math, English, geography, household tasks/rewards.
- Playful progression inspired by child-friendly game mechanics.
- Never punish mistakes with lives/hearts.
- Preserve existing progress when adding features.

## Important UX rules
- During active exercises the screen should fit within one viewport where practical.
- Do not require a young child to scroll to reach answers.
- Avoid unnecessary “listen” buttons when audio would reveal the answer.
- Keep instructions short and visually clear.
- Prefer 2–3 large choices over dense controls.
- Use playful feedback and animation, but do not make the interface visually noisy.
- Keep adult/parent controls out of the child flow where possible.

## Reading pedagogy
Keep new reading content appropriate for early literacy:
- rhyme
- first sound / first letter
- last sound / last letter
- phoneme awareness
- short simple words
- letter-sound linking
- assembling simple words
- gradual repetition

Avoid suddenly introducing difficult consonant clusters or long words without a clear progression.

## Current reading structure
Chapter 1 contains the original early-reading path.
Chapter 2 is “Het Sterrenbos” and adds:
- Sterrenletters
- In de keuken
- Laatste klank
- Op avontuur
- Letterregen
- Dierenfeest
- Mijn spullen
- Sterrenproef

When adding later chapters, keep stable level IDs because progress keys depend on them.

## Progress/storage
Player progress is persisted in the browser and may also be synchronized depending on the current code path.

Important:
- Do not reset or rename existing progress keys.
- Preserve old saved player objects by merging defaults.
- Stable level IDs are important.
- Existing stars, XP, stickers, chores, gems, outfits, streaks and daily mission progress must survive updates.

## Voice system
Six characters exist:
- vos = Vos Vera
- robot = Robot Bliep
- muis = Muisje Pien
- leeuw = Leeuw Leo
- fee = Fee Fien
- piraat = Piraat Piet

Permanent MP3 files are stored in the repository root with this naming convention:
- lerenmetloes_<character>_proef.mp3
- lerenmetloes_<character>_goed.mp3
- lerenmetloes_<character>_fout.mp3
- lerenmetloes_<character>_klaar.mp3

Character reactions use these MP3s.
Dynamic words, numbers and exercise instructions use browser speech synthesis.

Keep a speech-synthesis fallback when character audio fails.

## Known bug pattern: duplicate words
Some words can occur in more than one pool, for example “aap”.
Never offer another object with the same word text as a wrong answer.
The helper `others()` contains duplicate-meaning protection. Preserve it.

## JavaScript safety
A previous regression produced a white screen because literal `\\n` sequences were accidentally inserted into executable JavaScript.

After editing `index.html`:
1. Check that no unintended literal `\\n` sequence was inserted into executable JS.
2. Check that all referenced exercise handlers exist in `OEFENINGEN`.
3. Check that new level IDs are unique.
4. Check that the last level does not try to open a non-existent next level.
5. Check that old player data still hydrates correctly.

Prefer small, incremental edits over large rewrites.

## Styling
The visual direction is:
- magical treehouse / fantasy learning world
- warm polished 3D-animation feel
- rounded cards
- bright child-friendly colors
- large tap targets
- playful stars, treasure chests, rainbows, unicorns, etc.

Do not imitate copyrighted studio characters or branded artwork.

## Current game systems
The app includes:
- stars and XP
- stickers after repeated correct answers
- daily missions
- adventure streak
- treasure chest after learning rounds
- trophy cabinet
- chores/tasks
- gems
- dress-up rewards
- adaptive repetition
- parent overview
- minigames such as bubbles, memory, balloons and number stars

Keep these systems lightweight and understandable.

## Deployment
GitHub Pages publishes from the repository. Changes to `main` should be checked for a successful Pages build.

For substantial changes:
- prefer a dedicated branch
- test the app
- review the diff
- then merge to main

For tiny safe fixes, a direct commit to main is acceptable if explicitly requested.

## Before declaring a change complete
Verify at minimum:
- page loads without a white screen
- no obvious JS syntax issue
- exercise can start
- home navigation still works
- child progress is not reset
- character audio paths still resolve
- GitHub Pages build succeeds

## Language
The user communicates in Dutch. Use Dutch for UI copy and user-facing text unless the feature specifically teaches English.
