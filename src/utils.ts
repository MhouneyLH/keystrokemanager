export function getPraisingWord(): string {
	const WORDS = ['Awesome', 'Wonderful', 'Great', 'Fantastic', 'Cool'];

	return WORDS[Math.floor(Math.random() * WORDS.length)];
}

export function setLongInterval(callback: any, timeout: number): any {
    let count = 0;
    const MAX_32_BIT_SIGNED = 2147483647;
    const maxIterations = timeout / MAX_32_BIT_SIGNED;

    const onInterval = () => {
        count++;
        if (count > maxIterations) {
            count = 0;
            callback();
        }
    };

    return setInterval(onInterval, Math.min(timeout, MAX_32_BIT_SIGNED));
};