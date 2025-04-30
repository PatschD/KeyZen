export const Alphabet = [
	'a',
	'b',
	'c',
	'd',
	'e',
	'f',
	'g',
	'h',
	'i',
	'j',
	'k',
	'l',
	'm',
	'n',
	'o',
	'p',
	'q',
	'r',
	's',
	't',
	'o',
	'v',
	'w',
	'x',
	'y',
	'z'
];

export function getColorLetters(c: { total: number; correct: number }): string {
	// --- Customization ---
	const mutedSaturation = 70; // Saturation percentage (0-100)
	const mutedLightness = 75; // Lightness percentage (0-100)
	const alphaValue = 0.8; // Opacity level (0.0 - 1.0)
	const minRatioThreshold = 80; // Ratios below this are treated AS this value. This value maps to Red (Hue 0).
	const maxRatio = 100; // Ratios at this value map to Green (Hue 120).

	// Define the neutral gray using HSL components for consistent alpha application
	const neutralGrayBaseHue = 0;
	const neutralGrayBaseSaturation = 0;
	const neutralGrayBaseLightness = 55; // Corresponds to approx #8C8C8C
	// --- End Customization ---

	let colorValue;

	// Use neutral gray (with alpha) if total is too low or data is invalid
	if (!c || typeof c.total !== 'number' || typeof c.correct !== 'number' || c.total <= 5) {
		colorValue = `hsla(${neutralGrayBaseHue}, ${neutralGrayBaseSaturation}%, ${neutralGrayBaseLightness}%, ${alphaValue})`;
	} else {
		// 1. Calculate the raw ratio
		const ratio = (c.correct / c.total) * 100;

		// 2. Determine the effective ratio for color calculation
		// Clamp between 0 and maxRatio first, then apply the minimum threshold.
		const cappedRatio = Math.max(0, Math.min(maxRatio, ratio));
		const effectiveRatio = Math.max(minRatioThreshold, cappedRatio); // Value will be between minRatioThreshold and maxRatio

		// 3. Calculate hue by mapping the [minRatioThreshold, maxRatio] range to the [0, 120] hue range.
		const hueRange = 120; // Target hue range (0=Red to 120=Green)
		const inputRatioRange = maxRatio - minRatioThreshold; // The effective input range size (e.g., 100 - 80 = 20)

		let hue;
		// Prevent division by zero if threshold equals maxRatio
		if (inputRatioRange <= 0) {
			// If threshold is 100, map all valid values (which must be 100) to Green
			hue = hueRange;
		} else {
			// Normalize the effectiveRatio within its range [minRatioThreshold, maxRatio] -> [0, 1]
			const normalizedRatio = (effectiveRatio - minRatioThreshold) / inputRatioRange;
			// Scale the normalized ratio to the hue range [0, 120]
			hue = normalizedRatio * hueRange;
		}

		// Clamp hue just in case of floating point inaccuracies
		hue = Math.max(0, Math.min(hueRange, hue));

		// 4. Construct the HSLA color string including the alpha value
		colorValue = `hsla(${hue}, ${mutedSaturation}%, ${mutedLightness}%, ${alphaValue})`;
	}

	// 5. Return the CSS style string
	return `background-color: ${colorValue};`;
}
