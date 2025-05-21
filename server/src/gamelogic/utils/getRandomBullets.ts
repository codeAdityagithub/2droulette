export default function () {
    const length = Math.floor(Math.random() * 7) + 4; // Random length from 4 to 10

    let array: number[] = [];

    do {
        array = Array.from({ length }, () => Math.round(Math.random()));
    } while (!array.includes(0) || !array.includes(1)); // Ensure both 0 and 1 are present

    return array;
}
