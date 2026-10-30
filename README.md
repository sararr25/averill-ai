# Averill

Averill helps employees complete work, improve drafts and learn their tools, while checking every suggestion against the company's approved sources and showing the source behind it. It runs as a macOS desktop app with a Chrome extension, uses NVIDIA Nemotron (through Nebius Token Factory) for a second opinion, and Tavily for public fact-checks.

Everything in the demo is fictional: the company Vamo, its people, its documents and its tools.

## Try it

Follow **[test-averill.md](test-averill.md)**. In short:

1. Download `Averill-macOS-arm64.zip` from the [latest release](https://github.com/sararr25/averill-ai/releases/latest), unzip it, right-click `Averill.app` › **Open**.
2. Click **Try the demo**. Demo accounts (Emma, Maya, Alex) need no password.
3. On **Home**, paste your own [Nebius Token Factory](https://tokenfactory.nebius.com) key and [Tavily](https://tavily.com) key. They are stored only on your Mac, encrypted by the macOS Keychain, and sent only to their own provider. Without keys, the approved-rules checks still work locally.

Requires a Mac with Apple Silicon and Google Chrome (Canva sections also need a free Canva account).

## Repository

| Folder | What it is |
| --- | --- |
| `travel-desktop/` | The Electron desktop app, Chrome extension (`browser-extension/`) and fictional Vamo company pack (`demo-company/`) |
| `demo-tools/` | Simulated Brevo, LinkedIn and Instagram pages used in the demo |
| `travel-site/` | Vamo's fictional public website |
| `judge-ai-server/` | Optional capped server the owner used for keyless demos (not used by this release) |
| `demo-login-documents/` | Fictional sample documents |

See [ARCHITECTURE.md](ARCHITECTURE.md) for how the parts fit together.

## Run from source

```bash
cd travel-desktop
npm install
npm test
npm start
```

## License

See [LICENSE](LICENSE).
