export function updateUnderline(
	type_state: any,
	textContainer: HTMLDivElement,
	underline: HTMLDivElement
) {
	const curr_pos = document.getElementById('text_element_' + type_state.cursor);
	if (!curr_pos) return;

	const spanRect = curr_pos.getBoundingClientRect();
	const containerRect = textContainer.getBoundingClientRect();

	// --- Calculate Relative Position & Size ---
	const relativeX = spanRect.left - containerRect.left;
	// relativeY is the top of the char relative to the container's top padding edge
	const relativeY = spanRect.top - containerRect.top;
	// Use the span's height to position underline below it
	const charHeight = spanRect.height; // or currentSpan.offsetHeight
	// Use the span's width for the underline width
	const charWidth = spanRect.width; // or currentSpan.offsetWidth

	// --- Add a small vertical offset for spacing ---
	const verticalOffset = -2; // Adjust pixels below the char as needed

	underline.style.width = `${charWidth}px`;
	// Translate X by relativeX, Translate Y by relativeY + charHeight + offset
	// underline.style.transform = `translate(${relativeX - charWidth}px, 0)`;
	underline.style.transform = `translate(${relativeX}px, ${relativeY + charHeight + verticalOffset}px)`;
}
