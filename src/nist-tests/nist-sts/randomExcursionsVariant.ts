import {isGreaterThanOne, isNegative} from "../scripts/checkNum";
import {erfc} from "../scripts/erfc";

export interface IListResultRandomExcursionsVariant {
    "x": number,
    "visits": number,
    "pValue": number,
    "result": "FAILURE" | "SUCCESS",
    warning: string | undefined,
}

export interface IRandomExcursionsVariant {
    "warning": string | undefined,
    "a": number | undefined,
    "b": number | undefined,
    'listResult': IListResultRandomExcursionsVariant[],
}

export const randomExcursionsVariant = (bitsLine: number[], n: number, ALPHA: number = 0.05): IRandomExcursionsVariant => {

    const stateX: number[] = [-9, -8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    let S_k: number[] | null = null;
    let p_value: number = 0.00;
    let J: number = 0;

    let listResult: IListResultRandomExcursionsVariant[] = []

    if (
        ((S_k = new Array(n).fill(0)) == null)
    ) {
        return {
            a: undefined,
            b: undefined,
            listResult: [],
            warning: "Тест на случайные экскурсии: Недостаточно выделенного рабочего места."
        }
    }

    S_k[0] = 2 * bitsLine[0] - 1;
    for (let i = 1; i < n; i++) {
        S_k[i] = S_k[i - 1] + 2 * bitsLine[i] - 1;
        if (S_k[i] === 0) {
            J++;
        }
    }
    if (S_k[n - 1] !== 0) {
        J++;
    }

    const constraint: number = Math.max(0.005 * Math.pow(n, 0.5), 500);

    if (J < constraint) {
        return {
            a: J,
            b: n,
            listResult: [],
            warning: 'ПРЕДУПРЕЖДЕНИЕ: ТЕСТ НЕПРИМЕНИМ. КОЛИЧЕСТВО ЦИКЛОВ НЕДОСТАТОЧНО.'
        }
    } else {

        for (let p = 0; p <= 17; p++) {
            const x = stateX[p];
            let count = 0;

            for (let i = 0; i < n; i++) {
                if (S_k[i] === x) {
                    count++;
                }
            }

            p_value = erfc(Math.abs(count - J) / (Math.sqrt(2.0 * J * (4.0 * Math.abs(x) - 2))));

            listResult.push({
                x: x,
                "visits": count,
                "pValue": p_value,
                "result": p_value < ALPHA ? "FAILURE" : "SUCCESS",
                "warning": (isNegative(p_value) || isGreaterThanOne(p_value)) ? 'ПРЕДУПРЕЖДЕНИЕ: Значение P_VALUE находится вне диапазона.' : undefined
            })
        }
    }

    return {
        a: J,
        b: n,
        listResult: listResult,
        warning: undefined
    }
}
