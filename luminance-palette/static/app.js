function generateColorPalette() {
    // grab user input
    var hex = document.getElementById("hex").value;
    var numColors = parseInt(document.getElementById("num-colors").value);
    var degreesApart = parseInt(document.getElementById("degrees-apart").value);

    // clear previous generations
    document.getElementById("color-input-preview").innerHTML = "";
    document.getElementById("color-output").innerHTML = "";
    document.getElementById("color-output-monochromatic").innerHTML = "";
    document.getElementById("color-output-analogous").innerHTML = "";
    document.getElementById("color-output-triadic").innerHTML = "";
    document.getElementById("color-output-complementary").innerHTML = "";
    document.getElementById("color-output-tetradic").innerHTML = "";

    // convert color to oklch
    var colorObject = culori.oklch(hex);

    // Color HTML
    var colorInputPreviewHTML = generateSwatch(colorObjectToString(colorObject));
    var colorOutputHTML = "";
    var colorOutputMonochromaticHTML = "";
    var colorOutputAnalogousHTML = "";
    var colorOutputTriadicHTML = "";
    var colorOutputComplementaryHTML = "";
    var colorOutputTetradicHTML = "";

    // generate hues & create color objects from hues array, render one at a time
    var hues = generateHues(colorObject, numColors, degreesApart);
    for (let i=0; i < hues.length; i++) {
        var colorObjectClone = Object.assign({}, colorObject);
        colorObjectClone.h = hues[i];
        colorOutputHTML += generateSwatch(colorObjectToString(colorObjectClone));
    };

    // generate lightness & create color objects from lightness array, render one at a time
    var lightnesses = generateMonochrome(colorObject, 10);
    for (let i=0; i < lightnesses.length; i++) {
        var colorObjectClone = Object.assign({}, colorObject);
        colorObjectClone.l = lightnesses[i];
        colorOutputMonochromaticHTML += generateSwatch(colorObjectToString(colorObjectClone));
    };

    // analagous = 5 colors, 30 degrees apart
    var analogous = generateFromMiddle(colorObject, 5, 30);
    for (let i=0; i<analogous.length; i++) {
        var colorObjectClone = Object.assign({}, colorObject);
        colorObjectClone.h = analogous[i];
        colorOutputAnalogousHTML += generateSwatch(colorObjectToString(colorObjectClone));
    };

    // triadic = 3 colors, 120 degrees apart
    var triadic = generateFromMiddle(colorObject, 3, 120);
    for (let i=0; i<triadic.length; i++) {
        var colorObjectClone = Object.assign({}, colorObject);
        colorObjectClone.h = triadic[i];
        colorOutputTriadicHTML += generateSwatch(colorObjectToString(colorObjectClone));
    };

    // complementery = 2 colors, 180 degrees apart
    var complementary = generateHues(colorObject, 2, 180);
    for (let i=0; i<complementary.length; i++) {
        var colorObjectClone = Object.assign({}, colorObject);
        colorObjectClone.h = complementary[i];
        colorOutputComplementaryHTML += generateSwatch(colorObjectToString(colorObjectClone));
    };

    // tetradic = 4 colors, 90 degrees apart
    var tetradic = generateHues(colorObject, 4, 90);
    for (let i=0; i<tetradic.length; i++) {
        var colorObjectClone = Object.assign({}, colorObject);
        colorObjectClone.h = tetradic[i];
        colorOutputTetradicHTML += generateSwatch(colorObjectToString(colorObjectClone));
    };

    // update HTML
    document.getElementById("color-input-preview").innerHTML = colorInputPreviewHTML;
    document.getElementById("color-output").innerHTML = colorOutputHTML;
    document.getElementById("color-output-monochromatic").innerHTML = colorOutputMonochromaticHTML;
    document.getElementById("color-output-analogous").innerHTML = colorOutputAnalogousHTML;
    document.getElementById("color-output-triadic").innerHTML = colorOutputTriadicHTML;
    document.getElementById("color-output-complementary").innerHTML = colorOutputComplementaryHTML;
    document.getElementById("color-output-tetradic").innerHTML = colorOutputTetradicHTML;
};


function colorObjectToString(colorObject) {
    return `${colorObject.mode}(${colorObject.l.toFixed(2)} ${colorObject.c.toFixed(2)} ${colorObject.h.toFixed(2)})`
};


function generateSwatch(colorString) {
    return `
        <div class="color-swatch-card">
            <div class="color-swatch" style="background-color:${colorString}"></div>
            <p>${colorString}</p>
        </div>
    `;
};

function generateMonochrome(colorObject, numColors) {
    lightness = colorObject.l;
    lightnesses = [];
    lightnessDegrees = 1 / numColors;
    for (let i=0; i<numColors; i++) {
        lightness = lightness + lightnessDegrees;
        if (lightness > 1) {
            lightness = lightness - 1;
        };
        lightnesses.push(lightness);
    };
    return lightnesses.sort().reverse();
};

// tetradic = 4 colors, 90 degrees apart
function generateHues(colorObject, numColors, degreesApart) {
    // if they haven't specified degreesApart, then hues are evenly spaced
    if (isNaN(parseFloat(degreesApart))) {
        degreesApart = 360 / numColors;
    };
    // starting at the starting hue, add degreesApart until you get to 360, then loop over to zero.
    hue = colorObject.h;
    hues = [];

    for(let i = 0; i < numColors; i++) {
        hue = getValidHue(hue + Number(degreesApart));
        hues.push(hue);
    };
    return hues.sort();
};

// numColors must be odd so that the main color is in the middle
function generateFromMiddle(colorObject, numColors, degreesApart) {
    middle_hue = colorObject.h; // middle hue
    hue = getValidHue(middle_hue - ((numColors-1)/2 * degreesApart)); // start hue
    hues = [hue];
    for (let i = 0; i<numColors-1; i++) {
        hue = getValidHue(hue + degreesApart);
        hues.push(hue);
    }
    return hues;
};

function getValidHue(hue) {
    if (hue > 360) {
        return hue - 360;
    }
    else if (hue < 0) {
        return hue + 360;
    }
    else {
        return hue;
    }
};
