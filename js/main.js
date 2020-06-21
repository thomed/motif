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
        width: 'auto'      // the width of the container
    },

    methods: {
        // update pattern repetition on container resize
        handleResize(event) {
            this.width = document.getElementById("pattern-container").clientWidth;
            this.height = document.getElementById("pattern-container").clientHeight;
            this.nx = this.width / (this.pwidth * this.scale);
            this.ny = this.height / (this.pheight * this.scale);
        },

        setPattern(name) {
            loadSVG(name);
            this.scale = 1;
        }
    },

    mounted: function() {
        this.handleResize();
        window.addEventListener('resize', this.handleResize);
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
            // console.log(p.getElementsByTagName("file")[0].textContent);
            listContainer.patterns.push(p.getElementsByTagName("file")[0].textContent);
        }
    }

    xhttp.open("GET", "../svgs/patterns.xml", true);
    xhttp.send(null);
});



