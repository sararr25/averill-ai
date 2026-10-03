# Local platform simulations

`social-simulator/` is the source-controlled copy of the existing Vamo Instagram, LinkedIn and Brevo demo. It is separate from Averill and is not bundled in the desktop release. No platform sign-in is needed.

```sh
cd demo-tools/social-simulator
npm ci
npm test
npm run build
npm run dev -- --port 5175
```

Open http://127.0.0.1:5175/brevo, /instagram or /linkedin. Run only one copy on the same port. See the simulator README for supported workflows, storage namespaces and verification limits.
