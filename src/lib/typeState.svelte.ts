type tType_state = {
	text: string;
	cursor: number;
	chunk: number;
	stats: { [key: number]: any };
	totalKeys: number;
	increment: () => void;
	decrement: () => void;
};

const text = `Welcome to your dedicated space for mastering the keyboard!\nTyping is a fundamental skill in our digital age, vital for work, study, and communication.\nEffective practice starts with good posture and positioning. Keep your fingers anchored on the home row keys and focus on technique, trying not to look down.\nWhen learning, prioritize accuracy over speed. Hitting the correct keys consistently builds the right muscle memory. Speed will naturally follow as your accuracy solidifies.\nConsistency unlocks progress. Aim for short, focused sessions daily. Just 10-15 minutes of dedicated practice each day makes a huge difference over time.\nThis platform provides the tools and exercises you need. Track your progress, stay motivated, and watch your typing skills transform. Ready to get started?`;

const python_code = 'for i in range(100):\n\tprint(i)\nhello';

export const type_state = $state<tType_state>({
	text: text,
	cursor: 0,
	stats: {},
	totalKeys: 0,
	chunk: 0,
	increment() {
		if (this.cursor === this.text.length) return;
		if (this.text[this.cursor + 1] === '\t') {
			this.cursor += 2;
		} else {
			this.cursor++;
		}
	},
	decrement() {
		this.cursor++;
	}
});
