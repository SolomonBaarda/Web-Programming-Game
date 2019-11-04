/**
This is a script that contains useful utilities and methods. It also contains some game constants used in 
the initialisation and running of other scripts.
*/

// Set number of updates per second
const TICKS_PER_SECOND = 60;
// Set the number of pixels in every tile 
const PIXELS_PER_TILE = 32;

// Function that ensures a value is within the given parameters. 
function Clamp(value, min, max) {
    if (value < min) {
        value = min;
    }
    if (value > max) {
        value = max;
    }

    return value;
}

// Function that returns true if two rectangles are colliding 
function Intersects(aX, aY, aWidth, aHeight, bX, bY, bWidth, bHeight) {
    // Visit https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection for more help
    if (aX < bX + bWidth && aX + aWidth > bX && aY < bY + bHeight && aY + aHeight > bY) {
        // There is a collision
        return true;
    }
    return false;
}


