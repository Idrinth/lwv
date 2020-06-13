/* global YAML,Sass */

(() => {
  const CONSTANTS = {
    nearInstant: 1,
    firstElement: 0,
  };
  const getFirst = (
    /* String */tagName,
  ) => document.getElementsByTagName(tagName,)[CONSTANTS.firstElement];
  /**
   * Set all Element's style to display:none if they don't have the given tag
   * @param {String} tag
   * @returns {undefined}
   */
  const filterForTag = (/* String */ tag,) => {
    if (! tag || tag === '#') {
      window.location.hash = '';
      return;
    }
    /**
     * Checks if the li contains tags and hides those without the intended one
     * @param {HTMLElement} li
     * @returns {undefined}
     */
    const checkTags = (/* HTMLElement */ li,) => {
      if (li.nodeName !== 'LI') {
        return;
      }
      li.setAttribute('style', 'display:none',);
      for (const tagEl of li.getElementsByTagName('li',)) {
        if (tagEl.innerText.replace(/ /gu, '_',).toLowerCase() === tag) {
          li.removeAttribute('style',);
          return;
        }
      }
    };
    tag = tag.replace(/ /gu, '_',).toLowerCase()
      .replace(/^#/u, '',);
    for (const li of document.getElementById('main',).children) {
      checkTags(li,);
    }
    window.location.hash = tag;
  };
  /* On click on a list element filter for it's text content */
  getFirst('body',).addEventListener(
    'click',
    (/* ClickEvent */ e,) => {
      e = e || event || window.event;
      if (e.target.classList.contains('filter',)) {
        filterForTag(e.target.innerText,);
      }
    },
  );
  /**
   * If the window has a hash change event(i.e. reacts to #abc -> #bcd),
   * filter for hash when it changes
   */
  if ('onhashchange' in window) {
    window.onhashchange = () => filterForTag(window.location.hash,);
  }
  /**
   * Load and create css
   * @returns {undefined}
   */
  (async() => {
    const response = await fetch('src/styles.scss',);
    if (response.ok) {
      const scss = await response.text();
      Sass.compile(scss, (result,) => {
        const style = document.createElement('style',);
        style.innerHTML = result.text;
        getFirst('head',).appendChild(style,);
      },);
    }
  })();
  /**
   * Retrieve data from data.yml and build page from it
   */
  (async() => {
    /* add all tags as clickable items to the list element */
    const appendTags = (
      /*String[]*/ list,
      /*String*/ className,
      /*HTMLElement*/ listElement,
    ) => {
      if (! Array.isArray(list,)) {
        return;
      }
      list.sort((a, b,) => a.toLowerCase().localeCompare(b.toLowerCase(),),);
      const appendTag = (
        /* String */tag,
      ) => {
        if (! tag) {
          return;
        }
        listElement.appendChild((() => {
          const item = document.createElement('li',);
          item.setAttribute('class', className + ' filter',);
          item.setAttribute('title', 'Filter for ' + className + ' ' + tag,);
          item.appendChild(document.createTextNode(tag,),);
          return item;
        })(),);
      };
      for (const tag of list) {
        appendTag(tag, listElement, className,);
      }
    };
    const createLink = (/*String*/text, /*String*/url,) => {
      const a = document.createElement('a',);
      a.setAttribute('href', url,);
      a.appendChild(document.createTextNode(text,),);
      return a;
    };
    const data = await (async() => {
      const response = await fetch('src/data.yml',);
      /* Checks status code */
      if (! response.ok) {
        return {};
      }
      const text = await response.text();
      return YAML.parse(text,);
    })();
    const filters = {
      person: [],
      source: [],
      tag: [],
    };
    const main = document.getElementById('main',);
    const buildElement = (url, item,) => {
      const addFilter = (taglist, name,) => {
        if (taglist) {
          for (const val of taglist) {
            if (val && ! filters[name].includes(val,)) {
              filters[name].push(val,);
            }
          }
        }
      };
      /* The Element of the main list */
      const li = document.createElement('li',);
      li.setAttribute('class', 'tagged-item',);
      li.appendChild(createLink(item.name, url,),);
      /* given source add new source to global list */
      addFilter([ item.source, ], 'source',);
      /* given tags add all new tags to global list */
      addFilter(item.tags, 'tag',);
      /* given persons add all new persons to global list*/
      addFilter(item.persons, 'person',);
      /* Create the actually displayed list element */
      li.appendChild((() => {
        const tags = document.createElement('ul',);
        tags.setAttribute('class', 'filters',);
        appendTags(item.tags, 'tag', tags,);
        appendTags(item.persons, 'person', tags,);
        appendTags([ item.source, ], 'source', tags,);
        return tags;
      })(),);
      main.appendChild(li,);
    };
    const isOwn = (
      /*Object*/obj,
      /*String*/property,
    ) => obj && property && Object.prototype.hasOwnProperty.call(
      obj,
      property,
    );
    const buildFilters = () => {
      for (const type in filters) {
        if (isOwn(filters, type,)) {
          const target = document.getElementById('filters-' + type,);
          appendTags(filters[type], type, target,);
        }
      }
    };
    for (const url in data) {
      if (isOwn(data, url,)) {
        buildElement(url, data[url],);
      }
    }
    /* Build the filter lists */
    buildFilters();
    /* If the page was loaded with a hash, consider it a tag to filter for */
    if (window.location.hash) {
      window.setTimeout(
        () => {
          filterForTag(window.location.hash,);
        },
        CONSTANTS.nearInstant,
      );
    }
  })();
})();
