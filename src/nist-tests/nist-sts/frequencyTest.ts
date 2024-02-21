import {erfc} from "../scripts/erfc";


export interface IResFrequency {
    "a": number,
    "b": number,
    "pValue": number,
    "result": "FAILURE" | "SUCCESS",
}

export const frequencyTest = (bitsLine: number[], n: number, ALPHA: number=0.05): IResFrequency => {

    const sqrt2 = 1.41421356237309504880

    let sum = 0

    for (let i = 0; i < n; i++) {
        sum += 2 * bitsLine[i] - 1
    }

    const sObs = Math.abs(sum) / Math.sqrt(n)

    const f = sObs / sqrt2

    const pValue = erfc(f)

    return {
        "a": sum,
        "b": sum / n,
        "pValue": pValue,
        "result": pValue < ALPHA ? "FAILURE" : "SUCCESS",
    }
}