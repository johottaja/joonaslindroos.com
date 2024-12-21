const bgdiv = document.getElementById("image-container");
const parallax1image = document.getElementById("bg-parallax1");
const parallax2image = document.getElementById("bg-parallax2");
const parallax3farMountains = document.getElementById("bg-parallax-far-mountains");
const headerText = document.getElementById("header-text");
const secondaryHeading = document.getElementById("secondary-heading");
const coldtext = document.getElementById("cold-text");
const header = document.querySelector("header");
const headerWrapper = document.getElementById("header-wrapper")
const scrollAnimLen = window.innerHeight; //in px
const parallax1Amount = 50.0; //in px
const parallax2Amount = 70.0; //in px

let mousePos = {x: 0.0, y: 0.0};

const parallaxes = [];

function updateParallaxes() {
	parallaxes.forEach(parallax => {
		parallax.update(mousePos);
	})
}


function calculateOpacity() {
    if (window.scrollY < scrollAnimLen) {
        return (1 - (window.scrollY / scrollAnimLen))
    } else {
        return 0
    }
}

window.onscroll = (e) => {
    opacity = calculateOpacity();
    header.style.opacity = opacity;

    if (window.scrollY > scrollAnimLen) {
        headerWrapper.style.display = "none";
    } else {
        headerWrapper.style.display = "block";
    }

    updateParallaxes();
}

window.onload = (event) => {
	parallaxes.push(new Parallax(parallax1image, scrollAnimLen, {x: 10, y: 70.0}, {x: 10.0, y: 0.0}, "px"))
	parallaxes.push(new Parallax(parallax2image, scrollAnimLen, {x: 5, y: 50.0}, {x: 15.0, y: 30.0}, "px"))
	parallaxes.push(new Parallax(coldtext, scrollAnimLen, {x: 0, y: 50.0}, {x: 0.0, y: -50.0}, "px"))
	parallaxes.push(new Parallax(headerText, scrollAnimLen, {x: 10, y: -50.0}, {x: 0.0, y: 50.0}, "px"))
	parallaxes.push(new Parallax(secondaryHeading, scrollAnimLen, {x: -10, y: -50.0}, {x: 0.0, y: 50.0}, "px"))
	parallaxes.push(new Parallax(parallax3farMountains, scrollAnimLen, {x: 2, y: 10.0}, {x: -5.0, y: 50.0}, "px"))

	updateParallaxes();
}

window.onresize = (event) => {
    parallaxes.forEach(parallax => {
        parallax.updateScrollLength(window.innerHeight)
    });
}

window.onmousemove = (event) => {
	mousePos = {x: event.clientX, y: event.clientY};
    updateParallaxes();
}