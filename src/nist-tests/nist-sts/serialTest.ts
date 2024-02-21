const cephes = require('cephes');

export interface ISerialTest {
    "warning": string | undefined,
    "a": number | undefined,
    "b": number | undefined,
    "c": number | undefined,
    "d": number | undefined,
    "e": number | undefined,
    "f": number | undefined,
    "g": number | undefined,
    "pValue": [number, number],
    "result": ["FAILURE" | "SUCCESS", "FAILURE" | "SUCCESS"],
}

export const serialTest = (bitsLine: number[], n: number, m: number = 16, ALPHA: number = 0.05): ISerialTest => {

    let p_value1: number = 0.00;
    let p_value2: number = 0.00;
    let psim0: number = 0.00;
    let psim1: number = 0.00;
    let psim2: number = 0.00;
    let del1: number = 0.00;
    let del2: number = 0.00;

    psim0 = psi2(bitsLine, n, m);
    psim1 = psi2(bitsLine, n, m - 1);
    psim2 = psi2(bitsLine, n, m - 2);
    del1 = psim0 - psim1;
    del2 = psim0 - 2.0 * psim1 + psim2;
    p_value1 = cephes.igamc(Math.pow(2, m - 1) / 2, del1 / 2.0);
    p_value2 = cephes.igamc(Math.pow(2, m - 2) / 2, del2 / 2.0);

    return {
        a: m,
        b: n,
        c: psim0,
        d: psim1,
        e: psim2,
        f: del1,
        g: del2,
        pValue: [p_value1, p_value2],
        result: [p_value1 < ALPHA ? "FAILURE" : "SUCCESS", p_value2 < ALPHA ? "FAILURE" : "SUCCESS"],
        warning: undefined
    }
}

function psi2(bitsLine: number[], n: number, m: number): number {
    let i: number, j: number, k: number, powLen: number;
    let sum: number, numOfBlocks: number;
    let P: number[] = [];

    if (m === 0 || m === -1) {
        return 0.0;
    }
    numOfBlocks = n;
    powLen = Math.pow(2, m + 1) - 1;

    for (i = 0; i < powLen; i++) {
        P[i] = 0; /* INITIALIZE NODES */
    }

    for (i = 0; i < numOfBlocks; i++) {
        k = 1;
        for (j = 0; j < m; j++) {
            if (bitsLine[(i + j) % n] === 0) {
                k *= 2;
            } else if (bitsLine[(i + j) % n] === 1) {
                k = 2 * k + 1;
            }
        }
        P[k - 1]++;
    }
    sum = 0.0;

    for (i = Math.pow(2, m) - 1; i < Math.pow(2, m + 1) - 1; i++) {
        sum += Math.pow(P[i], 2);
    }
    sum = (sum * Math.pow(2, m) / n) - n;

    return sum;
}
