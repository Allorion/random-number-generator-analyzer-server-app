import {erfc} from "../scripts/erfc";

export interface IResRunsTest {
    "a": number,
    "b": number | undefined,
    "c": number | undefined,
    "pValue": number,
    "result": "FAILURE" | "SUCCESS" | undefined,
}

export const runTest = (bitsLine: number[], n: number, ALPHA: number=0.05): IResRunsTest => {

    let sum: number = 0

    for (let i = 0; i < n; i++) {
        if (bitsLine[i]) {
            sum++
        }
    }

    const pi: number = sum / n

    if (Math.abs(pi - 0.5) > (2.0 / Math.sqrt(n))) {
        return {
            'a': pi,
            'b': undefined,
            'c': undefined,
            'pValue': 0.0000,
            "result": undefined,
        }
    } else {

        let v: number = 1

        for (let i = 1; i < n; i++) {
            if (bitsLine[i] != bitsLine[i - 1]) {
                v++
            }
        }

        const erfc_arg: number = Math.abs(v - 2.0 * n * pi * (1 - pi)) / (2.0 * pi * (1 - pi) * Math.sqrt(2 * n));

        const pValue = erfc(erfc_arg)

        return {
            'a': pi,
            'b': v,
            'c': erfc_arg,
            'pValue': pValue,
            "result": pValue < ALPHA ? "FAILURE" : "SUCCESS",
        }

    }
}
