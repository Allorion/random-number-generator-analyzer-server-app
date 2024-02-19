const cephes = require('cephes');

export function combinePValues(data: number[]): number {
    // Calculate the chi-squared statistic
    const binCount = 10;
    const expectedCount = data.length / binCount;
    const freqPerBin: number[] = Array(binCount).fill(0);
    let chi2 = 0.0;

    for (const value of data) {
        const binIndex = Math.floor(value * binCount);
        freqPerBin[binIndex]++;
    }

    for (let j = 0; j < binCount; j++) {
        chi2 += Math.pow(freqPerBin[j] - expectedCount, 2) / expectedCount;
    }

    // Calculate uniformity using the chi-squared statistic
    return cephes.igamc(9.0 / 2.0, chi2 / 2.0);
}