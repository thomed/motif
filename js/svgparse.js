
function loadSVG(filename) {
    console.log("Loading " + filename);
    var xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        var dom = new DOMParser().parseFromString(xhttp.response, "application/xml");
        var parent = document.getElementById("pattern-src").parentElement;

//        var patternWidth = "(\d+)"

        console.log(dom.rootElement);
        console.log(parent);

        parent.innerHTML = dom.rootElement.outerHTML;
        parent.children[0].id = "pattern-src";

        //var patternWidth = parent.children[0].getAttribute("width").matchAll("\d+");
        var patternWidth = parent.children[0].getAttribute("width").match(/(\d+)/g)[0];
        var patternHeight = parent.children[0].getAttribute("height").match(/(\d+)/g)[0];
        patternContainer.pwidth = patternWidth;
        patternContainer.pheight = patternHeight;

        patternContainer.handleResize();
        console.log(patternWidth);

        //patternContainer.pwidth = parent.children[0].getAttribute("width");
//        console.log(parent.children[0].getAttribute("width"));
    }

    xhttp.open("GET", "../svgs/" + filename, true);
    xhttp.send(null);
}
