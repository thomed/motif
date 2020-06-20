var patternContainer = new Vue({
    el: "#main-content",
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

document.addEventListener('DOMContentLoaded', function() {

});



