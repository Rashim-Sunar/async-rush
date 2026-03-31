/**
 * Module-level registry for 3D engine zone objects.
 * Used to bridge the R3F Canvas fiber (separate React reconciler)
 * with the DOM React fiber where dnd-kit / GameContext live.
 * Components inside Canvas register here; components outside call pulse/flash/hover.
 */
const _zones = {};

const zoneRegistry = {
  register(id, api) { _zones[id] = api; },
  unregister(id)    { delete _zones[id]; },
  pulse(id)         { _zones[id]?.pulse(); },
  flash(id)         { _zones[id]?.flash(); },
  hover(id, val)    { _zones[id]?.setHover(val); },
};

export default zoneRegistry;
