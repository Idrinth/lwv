(() => {
    document.getElementsByTagName('body')[0].addEventListener('click', function(e) {
        e = e||event||window.event;
        if (e.target.nodeName === 'LI' && e.target.innerHTML === e.target.innerText) {
            filterForTag(e.target.innerText);
        }
    });
    function filterForTag(tag) {
        tag = tag.replace(/ /g, '_').toLowerCase().replace(/^#/, '');
        for(let li of document.getElementById('main').children) {
            if (li.nodeName === 'LI') {
                li.setAttribute('style', 'display:none');
                for (let tagEl of li.getElementsByTagName('li')) {
                    if(!tag || tagEl.innerText.replace(/ /g, '_').toLowerCase() === tag) {
                        li.removeAttribute('style');
                        break;
                    }
                }
            }
        }
        window.location.hash = tag;
    }
    if ("onhashchange" in window) {
        window.onhashchange = () => filterForTag(window.location.hash);
    }
    let request = new XMLHttpRequest();
    request.onreadystatechange = () => {
        if(request.readyState !== 4 || request.status !== 200) {
            return;
        }
        const response = typeof request.response === 'string' ? YAML.parse(request.response) : request.response;
        const filters = {person: [], source: [], tag: []};
        for(const url in response) {
            let li = document.createElement('li');
            li.appendChild((() => {
                let a = document.createElement('a');
                a.setAttribute('href', url);
                a.appendChild(document.createTextNode(response[url].name));
                return a;
            })());
            if (response[url].source && filters.source.indexOf(response[url].source) === -1) {
                filters.source.push(response[url].source);
            }
            if (response[url].tags) {
                for (const val of response[url].tags) {
                    if (val && filters.tag.indexOf(val) === -1) {
                        filters.tag.push(val);
                    }
                }
            }
            if (response[url].persons) {
                for (const val of response[url].persons) {
                    if (val && filters.person.indexOf(val) === -1) {
                        filters.person.push(val);
                    }
                }
            }
            li.appendChild((() => {
                const appendElements = (list, className, listElement) => {
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
                            item.setAttribute('class', className+' filter');
                            item.appendChild(document.createTextNode(tag));
                            return item;
                        })());
                    }
                };
                let tags = document.createElement('ul');
                appendElements(response[url].tags, 'tag', tags);
                appendElements(response[url].persons, 'person', tags);
                appendElements([response[url].source], 'source', tags);
                return tags;
            })());
            document.getElementById('main').appendChild(li);
        }
        for (const type in filters) {
            for (const name of filters[type]) {
                document.getElementById('filters-'+type).appendChild((() => {
                    let item = document.createElement('li');
                    item.setAttribute('class', type+' filter');
                    item.appendChild(document.createTextNode(name));
                    return item;
                })());
            }
        }
        if (window.location.hash) {
            window.setTimeout(
                () => {
                    filterForTag(window.location.hash);
                },
                1
            );
        }
    }
    request.open('get', 'data.yml', true);
    request.send();
})();
