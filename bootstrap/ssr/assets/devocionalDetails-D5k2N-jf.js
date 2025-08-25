import { useState, useEffect } from "react";
function useImagePreload(src) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!src) return;
    const img = new window.Image();
    img.src = src;
    img.onload = () => setLoaded(true);
  }, [src]);
  return loaded;
}
export {
  useImagePreload as u
};
