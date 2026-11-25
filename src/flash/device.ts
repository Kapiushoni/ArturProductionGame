// Device class: phones and tablets (touch only, no mouse) get a lighter renderer.
// ?lowpower=1 / ?lowpower=0 in the URL forces it on or off (for testing on a computer).
export const lowPower: boolean = (() => {
  try {
    const q = new URLSearchParams(location.search).get('lowpower');
    if (q !== null) return q === '1';
    return matchMedia('(pointer: coarse)').matches && !matchMedia('(any-pointer: fine)').matches;
  } catch { return false; }
})();
