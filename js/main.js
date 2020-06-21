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
            var svg = document.getElementById("pattern-src");
            var styles = svg.getElementsByTagName("style")[0];

            // if no style tag then return
            if (typeof styles == 'undefined') {
                return;
            }

            // CSS regexes
            var selectorRegex = /([#.\w\-]+)\s*{/g;
            var propertyRegex = /([\w\-]+)\s*:\s*(.+);/g;
            var propertyNumberGroup = /\s*([\d]+).*/g;
            var propertyHexColorGroup = /\s*(#[\da-fA-F]{6})/g;

            // parse the CSS
            var styleLines = styles.firstChild.data.split('\n');
            for (i = 0; i < styleLines.length; i ++) {
                
                // ignore empty lines
                var line = styleLines[i].trim();
                if (line.length == 0 ){ continue; }

                // find CSS selector name
                selectorRegex.lastIndex = 0;
                var selectorMatch = selectorRegex.exec(line);
                if (selectorMatch.length > 1) {
                    var selectorName = selectorMatch[1];
                    this.styles[selectorName] = {};

                    // evaluate the properties in this selector's group
                    while (line[0] != '}') {

                        // skip empty
                        line = styleLines[++i].trim();
                        if (line.length == 0) { continue; }

                        // reset regex
                        propertyRegex.lastIndex = 0;
                        propertyHexColorGroup.lastIndex = 0;
                        propertyNumberGroup.lastIndex = 0;

                        // match for property name and raw value on current line
                        var propertyMatch = propertyRegex.exec(line);
                        if (propertyMatch == null || propertyMatch.length < 2) { continue; }
                        var propertyName = propertyMatch[1];
                        var propertyValue = propertyMatch[2];

                        // find what type of property value this is any perform and changes needed to what was parses
                        var propertyValueTypeMatch;
                        var propertyValueType;
                        if ((propertyValueTypeMatch = propertyHexColorGroup.exec(propertyValue)) != null) {
                            propertyValueType = "hexcolor";
                            propertyValue = propertyValueTypeMatch[1];
                        } else if ((propertyValueTypeMatch = propertyNumberGroup.exec(propertyValue)) != null) {
                            propertyValueType = "number";
                            propertyValue = propertyValueTypeMatch[1];
                        }

                        // save properties
                        var obj = {};
                        obj.defaultValue = propertyValue;
                        obj.value = propertyValue;
                        obj.valueType = propertyValueType;
                        this.styles[selectorName][propertyName] = obj;
                    }
                }
            }

            console.log(this.styles);
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



