import {BitSequence} from "../types/INistTestTypes";
import {computeRank, createMatrix, defMatrix} from "../scripts/functionForMatrix";
import {isZero} from "../scripts/isZero";
import {isGreaterThanOne, isNegative} from "../scripts/checkNum";

export interface IResRankTest {
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

export const rankTest = (bitsLine: number[], n: number, ALPHA: number = 0.1): IResRankTest => {

    const M: 32 = 32;
    const Q: 32 = 32;
    const matrix: BitSequence[][] = createMatrix(M, Q);

    const N = Math.floor(n / (M * Q));

    if (isZero(N)) {
        return {
            a: undefined,
            b: undefined,
            c: undefined,
            d: undefined,
            e: undefined,
            f: undefined,
            g: undefined,
            h: undefined,
            i: undefined,
            'warning': `Ошибка: Недостаточно бит для определения матрицы размером ${M}x${Q}`,
            "pValue": 0.0000,
            'result': 'FAILURE'
        }
    } else {

        let r: number = 32;
        let product: number = 1;

        for (let i: number = 0; i <= r - 1; i++) {
            product *= ((1.0 - Math.pow(2, i - 32)) * (1.0 - Math.pow(2, i - 32))) / (1.0 - Math.pow(2, i - r));
        }

        const p_32: number = Math.pow(2, r * (M + Q - r) - M * Q) * product;

        r = 31;
        product = 1;
        for (let i: number = 0; i <= r - 1; i++) {
            product *= ((1.0 - Math.pow(2, i - 32)) * (1.0 - Math.pow(2, i - 32))) / (1.0 - Math.pow(2, i - r));
        }

        const p_31: number = Math.pow(2, r * (M + Q - r) - M * Q) * product;

        const p_30: number = 1 - (p_32 + p_31);

        let F_32: number = 0;
        let F_31: number = 0;

        for (let k: number = 0; k < N; k++) {
            defMatrix(M, Q, matrix, k, bitsLine);
            const R = computeRank(M, Q, matrix);

            if (R === 32) {
                F_32++;
            }

            if (R === 31) {
                F_31++;
            }
        }

        const F_30: number = N - (F_32 + F_31);

        const chi_squared = (
            Math.pow(F_32 - N * p_32, 2) / (N * p_32) +
            Math.pow(F_31 - N * p_31, 2) / (N * p_31) +
            Math.pow(F_30 - N * p_30, 2) / (N * p_30)
        );

        const arg1 = -chi_squared / 2.0;

        const pValue = Math.exp(arg1);


        return {
            "warning": (isNegative(pValue) || isGreaterThanOne(pValue)) ? 'ПРЕДУПРЕЖДЕНИЕ: Значение P_VALUE находится вне диапазона.' : undefined,
            "a": p_32,
            "b": p_31,
            "c": p_30,
            "d": F_32,
            "e": F_31,
            "f": F_30,
            "g": N,
            "h": chi_squared,
            "i": n % (M * Q),
            "pValue": pValue,
            "result": pValue < ALPHA ? "FAILURE" : "SUCCESS",
        }
    }
}