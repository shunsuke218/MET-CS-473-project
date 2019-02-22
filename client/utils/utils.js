/*
      give this: http://localhost:5005/#/family-tree
      return this: http://localhost:5005/
      */
function getSiteRootFromUrl(url) {
    var parser = document.createElement('a');
    parser.href = url;
    console.log(parser.protocol);
    console.log(parser.host);

    let siteRoot = parser.protocol + "//" + parser.host;
    return siteRoot;
}

export {getSiteRootFromUrl}