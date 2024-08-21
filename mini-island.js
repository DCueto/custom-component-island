
// Custom element
class MiniIsland extends HTMLElement {

  static tagName = 'mini-island';

  static attributes = {
    dataIsland: 'data-island',
  };

  // custom element method that is invoked when our custom element is attached to the DOM
  async connectedCallback() {
    await this.hydrate();
  }

  hydrate() {
    const relevantChildTemplates = this.getTemplates();

    console.log( relevantChildTemplates );

    if ( relevantChildTemplates instanceof NodeList && relevantChildTemplates.length > 0 ){
      this.replaceTemplates(relevantChildTemplates);
      return;
    }

    console.log("There's no template tags into your mini-island element. Implement a <template> tag for rendering hydrated content");
  }

  getTemplates() {
    return this.querySelectorAll(`template[${MiniIsland.attributes.dataIsland}]`);
  }

  // iterates each template and replaces the <template> tag with its inner HTML content
  replaceTemplates(templates) {
    for (const node of templates) {
      // console.log('Node from templates', node);
      // console.log('Node template content', node.content);
      node.replaceWith(node.content);
    }
  }
}

// checks if browser supports native custom elements
if ('customElements' in window) {
  // registers our custom element
  window.customElements.define(MiniIsland.tagName, MiniIsland);

} else {
  console.error('Island cannot be initiated because Window.customElements is unavailable in your browser.');
};
