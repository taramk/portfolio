const defaultColor = "#3F9A46";
let isUpdatingFromLCH = false;

document.addEventListener("DOMContentLoaded", () => {
    Coloris({
        inline: true,
        parent: '#hex-picker',
        defaultColor: defaultColor,
        swatches: [
            '#2a9d8f',
            '#e9c46a',
            'rgb(244,162,97)',
            '#e76f51',
            '#d62828',
            'navy',
            '#07b',
            '#0096c7',
            '#00b4d8',
            'rgba(0,119,182)'
        ],
        el: '#hex',
        wrap: false,
        themeMode: 'light',
        alpha: false,
        format: 'hex'
    });

    // add event listeners to color picker and LCH inputs
    document.addEventListener('coloris:pick', event => {
        handleColorPick(event.detail.color);
    });
    const inputs = document.querySelectorAll('[id^="input-"]');
    inputs.forEach(input => {
        input.addEventListener("input", handleLCHInput);
    });

    // when DOM loads, update hex and LCH inputs & generate palettes
    updateLCHInputsFromHex(defaultColor);
    console.log(defaultColor);
    updatePalettes();
});


// when new color is picked in the color picker, update hex & LCH inputs & regenerate palettes
function handleColorPick(hex) {
    try {
        updateLCHInputsFromHex(hex.slice(1));
    } catch (ignore) {
        console.log("could not convert " + hex);
    }
    console.log("selecting color " + hex);
    updatePalettes();
}


// when any of the LCH values change, regenerate palettes & update hex
function handleLCHInput() {
    isUpdatingFromLCH = true;
    updatePalettes();
    updateHexFromLCHInputs();
    isUpdatingFromLCH = false;
}


function updateLCHInputsFromHex(hex) {
    if (!isUpdatingFromLCH) {
        var colorObject = culori.oklch(hex);

        const keys = ["l", "c", "h"];
        for (key of keys) {
            var input = document.getElementById("input-" + key);
            if (key == "h") {
                input.value = colorObject[key].toFixed();
            } else {
                input.value = colorObject[key].toFixed(2);
            }
        }
    }
    console.log("updating LCH inputs to " + JSON.stringify(colorObject));
}


// update both the hidden hex input and the visible one
function updateHexFromLCHInputs() {
    var l_val = Number(document.getElementById("input-l").value);
    var c_val = Number(document.getElementById("input-c").value);
    var h_val = Number(document.getElementById("input-h").value);

    var colorObject = {l:l_val, c:c_val, h:h_val, mode:"oklch"};
    
    var rgb = culori.formatRgb(colorObject);
    console.log("rgb: " + rgb);
    var hex = culori.formatHex(rgb);

    // update color picker hex & trigger event to update picker UI
    var colorValueInput = document.getElementById("clr-color-value");
    colorValueInput.value = hex;
    var event = new Event('change');
    colorValueInput.dispatchEvent(event);
}


// if L, C, or H are updated, create new palettes
function updatePalettes() {
    // 1. take inputs and convert them to a color object
    var l_val = Number(document.getElementById("input-l").value);
    var c_val = Number(document.getElementById("input-c").value);
    var h_val = Number(document.getElementById("input-h").value);

    var colorObject = {l:l_val, c:c_val, h:h_val, mode:"oklch"};

    // 2. clear existing palette & swatch HTML
    const palettesContainer = document.getElementById('palettesContainer');
    const previewSwatchContainer = document.getElementById('previewSwatchContainer');
    palettesContainer.innerHTML = "";
    previewSwatchContainer.innerHTML = "";

    // 3. use new color object to generate palettes
    var palettes = formatPaletteStrings(createPalettes(colorObject));
    for (const paletteKey of Object.keys(palettes)) {
        const palette = palettes[paletteKey];
        const paletteHTML = createPaletteHTML(palette, paletteKey); // Use the palette key as the title
        palettesContainer.appendChild(paletteHTML);
    }

    // 4. update input swatch
    var colorInputPreviewHTML = createColorSwatch(formatColorObjectToString(colorObject));
    previewSwatchContainer.appendChild(colorInputPreviewHTML);    
}


function getValidHue(hue) {
    return (hue + 360) % 360;
}


function createPalettes(baseColor) {
    const targetHueSteps = {
        analogous: [-30, 0, 30],
        triadic: [0, 120, 240],
        tetradic: [0, 90, 180, 270],
        complementary: [0, 180],
        splitComplementary: [0, 150, 210],
        evenlySpaced: [0, 36, 72, 108, 144, 180, 216, 252, 288, 324]
    };
    const hueShift = [-48, -36, -24, -12, 0, 12, 24, 36, 48];
    const monochrome = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.99].sort().reverse();
    const palettes = {};
    // for each key, map the values by adding the step to the base color.
    for (const type of Object.keys(targetHueSteps)) {
        palettes[type] = targetHueSteps[type].map((step) => ({
            l: baseColor.l,
            c: baseColor.c,
            h: getValidHue(baseColor.h + step),
            mode: "oklch"
        }));
    }
    // note: this doesn't include the actual color you selected, just other evenly spaced lightnesses.
    for (step of monochrome) {
        palettes["monochrome"] = monochrome.map((step) => ({
            l: step,
            c: baseColor.c,
            h: baseColor.h,
            mode: "oklch"
        }));
    }
    palettes["hueShift"] = [];
    for (let i = 0; i < hueShift.length; i++) {
        palettes["hueShift"].push({
            l: monochrome[i],
            c: baseColor.c,
            h: getValidHue(baseColor.h + hueShift[i]),
            mode: "oklch"
        });
    }

    return palettes;
};


function formatPaletteStrings(palettes) {
    const formattedPalettes = {};
    for (const type of Object.keys(palettes)) {
        formattedPalettes[type] = palettes[type].map(colorObject => formatColorObjectToString(colorObject));
    }
    return formattedPalettes;
};


function formatColorObjectToString(colorObject) {
    return `${colorObject.mode}(${colorObject.l.toFixed(2)} ${colorObject.c.toFixed(2)} ${colorObject.h.toFixed(2)})`;
}


function createColorSwatch(colorString) {
    const swatch = document.createElement('div');
    const colorDiv = document.createElement('div');
    const p = document.createElement('p');

    swatch.classList.add('color-swatch-card');
    colorDiv.style.backgroundColor = colorString;
    colorDiv.classList.add('color-swatch');

    swatch.appendChild(colorDiv);
    swatch.appendChild(p).innerHTML = colorString;
    return swatch;
};


function createPaletteHTML(palette, title) {
    const paletteContainer = document.createElement('div');
    paletteContainer.classList.add('palette');
  
    // create and append title
    const titleInTitleCase = title.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
    const titleElement = document.createElement('h2');
    titleElement.textContent = titleInTitleCase;
    paletteContainer.appendChild(titleElement);
  
    // Loop through each color in the palette and create swatches
    for (const colorObject of palette) {
      const swatch = createColorSwatch(colorObject);
      paletteContainer.appendChild(swatch);
    }
    return paletteContainer;
};