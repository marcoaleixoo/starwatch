
# noa-engine (vendored snapshot)

This directory contains a trimmed snapshot of the upstream
[`noa-engine`](https://github.com/fenomas/noa) project, kept in-source so the
Starwatch prototype can depend on a known version without publishing an extra
package.

- Upstream license: see `LICENSE`.
- We rely only on runtime code — upstream build/test tooling isn’t wired into
  this repository.
- Runtime entry point remains `src/index.js`, matching the NPM package layout.

---

An experimental voxel game engine.

Some projects using `noa`:
 * [bloxd.io](https://bloxd.io/) - multiplayer voxel games with editable worlds, by [Arthur](https://github.com/MCArth)
 * [Minecraft Classic](https://classic.minecraft.net/) - from Mojang (I'm as surprised as you are)
 * [VoxelSrv](https://github.com/Patbox/voxelsrv) - a voxel game inspired by Minecraft, by [patbox](https://github.com/Patbox)
 * [CityCraft.io](https://citycraft.io/) - multiplayer voxel cities, by [raoneel](https://github.com/raoneel)
 * [OPCraft](https://github.com/latticexyz/opcraft) - a voxel game running on Ethereum smart contracts, by [Lattice](https://github.com/latticexyz)
 * [noa-examples](https://github.com/fenomas/noa-examples) - starter repo with minimal hello-world and testbed games


----

## Usage

The easiest way to start building a game with `noa` is to clone the 
[examples](https://github.com/fenomas/noa-examples) repo and start hacking 
on the code there. The comments in the `hello-world` example source walk 
through how to instantiate the engine, define world geometry, and so forth. 
The example repo also shows the intended way to import noa's 
peer dependencies, test a world, build for production, etc.


## Docs

See the [API reference](https://fenomas.github.io/noa/API/) 
for engine classes and methods. 

Documentation PRs are welcome! See the source for details, API docs 
are generated automatically via `npm run docs`.


## Status, contributing, etc.

This engine is under active development and contributions are welcome.
Please open a discussion issue before submitting large changes.
**PRs should be sent against the `develop` branch!**

Code style/formatting are set up with config files and dev dependencies, 
if you use VSCode most of it should work automatically. If you send PRs, 
please try to be sorta-kinda consistent with what's already there.



## Credits

Made with 🍺 by [@fenomas](https://fenomas.com), license is [MIT](LICENSE).

Uses [Babylon.js](https://www.babylonjs.com/) for 3D rendering.
