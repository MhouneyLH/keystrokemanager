export const setLongInterval = (callback: any, timeout: number) => {
    let count = 0;
    const MAX_32_BIT_SIGNED = 2147483647;
    const maxIterations = timeout / MAX_32_BIT_SIGNED;

    const onInterval = () => {
        ++count;
        if (count > maxIterations) {
            count = 0;
            callback();
        }
    };

    return setInterval(onInterval, Math.min(timeout, MAX_32_BIT_SIGNED));
};