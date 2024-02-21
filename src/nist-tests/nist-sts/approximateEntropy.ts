const cephes = require('cephes');

export interface IApproximateEntropy {
    "warning": string | undefined,
    "a": number | undefined,
    "b": number | undefined,
    "c": number | undefined,
    "d": number | undefined,
    "e": number | undefined,
    "f": number | undefined,
    "g": number | undefined,
    "pValue": number,
    "result": "FAILURE" | "SUCCESS",
}

export const approximateEntropy = (bitsLine: number[], n: number, m: number = 10, ALPHA: number = 0.05): IApproximateEntropy => {

    let i, j, k, r, blockSize, seqLength, powLen, index;
    let sum, numOfBlocks, apen, chi_squared, p_value;
    const ApEn: number[] = [0, 0];
    let P: number[] | null = null;

    seqLength = n;
    r = 0;

    for (blockSize = m; blockSize <= m + 1; blockSize++) {
        if (blockSize === 0) {
            ApEn[0] = 0.0;
            r++;
        } else {
            numOfBlocks = seqLength;
            powLen = Math.pow(2, blockSize + 1) - 1;
            P = new Array(powLen).fill(0);

            for (i = 1; i < powLen - 1; i++)
                P[i] = 0;

            for (i = 0; i < numOfBlocks; i++) {
                k = 1;
                for (j = 0; j < blockSize; j++) {
                    k <<= 1;
                    if (bitsLine[(i + j) % seqLength] === 1)
                        k++;
                }
                P[k - 1]++;
            }

            sum = 0.0;
            index = Math.pow(2, blockSize) - 1;
            for (i = 0; i < Math.pow(2, blockSize); i++) {
                if (P[index] > 0)
                    sum += P[index] * Math.log(P[index] / numOfBlocks);
                index++;
            }
            sum /= numOfBlocks;
            ApEn[r] = sum;
            r++;
            P = null;
        }
    }
    apen = ApEn[0] - ApEn[1];

    chi_squared = 2.0 * seqLength * (Math.log(2) - apen);
    p_value = cephes.igamc(Math.pow(2, m - 1), chi_squared / 2.0);

    return {
        a: m,
        b: seqLength,
        c: chi_squared,
        d: ApEn[0],
        e: ApEn[1],
        f: apen,
        g: Math.log(2.0),
        "pValue": p_value,
        "result": p_value < ALPHA ? "FAILURE" : "SUCCESS",
        warning: m > (Math.log(seqLength) / Math.log(2) - 5) ? `Примечание: Размер блока = ${m} превышает рекомендуемое значение ${Math.max(1, (Math.log(seqLength) / Math.log(2) - 5))}. Результаты неточны!` : undefined
    }
}
