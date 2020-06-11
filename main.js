(() => {
    /**
     * Set all Element's style to display:none if they don't have the given tag
     * @param {String} tag
     * @returns {void}
     */
    const filterForTag = (/* String */ tag) => {
        tag = tag.replace(/ /g, '_').toLowerCase().replace(/^#/, '');
        for (let li of document.getElementById('main').children) {
            if (li.nodeName === 'LI') {
                li.setAttribute('style', 'display:none');
                for (let tagEl of li.getElementsByTagName('li')) {
                    if (!tag || tagEl.innerText.replace(/ /g, '_').toLowerCase() === tag) {
                        li.removeAttribute('style');
                        break;
                    }
                }
            }
        }
        window.location.hash = tag;
    }
    /* On click on a list element filter for it's text content */
    document.getElementsByTagName('body')[0].addEventListener('click', function (/* ClickEvent */ e) {
        e = e || event || window.event;
        if (e.target.nodeName === 'LI' && e.target.innerHTML === e.target.innerText) {
            filterForTag(e.target.innerText);
        }
    });
    /**
     * If the window has a hash change event(i.e. reacts to #abc -> #bcd), filter when it happens
     */
    if ("onhashchange" in window) {
        window.onhashchange = () => filterForTag(window.location.hash);
    }
    /**
     * Retrieve data from data.yml and build page from it
     */
    (() => {
        /* add all tags as clickable items to the list element */
        const appendTags = (/*String[]*/ list, /*String*/ className, /*HTMLElement*/ listElement) => {
            if (!Array.isArray(list)) {
                return;
            }
            list.sort(function (a, b) {
                return (a.toLowerCase()).localeCompare(b.toLowerCase());
            });
            for (const tag of list) {
                if (!tag) {
                    continue;
                }
                listElement.appendChild((() => {
                    let item = document.createElement('li');
                    item.setAttribute('class', className + ' filter');
                    item.appendChild(document.createTextNode(tag));
                    return item;
                })());
            }
        };
        const createLink = (/*String*/text, /*String*/url) => {
                const a = document.createElement('a');
                a.setAttribute('href', url);
                a.appendChild(document.createTextNode(text));
                return a;
        }
        const response = await fetch('data.yml');
        /* Checks status code */
        if (!response.ok) {
            return;
        }
        const text = await response.text();
        const data = YAML.parse(text);
        const filters = {person: [], source: [], tag: []};
        for (const url in data) {
            /* The Element of the main list */
            const li = document.createElement('li');
            li.appendChild(createLink(data[url].name, url));
            /* given source add new source to global list */
            if (data[url].source && !filters.source.includes(data[url].source)) {
                filters.source.push(data[url].source);
            }
            /* given tags add all new tags to global list */
            if (data[url].tags) {
                for (const val of data[url].tags) {
                    if (val && !filters.tag.includes(val)) {
                        filters.tag.push(val);
                    }
                }
            }
            /* given persons add all new persons to global list*/
            if (data[url].persons) {
                for (const val of data[url].persons) {
                    if (val && filters.person.indexOf(val) === -1) {
                        filters.person.push(val);
                    }
                }
            }
            /* Create the actually displayed list element */
            li.appendChild((() => {
                let tags = document.createElement('ul');
                appendTags(data[url].tags, 'tag', tags);
                appendTags(data[url].persons, 'person', tags);
                appendTags([data[url].source], 'source', tags);
                return tags;
            })());
            document.getElementById('main').appendChild(li);
        }
        /* Build the filter lists */
        for (const type in filters) {
            for (const name of filters[type]) {
                document.getElementById('filters-' + type).appendChild((() => {
                    let item = document.createElement('li');
                    item.setAttribute('class', type + ' filter');
                    item.appendChild(document.createTextNode(name));
                    return item;
                })());
            }
        }
        /* If the page was loaded with a hash, consider it a tag to filter for */
        if (window.location.hash) {
            window.setTimeout(
                () => {
                    filterForTag(window.location.hash);
                },
                1
            );
        }
    })();
})();
