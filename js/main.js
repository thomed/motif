/**
 * TODO
 *    - May have to do some weird workaround or injection to maintain pattern while
 *      supporting normal svg importing.
 *    - Can also just store each svg individually, which is probably the wise thing to do.
 *        - Maintain a master list of what's available and the do a request for each svg.
 *        - This would be easier to maintain.
 */


/**
 * The vue for the current display and its controls
 */
var patternContainer = new Vue({
    el: "#display-container",
    data: {
        height: 'auto',    // the height of the container
        length: 100,       // the length of a side of the pattern
        nx: 3,             // number of times pattern repeats horizontally
        ny: 3,             // number of times pattern repeats vertically
        pattern: "g1",     // the name of the current pattern
        scale: 1,          // scale of pattern
        width: 'auto'      // the width of the container
    },

    methods: {
        // update pattern repetition on container resize
        handleResize(event) {
            this.width = document.getElementById("pattern-container").clientWidth;
            this.height = document.getElementById("pattern-container").clientHeight;
            this.nx = this.width / (this.length * this.scale);
            this.ny = this.height / (this.length * this.scale);
        },

        setPattern(name) {
            console.log("Setting pattern to: " + name);
            this.toggle();
        },

        // test to toggle svg pattern
        toggle() {
            if (this.pattern == "g2") {
                this.pattern = "g1";
            } else {
                this.pattern = "g2";
            }
        }
    },

    mounted: function() {
        this.handleResize()
        window.addEventListener('resize', this.handleResize)
    }
});

/**
 * The view for the list of available patterns
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
            console.log(p.getElementsByTagName("file")[0].textContent);
            listContainer.patterns.push(p.getElementsByTagName("file")[0].textContent);
        }
    }

    xhttp.open("GET", "../svgs/patterns.xml", true);
    xhttp.send(null);
});



