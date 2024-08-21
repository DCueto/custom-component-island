
// Custom element
class MiniIsland extends HTMLElement {

  static tagName = 'mini-island';

  static attributes = {
    dataIsland: 'data-island',
  };
}

// checks if browser supports native custom elements
if ('customElements' in window) {

  // registers our custom element 
  window.customElements.define(MiniIsland.tagName, MiniIsland);

} else {

  console.error('Island cannot be initiated because Window.customElements is unavailable in your browser.');

};
