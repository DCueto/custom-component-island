
// Custom element
class MiniIsland extends HTMLElement {

  static tagName = 'mini-island';

  static attributes = {
    dataIsland: 'data-island',
  };

  // custom element method that is invoked when our custom element is attached to the DOM
  async connectedCallback() {
    await this.hydrate();
    await this.printConditions();
  }

  async hydrate() {

    // array of promises to be resolved before hydration
    const conditions = [];

    // get conditions for the current island element node
    let conditionsAttributeMap = Conditions.getConditions(this);

    for (const condition in conditionsAttributeMap){
      // retrieves method function that returns a promise from map property object
      const conditionFn = Conditions.map[condition];

      if (conditionFn) {
        console.log( conditionFn );

        // invokes the condition function with the condition value and the current island node, so it'll return the promise
        const conditionPromise = conditionFn( conditionsAttributeMap[condition], this );
        // then includes this promise into our conditions promises array
        conditions.push(conditionPromise);
      }

      console.log(conditions);
      
      // awaits for resolving all promises and then replace the templates content
      await Promise.all(conditions);

      const relevantChildTemplates = this.getTemplates();

      console.log( relevantChildTemplates );

      if ( relevantChildTemplates instanceof NodeList && relevantChildTemplates.length > 0 ){
        this.replaceTemplates(relevantChildTemplates);
        return;
      }

      console.log("There's no template tags into your mini-island element. Implement a <template> tag for rendering hydrated content");
    }
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

  printConditions(){
    console.log(this);
    console.log( 'getConditions() value from Conditions class', Conditions.getConditions(this) );
    Conditions.hasConditions(this);
  }
}

// conditions for hydrating component
class Conditions {
  static map = {
    idle: Conditions.waitForIdle,
    visible: Conditions.waitForVisible,
    media: Conditions.waitForMedia,
  }

  static waitForIdle() {
    return new Promise( (resolve) => resolve() );
  }

  static waitForVisible() {
    return new Promise( (resolve) => resolve() );
  }

  static waitForMedia() {
    return new Promise( (resolve) => resolve() );
  }

  /* returns a key:value representing the condition:attribute of mini-island attr
    * Return examples
      * condition:attribute for client:visible => { visible: "" }
      * condition:attribute for client:media="(max-width: 400px)" => { media: "(max-width: 400px)" }
  */
  static getConditions(node) {
    let result = {};

    for (const condition of Object.keys(Conditions.map)) {
      // console.log( "Condition from map property of Conditions class", condition );

      if (node.hasAttribute(`client:${condition}`)) {
        // if has that condition attribute into that html node, creates a property into result object with that condition key name and it's value in html tag attribute
        result[condition] = node.getAttribute(`client:${condition}`);
      }
    }
    return result;
  }

  static hasConditions(node) {
    const conditionsAttributeMap = Conditions.getConditions(node);

    console.log( Object.keys(conditionsAttributeMap) );

    // if has at least 1 condition then returns true
    return Object.keys(conditionsAttributeMap).length > 0;
  }
}


// checks if browser supports native custom elements
if ('customElements' in window) {
  // registers our custom element
  window.customElements.define(MiniIsland.tagName, MiniIsland);

} else {
  console.error('Island cannot be initiated because Window.customElements is unavailable in your browser.');
};
