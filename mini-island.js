
// Custom element
class MiniIsland extends HTMLElement {

  static tagName = 'mini-island';

  static attributes = {
    dataIsland: 'data-island',
  };

  // custom element method that is invoked when our custom element is attached to the DOM
  async connectedCallback() {
    await this.hydrate();
    // await this.printConditions();
  }

  async hydrate() {

    // array of promises to be resolved before hydration
    const conditions = [];

    // get conditions for the current island element node
    let conditionsAttributeMap = Conditions.getConditions(this);

    // triggers and stop execution only if there isn't any condition defined into mini-island => default behavior
    if(Object.keys(conditionsAttributeMap).length === 0 ){
      console.warn("NO CONDITIONS", conditions);
      this.replaceTemplates();
      return;
    }

    for (const condition in conditionsAttributeMap){
      // retrieves method function that returns a promise from map property object
      const conditionFn = Conditions.map[condition];

      if (conditionFn) {

        // invokes the condition function with the condition value and the current island node, so it'll return the promise
        const conditionPromise = conditionFn( conditionsAttributeMap[condition], this );
        // then includes this promise into our conditions promises array
        conditions.push(conditionPromise);
      }

      // awaits for resolving all promises and then replace the templates content
      await Promise.all(conditions);
      this.replaceTemplates();

    }
  }

  getTemplates() {
    return this.querySelectorAll(`template[${MiniIsland.attributes.dataIsland}]`);
  }

  // iterates each template and replaces the <template> tag with its inner HTML content
  replaceTemplates() {
    const relevantChildTemplates = this.getTemplates();

    if ( relevantChildTemplates instanceof NodeList && relevantChildTemplates.length > 0 ){
      for (const node of relevantChildTemplates) {
        node.replaceWith(node.content);
      }
      return;
    }
    console.log("There's no template tags into your mini-island element. Implement a <template> tag for rendering hydrated content");
  }

  // printConditions(){
  //   console.log(this);
  //   console.log( 'getConditions() value from Conditions class', Conditions.getConditions(this) );
  //   Conditions.hasConditions(this);
  // }
}

// conditions for hydrating component
class Conditions {
  static map = {
    idle: Conditions.waitForIdle,
    visible: Conditions.waitForVisible,
    media: Conditions.waitForMedia,
  }

  static waitForIdle() {
    const onLoad = new Promise((resolve) => {

      if (document.readyState !== "complete"){

        window.addEventListener("load", () => {
          // when the whole document and it's dependent resources loaded
          resolve();
        },
        // remove event at first invocation
        { once: true }
        );
      } else {
        resolve();
      }
    });

    const onIdle = new Promise((resolve) => {
      // if browser has requestIdleCallback support
      if ("requestIdleCallback" in window) {
        // requestIdleCallback() is invoked when there isn't latency-critical events so it's executed when browser isn't busy
        requestIdleCallback(() => resolve());
      } else {
        resolve();
      }
    });



    return Promise.all([onIdle, onLoad]);
  }

  static waitForVisible(noop, el) {
    if (!("IntersectionObserver" in window)) {
      return;
    }

    return new Promise( (resolve) => {
      let observer = new IntersectionObserver((entries) => {
        let [entry] = entries;
        console.log("entry from entries array (IO)", entry);

        // if element is visible
        if (entry.isIntersecting) {
          // remove observer
          observer.unobserve(entry.target);

          resolve();
        }
      });

      // set the observer to island element
      observer.observe(el);
    });
  }

  static waitForMedia(query) {
    // checks if there is any query and matchMedia is compatible in browser
    if (!query || !("matchMedia" in window)){
      return Promise.resolve();
    }

    const queryList = window.matchMedia(query);
    console.log(queryList);
    // if on loading component island query is coincident, then returns the promise resolved
    if (queryList.matches) {
      return Promise.resolve();
    };

    // if not matches then return a promise adding an event for listening on resizing window
    return new Promise( (resolve) => {

      const evHandler = (e) => {
        if (e.matches) {
          try {
            // chrome & firefox
            queryList.removeEventListener('change', evHandler);
          } catch (err1) {
            try {
              // safari
              queryList.removeListener(evHandler);
            } catch (err2) {
              console.error(err2);
            }
          }
          resolve();
        }
      }

      try {
        // try Chrome & Firefox
        queryList.addEventListener('change', evHandler);
      } catch (err) {
        try {
          // Safari
          queryList.addListener(evHandler);
        } catch (err2) {
          // Exception
          console.error(err2);
        }
      }
    });
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
