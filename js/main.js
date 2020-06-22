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
//            var selectorRegex = /([#.\w\-]+)\s*{/g;
//            var rootRegex = /:root\s*{\s+(--[\w-]+\s*:\s*[#\w\d]+;\s+)*}/g;
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
//                    console.log(line);

                    // parse properties until closing of :root
                    while (line.trim()[0] !=  "}") {
                        propertyRegex.lastIndex = 0;
                        propertyNumberGroup.lastIndex = 0;
                        propertyHexColorGroup.lastIndex = 0;
                        line = styleLines[++i];
//                        console.log(line);

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
                            propertyValue = "#ff0000";
                        } else if ((propertyValueTypeMatch = propertyNumberGroup.exec(propertyValue)) != null) {
                            propertyValueType = "number";
                            propertyValue = propertyValueTypeMatch[1];
                            propertyValue = "20";
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
            // TODO
            // Copy the remainder of the style string and save so that
            // it can be appended after the root


        },

        // Generate inputs and bind to style values. Inject into svg style tag.
        bindStyles() {
            // clear existing generated controls
            document.getElementById("generated-controls").innerHTML = '';

            var innerStyleString = '';
            var selectors = Object.keys(this.styles);
            for (sel of selectors) {
                var current = this.styles[sel];
                var properties = Object.entries(current);
                console.log("Binding properties of '" + sel + "'...");

                innerStyleString += sel + ' {\n';

                // bind each property to an object value
                for (prop of properties) {
                    var propName = prop[0];
                    var propContents = prop[1];
                    var objectBindName = "patternContainer.styles[\"" + sel + "\"][\"" + propName + "\"].value";
                    console.log("Property Name: " + propName);
                    console.log("Property Value: " + propContents.value);

                    switch(propContents.valueType) {
                        // for numbers, generate a slider and bind to the value
                        case "number":
                            // console.log("number");
                            innerStyleString += "\t" + propName + ":{{ " + objectBindName + " }};\n";
                            break;
                        case "hexcolor":
                            innerStyleString += "\t" +  propName + ":{{ " + objectBindName + " }};\n";
                            break;
                        default:
                    }

                }

                innerStyleString += "}\n\n";

            }

            console.log("Style String:\n" + innerStyleString);

            var svg = document.getElementById("pattern-src");
            var styles = svg.getElementsByTagName("style")[0];
            console.log(styles);
            //styles.firstChild = innerStyleString;
            //styles.innerHTML = innerStyleString;
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



