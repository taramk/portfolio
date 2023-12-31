
EXAMPLE FOR HUE SHIFT

https://codepen.io/georgedoescode/pen/gOGaOwm

function adjustHue(val) {
  if (val < 0) val += Math.ceil(-val / 360) * 360;
  return val % 360;
}

function map(n, start1, end1, start2, end2) {
  return ((n - start1) / (end1 - start1)) * (end2 - start2) + start2;
}

function createHueShiftPalette(opts) {
  const { base, minLightness, maxLightness, hueStep } = opts;

  const palette = [base];

  for (let i = 1; i < 5; i++) {
    const hueDark = adjustHue(base.h - hueStep * i);
    const hueLight = adjustHue(base.h + hueStep * i);
    const lightnessDark = map(i, 0, 4, base.l, minLightness);
    const lightnessLight = map(i, 0, 4, base.l, maxLightness);
    const chroma = base.c;

    palette.push({
      l: lightnessDark,
      c: chroma,
      h: hueDark,
      mode: "lch"
    });

    palette.unshift({
      l: lightnessLight,
      c: chroma,
      h: hueLight,
      mode: "lch"
    });
  }

  return palette;
}


Pass a base color, min/max lightness, and hue step parameters to a createHueShiftPalette function. The min/max lightness values determine how dark/light our palette will be at either extreme. The step controls how much the hue will shift at each color.
Store the base color in an array. In the illustration above, this is the middle color. 
Create a loop that iterates four times. Each iteration, add a darker shade to the start of the array and a lighter tint to the end. Here, we use map to calculate our lightness values — a function that takes a number that usually exists in one range and converts it to another — and increase or decrease the hue using our hueStep variable. Again, adjustHue is used here to ensure all hue values are between 0 and 360.
Return the palette! 







------------------------------------------------------------------------

    1. What this app do, what kind of problem it solves
    2. What tech did you use, which language, framework, database, what did you used to develop front-end part,
    3. List key functionalities, show some use examples if possible
    4. Write some acknowledges, if you used some data from external sources, or if you have been inspired by some other site, or you maybe based your solution on some literature or scientific papers
    5. Write short summary, who you are, and that you did it for CS50

# Luminance Palette
Final project for CS50

## Why?
I wanted a better way to programmatically generate color schemes. Colors are just math to a computer, so it should be easy, but previously there was not a good way to generate colors that have the same perceptual lightness. For example, two colors with the same "L" value in HSL might appear much lighter or darker than each other.

I learned about the color space called "OKLCH", which is meant to address this issue. Colors are formatted as Lightness, Chroma (Saturation), and Hue. Any colors that have the same Lightness value appear to have roughly the same amount of lightness/brightness.

OKLCH is supported as a color space in CSS, so you can just go ahead and use it which is pretty cool.

## Tech
Because this is an interactive webapp that doesn't need a backend, Javascript was best suited for my purposes. I tried to limit my dependencies, and ultimately chose two color libraries:

1. culori
2. coloris

Culori converts colors from hex to oklch and back. I was initially hoping to do this conversion myself, but it's pretty complicated. Coloris provides the color picker. The initial version only had oklch values, but I quickly realized it's much easier for the user to start with a hex code or a color chosen from a picker and then iterate on it from there.

## Functionality
With my app, what you see is what you get. You can choose a color by entering a hex code, dragging around the color picker, or updating the LCH values. From there, a set of palettes is generated in realtime.