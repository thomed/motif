
function loadSVG(filename) {
    console.log("Loading " + filename);
    var xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        var dom = new DOMParser().parseFromString(xhttp.response, "application/xml");
        var parent = document.getElementById("pattern-src").parentElement;
        console.log(dom.rootElement);
        console.log(parent);

        parent.innerHTML = dom.rootElement.outerHTML;
        parent.children[0].id = "pattern-src";
    }

    xhttp.open("GET", "../svgs/" + filename, true);
    xhttp.send(null);
}
