window.addEventListener('DOMContentLoaded',init,false);
            
function init() {
    alert('HELLO! Welcome to my website :))');
    var buttons = document.getElementsByTagName("button")
buttons[0].addEventListener('click', changeColor,false)
buttons[1].addEventListener('click', changeColor2,false)
}

function changeColor() {
var colorMe1 = document.getElementById("colorToggle") 
{colorMe1.style.backgroundColor = "skyblue";
}}

function changeColor2() {
 var pars = document.getElementsByTagName('p')
    for (var i = 0, length = pars.length; i < length; i++) {
        pars[i].style.backgroundColor = "pink";
        pars[i].style.fontWeight="bold";
}}

// COMMENTS TO SELF: 
// When writing JavaScript as a separate file, you need to be explicit about when and how events must happen
// Set up event listeners that listen for events like a web page loading
// First triggered function, 'function init()' (other event listeners go insde this function)

// Each 'button' is kept in a <div> element
// ID in the <p> links to the .js file


