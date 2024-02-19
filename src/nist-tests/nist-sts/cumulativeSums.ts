import {cephesNormal} from "../scripts/cephesNormal";
import {isGreaterThanOne, isNegative} from "../scripts/checkNum";


export interface IResCumulativeSumsForward {
    "a": number,
    "pValue": number,
    "result": "FAILURE" | "SUCCESS",
    "warningRange": boolean
}

export interface IResCumulativeSumsBackwards {
    "a": number,
    "pValue": number,
    "result": "FAILURE" | "SUCCESS",
    "warningRange": boolean
}

export interface IResCumulativeSums {
    'forward': IResCumulativeSumsForward,
    'backwards': IResCumulativeSumsBackwards
}


export const cumulativeSums = (bitsLine: number[], n: number, ALPHA: number = 0.1): IResCumulativeSums => {

    let S = 0;
    let sup = 0;
    let inf = 0;
    let z = 0;
    let zrev = 0;

    let sum1 = 0
    let sum2 = 0

    for (let k = 0; k < n; k++) {
        bitsLine[k] ? S++ : S--;
        if (S > sup)
            sup++;
        if (S < inf)
            inf--;
        z = (sup > -inf) ? sup : -inf;
        zrev = (sup - S > S - inf) ? sup - S : S - inf;
    }

    // forward
    for (let k = Math.floor((-n / z + 1) / 4); k <= Math.floor((n / z - 1) / 4); k++) {
        sum1 += cephesNormal(((4 * k + 1) * z) / Math.sqrt(n));
        sum1 -= cephesNormal(((4 * k - 1) * z) / Math.sqrt(n));
    }
    for (let k = Math.floor((-n / z - 3) / 4); k <= Math.floor((n / z - 1) / 4); k++) {
        sum2 += cephesNormal(((4 * k + 3) * z) / Math.sqrt(n));
        sum2 -= cephesNormal(((4 * k + 1) * z) / Math.sqrt(n));
    }

    const pValueForward = 1.0 - sum1 + sum2;

    let warRangeForward = false

    if (isNegative(pValueForward) || isGreaterThanOne(pValueForward)) {
        warRangeForward = true
    }

    // backwards
    sum1 = 0;
    for (let k = Math.floor((-n / zrev + 1) / 4); k <= Math.floor((n / zrev - 1) / 4); k++) {
        sum1 += cephesNormal(((4 * k + 1) * zrev) / Math.sqrt(n));
        sum1 -= cephesNormal(((4 * k - 1) * zrev) / Math.sqrt(n));
    }
    sum2 = 0;
    for (let k = Math.floor((-n / zrev - 3) / 4); k <= Math.floor((n / zrev - 1) / 4); k++) {
        sum2 += cephesNormal(((4 * k + 3) * zrev) / Math.sqrt(n));
        sum2 -= cephesNormal(((4 * k + 1) * zrev) / Math.sqrt(n));
    }

    const pValueBackwards = 1.0 - sum1 + sum2;

    let warRangeBackwards = false

    if (isNegative(pValueForward) || isGreaterThanOne(pValueForward)) {
        warRangeBackwards = true
    }

    return {
        'forward': {
            "a": z,
            "pValue": pValueForward,
            "result": pValueForward < ALPHA ? "FAILURE" : "SUCCESS",
            "warningRange": warRangeForward
        },
        'backwards': {
            "a": zrev,
            "pValue": pValueBackwards,
            "result": pValueBackwards < ALPHA ? "FAILURE" : "SUCCESS",
            "warningRange": warRangeBackwards
        }
    }
}