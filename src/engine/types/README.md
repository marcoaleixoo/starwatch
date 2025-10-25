These ambient definitions shadow upstream packages that ship incomplete or inaccurate types.
Only the modules consumed by `noa-engine` at runtime are copied here:

- `aabb-3d`
- `ent-comp`
- `events`
- `gl-vec3`

If additional dependencies need type patches, add a sibling directory that mirrors the package name
and expose an `index.d.ts` entry point.
