/**
 * The vue for the current display and its controls
 */
var patternContainer = new Vue({
    el: "#display-container",
    data: {
        height: 'auto',    // the height of the container
        pwidth: 100,       // the width of the pattern
        pheight: 100,      // the height of the pattern
        nx: 3,             // number of times pattern repeats horizontally
        ny: 3,             // number of times pattern repeats vertically
        pattern: "g1",     // the name of the current pattern
        scale: 1,          // scale of pattern
        width: 'auto',     // the width of the container
        styles: {}         // model for svg styles
    },

    methods: {
        // update pattern repetition on container resize
        handleResize(event) {
            this.width = document.getElementById("pattern-container").clientWidth;
            this.height = document.getElementById("pattern-container").clientHeight;
            this.nx = this.width / (this.pwidth * this.scale);
            this.ny = this.height / (this.pheight * this.scale);
        },

        // load svg 'name' as the pattern
        setPattern(name) {
            loadSVG(name);
            this.scale = 1;
        },

        // parse svg style tag and bind to values
        parseStyles() {
            this.styles = {};
            this.styles.rootVars = [];
            this.styles.main = '';
            var svg = document.getElementById("pattern-src");
            var styles = svg.getElementsByTagName("style")[0];

            // if no style tag then return
            if (typeof styles == 'undefined') { return; }

            // CSS regexes
            var propertyRegex = /([\w\-]+)\s*:\s*(.+);/g;
            var propertyNumberGroup = /\s*([\d]+).*/g;
            var propertyHexColorGroup = /\s*(#[\da-fA-F]{6})/g;

            // the CSS text
            var styleText = styles.firstChild.data;

            // find :root (chosen convention that it should be first selector)
            var rootParsed = false;
            var styleLines = styles.firstChild.data.split('\n');
            for (i = 0; i < styleLines.length; i++) {
                var line = styleLines[i];
                if (line.trim().length == 0) { continue; }

                // found :root start
                if (!rootParsed && line.trim().substring(0, 5) == ":root") {
                    // parse properties until closing of :root
                    while (line.trim()[0] !=  "}") {
                        propertyRegex.lastIndex = 0;
                        propertyNumberGroup.lastIndex = 0;
                        propertyHexColorGroup.lastIndex = 0;
                        line = styleLines[++i];

                        var propertyMatch = propertyRegex.exec(line);
                        if (propertyMatch == null) { break; }

                        var propertyName = propertyMatch[1];
                        var propertyValue = propertyMatch[2];

                        // find what type of property value this is and perform any changes needed to what was parsed
                        var propertyValueType;
                        var propertyValueTypeMatch;
                        if ((propertyValueTypeMatch = propertyHexColorGroup.exec(propertyValue)) != null) {
                            propertyValueType = "hexcolor";
                            propertyValue = propertyValueTypeMatch[1];
//                            propertyValue = "#ff0000";
                        } else if ((propertyValueTypeMatch = propertyNumberGroup.exec(propertyValue)) != null) {
                            propertyValueType = "number";
                            propertyValue = propertyValueTypeMatch[1];
//                            propertyValue = "20";
                        }

                        // save variables
                        var obj = {};
                        obj.propertyName = propertyName;
                        obj.defaultValue = propertyValue;
                        obj.value = propertyValue;
                        obj.valueType = propertyValueType;
                        this.styles.rootVars.push(obj);
                    }

//                    this.styles.rootVars.forEach(element => {
//                        console.log(element.propertyName + ": " + element.value);
//                        console.log(element);
//                    });

                    rootParsed = true;
                } else if (rootParsed) {
                    // save rest of style tag
                    this.styles.main += line + "\n";
                }

            }

            console.log(this.styles.main);
        },

        // Generate inputs and bind to style values. Inject into svg style tag.
        bindStyles() {
            // clear existing generated controls
            document.getElementById("generated-controls").innerHTML = '';
            var innerStyleString = '';

            if (this.styles.rootVars.length == 0) {
                console.log("No root vars found in SVG style. Leaving as is.");
                return;
            }

            var rootStr = 'root: {\n';
            var styleTag = document.getElementById("pattern-src").getElementsByTagName("style")[0];
            console.log(styleTag);

            // set root variable
            this.styles.rootVars.forEach(v => {
//                console.log(v);
//                if (v.valueType == "hexcolor") {
//                    v.value = '#0000ff';
//                } else {
//                    v.value = '5';
//                }
                document.getElementById("pattern-src").style.setProperty(v.propertyName, v.value);
            });

        }
    },

    mounted: function() {
        this.handleResize();
        window.addEventListener('resize', this.handleResize);
    }
});

/**
 * The vue for the list of available patterns
 */
var listContainer = new Vue({
    el: "#list-container",
    data: {
        patterns: []
    }
});

document.addEventListener('DOMContentLoaded', function() {

    // load patterns from xml file
    var xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        var dom = new DOMParser().parseFromString(xhttp.response, "application/xml");
        var patterns = dom.getElementsByTagName("pattern");
        for (let p of patterns){ 
            // console.log(p.getElementsByTagName("file")[0].textContent);
            listContainer.patterns.push(p.getElementsByTagName("file")[0].textContent);
        }
    }

    xhttp.open("GET", "../svgs/patterns.xml", true);
    xhttp.send(null);
});

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
        patternContainer.parseStyles();
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

