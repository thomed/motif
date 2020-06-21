
function loadSVG(filename) {

    // load SVG data from file in svgs path
    var xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        // svg xml
        var dom = new DOMParser().parseFromString(xhttp.response, "application/xml");

        // parent container for svg in page
        var parent = document.getElementById("pattern-src").parentElement;

        // replace existing svg with the new one
        parent.innerHTML = dom.rootElement.outerHTML;
        parent.children[0].id = "pattern-src";

        // some svgs will have e.g. '32px' for attribute so need to strip to just nums
        var patternWidth = parent.children[0].getAttribute("width").match(/(\d+)/g)[0];
        var patternHeight = parent.children[0].getAttribute("height").match(/(\d+)/g)[0];
        patternContainer.pwidth = patternWidth;
        patternContainer.pheight = patternHeight;

        patternContainer.handleResize();
        patternContainer.bindStyles();
    }

    xhttp.open("GET", "../svgs/" + filename, true);
    xhttp.send(null);
}

function exportSVG() {
    // get pattern svg and encode as base64 for download
    var svg = document.getElementById("pattern-src");
    var svgData = new XMLSerializer().serializeToString(svg);
    var svgB64 = window.btoa(svgData);
    var dataURI = "data:image/svg+xml;base64," + svgB64;

//    console.log(svg);
//    console.log(svgData);
//    console.log(svgB64);
    downloadBase64File("pattern.svg", dataURI);
}

function downloadBase64File(filename, uri) {
    var link = document.createElement("a");
    link.download = filename;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
}
