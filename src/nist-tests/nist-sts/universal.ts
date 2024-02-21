import {erfc} from "../scripts/erfc";
import {isGreaterThanOne, isNegative} from "../scripts/checkNum";

export interface IUniversal {
    "warning": string | undefined,
    "a": number | undefined,
    "b": number | undefined,
    "c": number | undefined,
    "d": number | undefined,
    "e": number | undefined,
    "f": number | undefined,
    "g": number | undefined,
    "h": number | undefined,
    "i": number | undefined,
    "pValue": number,
    "result": "FAILURE" | "SUCCESS",
}

export const universal = (bitsLine: number[], n: number, ALPHA: number = 0.05): IUniversal => {

    let i: number, j: number, p: number, L: number, Q: number, K: number;
    let arg: number, sqrt2: number, sigma: number, phi: number, sum: number, p_value: number, c: number;
    let T: number[], decRep: number;
    const expected_value: number[] = [
        0, 0, 0, 0, 0, 0, 5.2177052, 6.1962507, 7.1836656,
        8.1764248, 9.1723243, 10.170032, 11.168765,
        12.168070, 13.167693, 14.167488, 15.167379
    ];
    const variance: number[] = [
        0, 0, 0, 0, 0, 0, 2.954, 3.125, 3.238, 3.311, 3.356, 3.384,
        3.401, 3.410, 3.416, 3.419, 3.421
    ];

    /* * * * * * * * * ** * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * THE FOLLOWING REDEFINES L, SHOULD THE CONDITION:     n >= 1010*2^L*L       *
     * NOT BE MET, FOR THE BLOCK LENGTH L.                                        *
     * * * * * * * * * * ** * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    L = 5;
    if (n >= 387840) L = 6;
    if (n >= 904960) L = 7;
    if (n >= 2068480) L = 8;
    if (n >= 4654080) L = 9;
    if (n >= 10342400) L = 10;
    if (n >= 22753280) L = 11;
    if (n >= 49643520) L = 12;
    if (n >= 107560960) L = 13;
    if (n >= 231669760) L = 14;
    if (n >= 496435200) L = 15;
    if (n >= 1059061760) L = 16;

    Q = 10 * 2 ** L;
    K = Math.floor(n / L) - Q; /* BLOCKS TO TEST */

    p = 2 ** L;
    if (L < 6 || L > 16 || Q < 10 * 2 ** L || (T = new Array(p).fill(0)) == null) {
        return {
            d: undefined, e: undefined, f: undefined, g: undefined, h: undefined, i: undefined,
            a: undefined, b: undefined, c: undefined, pValue: 0, result: 'FAILURE',
            warning: `УНИВЕРСАЛЬНЫЙ СТАТИСТИЧЕСКИЙ ТЕСТ: ОШИБКА: L НАХОДИТСЯ ВНЕ ДИАПАЗОНА. -ИЛИ- : Q МЕНЬШЕ ${10 * Math.pow(2, L)}. -ИЛИ- : Не удается выделить T.`
        }
    }

    /* COMPUTE THE EXPECTED:  Formula 16, in Marsaglia's Paper */
    c = 0.7 - 0.8 / L + (4 + 32 / L) * K ** (-3 / L) / 15;
    sigma = c * Math.sqrt(variance[L] / K);
    sqrt2 = Math.sqrt(2);
    sum = 0.0;
    for (i = 0; i < p; i++) T[i] = 0;
    for (i = 1; i <= Q; i++) { /* INITIALIZE TABLE */
        decRep = 0;
        for (j = 0; j < L; j++) decRep += bitsLine[(i - 1) * L + j] * 2 ** (L - 1 - j);
        T[decRep] = i;
    }
    for (i = Q + 1; i <= Q + K; i++) { /* PROCESS BLOCKS */
        decRep = 0;
        for (j = 0; j < L; j++) decRep += bitsLine[(i - 1) * L + j] * 2 ** (L - 1 - j);
        sum += Math.log2(i - T[decRep]);
        T[decRep] = i;
    }
    phi = sum / K;

    arg = Math.abs(phi - expected_value[L]) / (sqrt2 * sigma);
    p_value = erfc(arg);

    return {
        a: L,
        b: Q,
        c: K,
        d: sum,
        e: sigma,
        f: variance[L],
        g: expected_value[L],
        h: phi,
        i: n - (Q + K) * L,
        pValue: p_value,
        result: p_value < ALPHA ? "FAILURE" : "SUCCESS",
        "warning": (isNegative(p_value) || isGreaterThanOne(p_value)) ? 'ПРЕДУПРЕЖДЕНИЕ: Значение P_VALUE находится вне диапазона.' : undefined,
    }
}