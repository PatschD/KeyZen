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
	'u',
	'v',
	'w',
	'x',
	'y',
	'z'
];

export function getColorLetters(c: { total: number; correct: number }, minNumber = 5): string {
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
	if (!c || typeof c.total !== 'number' || typeof c.correct !== 'number' || c.total <= minNumber) {
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

export function calculateMean(data: number[]) {
	// Check if the input is a valid, non-empty array
	if (!Array.isArray(data) || data.length === 0) {
		return NaN; // Mean is undefined for empty or invalid input
	}

	// Calculate the sum using reduce
	const sum = data.reduce((accumulator, currentValue) => {
		// Ensure values are numbers, otherwise the sum might become NaN implicitly
		const num = Number(currentValue);
		return accumulator + (isNaN(num) ? 0 : num); // Add 0 if value is not a number, or handle as error
	}, 0);

	// Divide sum by the number of elements
	return sum / data.length;
}

export function calculateStandardDeviation(data: number[]) {
	// Check if the input is a valid array with at least two elements
	if (!Array.isArray(data) || data.length < 2) {
		// Sample standard deviation requires at least two data points
		return NaN;
	}

	// 1. Calculate the mean
	const mean = calculateMean(data);
	if (isNaN(mean)) {
		// If mean couldn't be calculated (e.g., non-numeric data), std dev is also NaN
		return NaN;
	}

	// 2. Calculate the sum of squared differences from the mean
	const sumOfSquaredDifferences = data.reduce((accumulator, currentValue) => {
		const difference = Number(currentValue) - mean;
		return accumulator + difference * difference;
	}, 0);

	// 3. Calculate the sample variance (divide by n-1)
	const variance = sumOfSquaredDifferences / (data.length - 1);

	// 4. Return the square root of the variance
	return Math.sqrt(variance);
}

export function generateRandomCharacters(length: number, options: any = {}) {
	// Default options
	const config = {
		lowercase: options.lowercase !== undefined ? options.lowercase : true,
		uppercase: options.uppercase !== undefined ? options.uppercase : true,
		numbers: options.numbers !== undefined ? options.numbers : true,
		special: options.special !== undefined ? options.special : true,
		spaces: options.spaces !== undefined ? options.spaces : false,
		custom: options.custom || ''
	};

	// Character sets
	const charSets = {
		lowercase: 'abcdefghijklmnopqrstuvwxyz',
		uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
		numbers: '0123456789',
		special: '!@#$%^&*()_+-=[]{}|;:,.<>?/\\"\'`~',
		spaces: ' '
	};

	// Build character pool based on options
	let charPool = '';
	if (config.lowercase) charPool += charSets.lowercase;
	if (config.uppercase) charPool += charSets.uppercase;
	if (config.numbers) charPool += charSets.numbers;
	if (config.special) charPool += charSets.special;
	if (config.spaces) charPool += charSets.spaces;
	if (config.custom) charPool += config.custom;

	// If no character types are selected, default to lowercase
	if (charPool.length === 0) {
		charPool = charSets.lowercase;
		console.warn('No character types selected, defaulting to lowercase letters');
	}

	// Generate the random string
	let result = '';
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * charPool.length);
		result += charPool[randomIndex];
	}

	return result;
}

// Example usage:
// Generate a 10-character string with all types except spaces
// const randomString = generateRandomCharacters(10);
// console.log(randomString);

// Generate a 20-character string with only lowercase and special characters
// const passwordString = generateRandomCharacters(20, {
//   uppercase: false,
//   numbers: false,
//   spaces: false
// });
// console.log(passwordString);

// Generate a 15-character string with custom characters included
// const customString = generateRandomCharacters(15, {
//   custom: "★☆♥♦♣♠♪♫"
// });
// console.log(customString);
