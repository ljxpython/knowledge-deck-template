# Knowledge Deck Template

A browser-native template for turning structured courseware into interactive, chapter-based knowledge decks. It is separate from a long-form reading site: this repository is for explaining ideas with narrative pages, diagrams, animation, and simulations.

## Start A New Deck

Select **Use this template** on GitHub, then update `deck.json`, `source/`, and `pages/`. Serve the project through HTTP because the player fetches page fragments:

```bash
python3 -m http.server 8753
```

Open `http://localhost:8753/`.

## What Changes Per Deck

- `source/lesson.md`: the structured courseware source.
- `deck.json`: title, sections, page order, page types, and optional module paths.
- `pages/*.html`: generated or authored page fragments.
- `modules/*.js`: only for interactions that the page primitives cannot represent.

The player, CSS tokens, controls, annotation canvases, and validation scripts are reusable infrastructure. Do not place another course's source material in the template's default sample.

See `docs/custom-modules.md` for the required custom-interaction cleanup contract.

## Checks

```bash
npm run check
```

No package installation is required for the checks. Browser animation uses GSAP from CDN; vendor it locally only when offline delivery is required.

## Deployment

This initial repository is a GitHub Template Repository only. GitHub Pages is intentionally not configured.

## License

MIT. The sample content is original demonstration material.
