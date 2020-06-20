
function loadSVG(filename) {
    console.log("Loading " + filename);
    var xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        var dom = new DOMParser().parseFromString(xhttp.response, "application/xml");
        console.log(dom);
//        var patterns = dom.getElementsByTagName("pattern");
//        for (let p of patterns){ 
//            console.log(p.getElementsByTagName("file")[0].textContent);
//            listContainer.patterns.push(p.getElementsByTagName("file")[0].textContent);
//        }
    }

    xhttp.open("GET", "../svgs/" + filename, true);
    xhttp.send(null);
}
