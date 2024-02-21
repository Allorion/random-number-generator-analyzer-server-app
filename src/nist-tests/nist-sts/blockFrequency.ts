const cephes = require('cephes');

export interface IResBlockFrequency {
    "a": number,
    "b": number,
    "c": number,
    "d": number,
    "pValue": number,
    "result": "FAILURE" | "SUCCESS",
}

export const blockFrequency = (bitsLine: number[], n: number, M: number = 128, ALPHA: number=0.05): IResBlockFrequency => {

    const N = Math.floor(n / M);
    let sum = 0;

    for (let i = 0; i < N; i++) {
        let blockSum = 0;
        for (let j = 0; j < M; j++) {
            if ((j + i * M) < n) {
                blockSum += bitsLine[j + i * M]
            }
        }
        const pi = blockSum / M;
        const v = pi - 0.5;
        sum += v * v;
    }

    const chiSquared = 4.0 * M * sum;

    let pValue

    try {
        pValue = cephes.igamc(N / 2, chiSquared / 2);
    } catch (e) {
        pValue = 0.000000
    }

    return {
        "a": chiSquared,
        "b": N,
        "c": M,
        "d": n % M,
        "pValue": pValue,
        "result": pValue < ALPHA ? "FAILURE" : "SUCCESS",
    }
}