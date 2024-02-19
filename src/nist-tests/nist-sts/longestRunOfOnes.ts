import {isGreaterThanOne, isNegative} from "../scripts/checkNum";

const cephes = require('cephes');

interface IAssignment {
    [key: string]: number
}

export interface IResLongestRunOfOnes {
    "warning": string | undefined,
    "a": number | undefined,
    "b": number | undefined,
    "c": number | undefined,
    'assignment': IAssignment | undefined,
    "pValue": number,
    "result": "FAILURE" | "SUCCESS",
}

export const longestRunOfOnes = (bitsLine: number[], n: number, ALPHA: number): IResLongestRunOfOnes => {

    let K: number = 0;
    let M: number = 0;
    let V: [number, number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0, 0];
    let pi: [number, number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0, 0];
    let nu: [number, number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0, 0];
    let N: number = 0

    if (n < 128) {
        return {
            a: undefined, assignment: undefined, b: undefined, c: undefined,
            'warning': 'Битовая длина слишком коротка, n должна быть больше ' + n,
            "pValue": 0.0000,
            'result': 'FAILURE'
        }
    } else if (n < 6272) {
        K = 3;
        M = 8;
        V[0] = 1;
        V[1] = 2;
        V[2] = 3;
        V[3] = 4;
        pi[0] = 0.21484375;
        pi[1] = 0.3671875;
        pi[2] = 0.23046875;
        pi[3] = 0.1875;
    } else if (n < 750000) {
        K = 5;
        M = 128;
        V[0] = 4;
        V[1] = 5;
        V[2] = 6;
        V[3] = 7;
        V[4] = 8;
        V[5] = 9;
        pi[0] = 0.1174035788;
        pi[1] = 0.242955959;
        pi[2] = 0.249363483;
        pi[3] = 0.17517706;
        pi[4] = 0.102701071;
        pi[5] = 0.112398847;
    } else {
        K = 6;
        M = 10000;
        V[0] = 10;
        V[1] = 11;
        V[2] = 12;
        V[3] = 13;
        V[4] = 14;
        V[5] = 15;
        V[6] = 16;
        pi[0] = 0.0882;
        pi[1] = 0.2092;
        pi[2] = 0.2483;
        pi[3] = 0.1933;
        pi[4] = 0.1208;
        pi[5] = 0.0675;
        pi[6] = 0.0727;
    }

    N = Math.floor(n / M);

    for (let i: number = 0; i < N; i++) {

        let vNObs: number = 0;
        let run: number = 0;

        for (let j: number = 0; j < M; j++) {
            if (bitsLine[i * M + j] === 1) {
                run++;
                if (run > vNObs)
                    vNObs = run;
            } else {
                run = 0;
            }
        }

        if (vNObs < V[0]) {
            nu[0]++;
        }

        for (let j: number = 0; j <= K; j++) {
            if (vNObs == V[j])
                nu[j]++;
        }

        if (vNObs > V[K]) {
            nu[K]++;
        }

    }

    let chi2 = 0;

    for (let i: number = 0; i <= K; i++) {
        chi2 += ((nu[i] - N * pi[i]) * (nu[i] - N * pi[i])) / (N * pi[i]);
    }

    const pValue = cephes.igamc((K / 2.0), chi2 / 2.0)

    let assignment: IAssignment

    if (K == 3) {
        assignment = {
            '1': nu[0],
            '2': nu[1],
            '3': nu[2],
            '4': nu[3],
        }
    } else if (K == 5) {
        assignment = {
            '4': nu[0],
            '5': nu[1],
            '6': nu[2],
            '7': nu[3],
            '8': nu[4],
            '9': nu[5],
        }
    } else {
        assignment = {
            '10': nu[0],
            '11': nu[1],
            '12': nu[2],
            '13': nu[3],
            '14': nu[4],
            '15': nu[5],
            '16': nu[6],
        }
    }

    return {
        "warning": (isNegative(pValue) || isGreaterThanOne(pValue)) ? 'ПРЕДУПРЕЖДЕНИЕ: Значение P_VALUE находится вне диапазона.' : undefined,
        "a": N,
        "b": M,
        "c": chi2,
        'assignment': assignment,
        "pValue": pValue,
        "result": pValue < ALPHA ? "FAILURE" : "SUCCESS",
    }

}