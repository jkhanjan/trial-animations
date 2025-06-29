import { proxy } from "valtio";

const state = proxy({
  isMobile: window.innerWidth < 768,
});

export { state };
