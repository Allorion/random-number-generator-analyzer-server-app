import {isGreaterThanOne, isNegative} from "../scripts/checkNum";

const cephes = require('cephes');

export interface IListResultRandomExcursions {
    "x": number,
    "chi^2": number,
    "pValue": number,
    "result": "FAILURE" | "SUCCESS",
    warning: string | undefined,
}

export interface IRandomExcursions {
    "warning": string | undefined,
    "a": number | undefined,
    "b": number | undefined,
    "c": number | undefined,
    'listResult': IListResultRandomExcursions[],
}

export const randomExcursions = (bitsLine: number[], n: number, ALPHA: number = 0.05): IRandomExcursions => {

    let b: number, i: number, j: number, k: number, J: number, x: number;
    let cycleStart: number, cycleStop: number;
    let cycle: number[] | null = null;
    let S_k: number[] | null = null;
    const stateX: number[] = [-4, -3, -2, -1, 1, 2, 3, 4];
    const counter: number[] = [0, 0, 0, 0, 0, 0, 0, 0];
    let p_value: number;
    let sum: number;
    let constraint: number;
    const nu: number[][] = new Array(6).fill([]).map(() => new Array(8).fill(0));
    const pi: number[][] = [
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
        [0.5, 0.25, 0.125, 0.0625, 0.03125, 0.03125],
        [0.75, 0.0625, 0.046875, 0.03515625, 0.0263671875, 0.0791015625],
        [0.8333333333, 0.02777777778, 0.02314814815, 0.01929012346, 0.01607510288, 0.0803755143],
        [0.875, 0.015625, 0.013671875, 0.01196289063, 0.0104675293, 0.0732727051]
    ];

    let listResult: IListResultRandomExcursions[] = []

    if (
        ((S_k = new Array(n).fill(0)) == null) ||
        ((cycle = new Array(Math.max(1000, n / 100)).fill(0)) == null)
    ) {
        return {
            a: undefined,
            b: undefined,
            c: undefined,
            listResult: [],
            warning: "Тест на случайные экскурсии: Недостаточно выделенного рабочего места."
        }
    }

    J = 0; /* DETERMINE CYCLES */
    S_k[0] = 2 * bitsLine[0] - 1;
    for (i = 1; i < n; i++) {
        S_k[i] = S_k[i - 1] + 2 * bitsLine[i] - 1;
        if (S_k[i] == 0) {
            J++;
            if (J > Math.max(1000, n / 100)) {
                return {
                    a: undefined,
                    b: undefined,
                    c: undefined,
                    listResult: [],
                    warning: 'ОШИБКА В ФУНКЦИИ randomExcursions: ПРЕВЫШЕНИЕ ОЖИДАЕМОГО МАКСИМАЛЬНОГО ЧИСЛА ЦИКЛОВ.'
                };
            }
            cycle[J] = i;
        }
    }
    if (S_k[n - 1] != 0) J++;
    cycle[J] = n;

    constraint = Math.max(0.005 * Math.sqrt(n), 500);
    if (J < constraint) {
        return {
            a: J,
            b: n,
            c: undefined,
            listResult: [],
            warning: 'ПРЕДУПРЕЖДЕНИЕ: ТЕСТ НЕПРИМЕНИМ. КОЛИЧЕСТВО ЦИКЛОВ НЕДОСТАТОЧНО.'
        }
    } else {
        cycleStart = 0;
        cycleStop = cycle[1];
        for (k = 0; k < 6; k++)
            for (i = 0; i < 8; i++) nu[k][i] = 0;
        for (j = 1; j <= J; j++) {
            for (i = 0; i < 8; i++) counter[i] = 0;
            for (i = cycleStart; i < cycleStop; i++) {
                if ((S_k[i] >= 1 && S_k[i] <= 4) || (S_k[i] >= -4 && S_k[i] <= -1)) {
                    if (S_k[i] < 0) b = 4;
                    else b = 3;
                    counter[S_k[i] + b]++;
                }
            }
            cycleStart = cycle[j] + 1;
            if (j < J) cycleStop = cycle[j + 1];

            for (i = 0; i < 8; i++) {
                if (counter[i] >= 0 && counter[i] <= 4) nu[counter[i]][i]++;
                else if (counter[i] >= 5) nu[5][i]++;
            }
        }

        for (i = 0; i < 8; i++) {
            x = stateX[i];
            sum = 0;
            for (k = 0; k < 6; k++)
                sum += Math.pow(nu[k][i] - J * pi[Math.abs(x)][k], 2) / (J * pi[Math.abs(x)][k]);
            p_value = cephes.igamc(2.5, sum / 2.0);

            listResult.push({
                "chi^2": sum,
                "pValue": p_value,
                "result": p_value < ALPHA ? "FAILURE" : "SUCCESS",
                "warning": (isNegative(p_value) || isGreaterThanOne(p_value)) ? 'ПРЕДУПРЕЖДЕНИЕ: Значение P_VALUE находится вне диапазона.' : undefined,
                x: x,
            })
        }
    }
    return {
        a: J,
        b: n,
        c: constraint,
        listResult: listResult,
        warning: undefined
    }
}
