import {isGreaterThanOne, isNegative} from "../scripts/checkNum";
import {BitSequence} from "../types/INistTestTypes";

const cephes = require('cephes');

export interface IOverlappingTemplateMatchings {
    "warning": string | undefined,
    "a": number | undefined,
    "b": number | undefined,
    "c": number | undefined,
    "d": number | undefined,
    "e": number | undefined,
    "f": number | undefined,
    "0": number | undefined,
    "1": number | undefined,
    "2": number | undefined,
    "3": number | undefined,
    "4": number | undefined,
    "5": number | undefined,
    "Chi^2": number | undefined,
    "pValue": number,
    "result": "FAILURE" | "SUCCESS",
}

function Pr(u: number, eta: number): number {
    let l: number;
    let sum: number;
    let p: number;

    if (u === 0) {
        p = Math.exp(-eta);
    } else {
        sum = 0.0;
        for (l = 1; l <= u; l++) {
            sum += Math.exp(-eta - u * Math.log(2) + l * Math.log(eta) - cephes.lgam(l + 1) + cephes.lgam(u) - cephes.lgam(l) - cephes.lgam(u - l + 1));
        }
        p = sum;
    }
    return p;
}

export const overlappingTemplateMatchings = (bitsLine: number[], n: number, m: number = 9, ALPHA: number=0.05): IOverlappingTemplateMatchings => {

    let i, k, match;
    let W_obs, eta, sum, chi2, p_value, lambda;
    const M = 1032;
    const N = Math.floor(n / M);
    const K = 5;
    const nu = [0, 0, 0, 0, 0, 0];
    const pi = [0.364091, 0.185659, 0.139381, 0.100571, 0.0704323, 0.139865];
    const sequence: BitSequence[] = new Array(m).fill(1);

    if (sequence.length === 0) {
        return {
            'warning': 'ОПРЕДЕЛЕНИЕ ШАБЛОНА: Недостаточно памяти, проверка совпадений перекрывающихся шаблонов прервана!',
            "0": undefined,
            "1": undefined,
            "2": undefined,
            "3": undefined,
            "4": undefined,
            "5": undefined,
            "Chi^2": undefined,
            a: undefined,
            b: undefined,
            c: undefined,
            d: undefined,
            e: undefined,
            f: undefined,
            pValue: 0.0000,
            result: 'FAILURE'
        }
    }

    lambda = (M - m + 1) / Math.pow(2, m);
    eta = lambda / 2.0;
    sum = 0.0;

    for (i = 0; i < K; i++) {
        pi[i] = Pr(i, eta);
        sum += pi[i];
    }
    pi[K] = 1 - sum;

    for (i = 0; i < N; i++) {
        W_obs = 0;
        for (let j = 0; j < M - m + 1; j++) {
            match = 1;
            for (k = 0; k < m; k++) {
                if (sequence[k] !== bitsLine[i * M + j + k]) {
                    match = 0;
                }
            }
            if (match === 1) {
                W_obs++;
            }
        }
        if (W_obs <= 4) {
            nu[W_obs]++;
        } else {
            nu[K]++;
        }
    }

    sum = 0;
    chi2 = 0.0;
    for (i = 0; i < K + 1; i++) {
        chi2 += Math.pow(nu[i] - N * pi[i], 2) / (N * pi[i]);
        sum += nu[i];
    }

    p_value = cephes.igamc(K / 2.0, chi2 / 2.0);

    return {
        "warning": (isNegative(p_value) || isGreaterThanOne(p_value)) ? 'ПРЕДУПРЕЖДЕНИЕ: Значение P_VALUE находится вне диапазона.' : undefined,
        "0": nu[0],
        "1": nu[1],
        "2": nu[2],
        "3": nu[3],
        "4": nu[4],
        "5": nu[5],
        "Chi^2": chi2,
        a: n,
        b: m,
        c: M,
        d: N,
        e: lambda,
        f: eta,
        pValue: p_value,
        result: p_value < ALPHA ? "FAILURE" : "SUCCESS"
    }

}
