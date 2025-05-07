// src/routes/api/your-endpoint/+server.ts (or .js)

import { json, error as svelteError } from '@sveltejs/kit';

// Import the JSON files directly
// Make sure the paths are correct relative to this server file.
// For example, if your JSON files are in the same directory:
import wordListEasyData from './typing_words_easy.json' assert { type: 'json' };
import wordListMediumData from './typing_words_medium.json' assert { type: 'json' };
import wordListHardData from './typing_words_hard.json' assert { type: 'json' };

// --- Load Word List (Now much simpler) ---

// The data is already parsed by the import
const wordListEasy: string[] = wordListEasyData;
const wordListMedium: string[] = wordListMediumData;
const wordListHard: string[] = wordListHardData;

// --- API Endpoint Handler ---

export async function POST({ request }) {
	let requestData;
	try {
		requestData = await request.json();
	} catch (e) {
		console.error('Failed to parse request JSON body:', e);
		// Use SvelteKit's error helper for proper error responses
		throw svelteError(400, 'Invalid JSON data in request body.');
	}
	// console.log('Request data:', requestData); // Good for debugging

	const difficulty = requestData.difficulty || 0;
	let selectedWordList: string[]; // Renamed to avoid confusion with module-level wordList variables

	switch (difficulty) {
		case 0:
			selectedWordList = wordListEasy;
			console.log('selecting easy words, count:', selectedWordList.length);
			break;
		case 1:
			selectedWordList = wordListMedium;
			console.log('selecting medium words, count:', selectedWordList.length);
			break;
		case 2:
			selectedWordList = wordListHard;
			console.log('selecting hard words, count:', selectedWordList.length);
			break;
		default:
			console.log('Invalid difficulty provided:', difficulty, 'defaulting to easy.');
			selectedWordList = wordListEasy; // Fallback to easy for unexpected difficulty
	}

	// Check if the word list loaded correctly
	// (This check is less critical now with direct imports, as a failed import would break at build/startup)
	if (!selectedWordList || selectedWordList.length === 0) {
		console.error(`Word list for difficulty ${difficulty} is unavailable or empty.`);
		throw svelteError(500, `Word list for difficulty ${difficulty} is unavailable on the server.`);
	}

	const errorRates = requestData.errorRates || {};
	const numWordsToSample = typeof requestData.count === 'number' ? requestData.count : 10;
	const baseWeight = typeof requestData.baseWeight === 'number' ? requestData.baseWeight : 1.0;
	const errorScalingFactor = typeof requestData.scale === 'number' ? requestData.scale : 10.0;

	if (typeof errorRates !== 'object' || Array.isArray(errorRates)) {
		throw svelteError(400, 'Invalid format for errorRates, expected an object.');
	}

	const sampledWords = sampleWordsByErrorRate(
		selectedWordList,
		errorRates,
		numWordsToSample,
		baseWeight,
		errorScalingFactor
	);

	return json({ words: sampledWords });
}

// Your weightedRandomSample and sampleWordsByErrorRate functions remain the same
// ... (weightedRandomSample function from your code)
function weightedRandomSample(population: string[], weights: number[], k: number) {
	if (population.length !== weights.length) {
		throw new Error('Population and weights must have the same length.');
	}
	const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
	if (totalWeight <= 0) {
		console.warn('Total weight is zero or negative. Attempting uniform sampling.');
		if (population.length > 0) {
			const results = [];
			for (let i = 0; i < Math.min(k, population.length); i++) {
				// Ensure k isn't > population.length
				results.push(population[Math.floor(Math.random() * population.length)]);
			}
			return results;
		} else {
			return [];
		}
	}
	const cumulativeWeights: number[] = []; // Added type
	let cumulativeSum = 0;
	for (const weight of weights) {
		cumulativeSum += weight;
		cumulativeWeights.push(cumulativeSum);
	}
	const results: string[] = []; // Added type
	const numToSample = Math.min(k, population.length); // Ensure k isn't > population.length
	for (let i = 0; i < numToSample; i++) {
		const randomNum = Math.random() * totalWeight;
		// findIndex can return -1 if no element satisfies the condition,
		// though with randomNum <= totalWeight, it should always find one unless totalWeight is 0 (handled).
		let index = cumulativeWeights.findIndex((cw) => cw >= randomNum);
		if (index === -1 && population.length > 0) {
			// Should not happen if totalWeight > 0
			index = population.length - 1;
		} else if (index === -1) {
			continue; // No items to sample from or error
		}
		results.push(population[index]);
	}
	return results;
}

// ... (sampleWordsByErrorRate function from your code)
function sampleWordsByErrorRate(
	wordList: string[],
	errorRates: Record<string, number>,
	numWordsToSample: number,
	baseWeight = 1.0,
	errorScalingFactor = 1.0
) {
	// --- Input Validation ---
	if (!wordList || wordList.length === 0 || numWordsToSample <= 0) {
		return [];
	}
	if (baseWeight < 0) {
		console.warn('baseWeight must be non-negative. Using 0.'); // Corrected error handling
		baseWeight = 0;
	}
	if (typeof errorRates !== 'object' || errorRates === null) {
		console.warn('errorRates should be an object. Treating as empty.');
		errorRates = {};
	}

	// --- Prepare Data ---
	const normalizedErrorRates: Record<string, number> = {};
	for (const char in errorRates) {
		if (
			Object.hasOwnProperty.call(errorRates, char) &&
			typeof errorRates[char] === 'number' &&
			errorRates[char] > 0 // Only consider positive error rates for bonus
		) {
			normalizedErrorRates[char.toLowerCase()] = errorRates[char];
		}
	}
	const weights: number[] = []; // Added type
	const validWords: string[] = []; // Added type

	// --- Calculate Weights ---
	for (const word of wordList) {
		if (typeof word !== 'string' || word.trim() === '') {
			// Also skip empty strings
			console.warn(`Skipping non-string or empty item in wordList: "${word}"`);
			continue;
		}
		const lowerWord = word.toLowerCase();
		let errorBonus = 0;
		for (let i = 0; i < lowerWord.length; i++) {
			const char = lowerWord[i];
			errorBonus += normalizedErrorRates[char] || 0.0;
		}
		let weight = baseWeight + errorScalingFactor * errorBonus;
		if (weight < 0) {
			// Should be rare if baseWeight >=0 and errorScalingFactor*errorBonus >=0
			weight = 0;
		}
		weights.push(weight);
		validWords.push(word);
	}

	// --- Perform Sampling ---
	if (validWords.length === 0) {
		return [];
	}

	// Ensure numWordsToSample is not greater than the number of available valid words
	const actualNumToSample = Math.min(numWordsToSample, validWords.length);
	if (actualNumToSample <= 0) return [];

	try {
		return weightedRandomSample(validWords, weights, actualNumToSample);
	} catch (error) {
		console.error('Error during weighted sampling:', error);
		console.warn('Falling back to uniform sampling due to error.');
		const results: string[] = []; // Added type
		if (validWords.length > 0) {
			for (let i = 0; i < actualNumToSample; i++) {
				results.push(validWords[Math.floor(Math.random() * validWords.length)]);
			}
		}
		return results;
	}
}
