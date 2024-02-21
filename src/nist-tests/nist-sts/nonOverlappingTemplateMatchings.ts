import {isGreaterThanOne, isNegative} from "../scripts/checkNum";
import {isZero} from "../scripts/isZero";

const cephes = require('cephes');

interface IListTests {
    "template": string | undefined,
    "W_1": number | undefined,
    "W_2": number | undefined,
    "W_3": number | undefined,
    "W_4": number | undefined,
    "W_5": number | undefined,
    "W_6": number | undefined,
    "W_7": number | undefined,
    "W_8": number | undefined,
    "Chi^2": number | undefined,
    "pValue": number,
    'index': number,
    "result": "FAILURE" | "SUCCESS",
}

export interface INonOverlappingTemplateMatchings {
    "warning": string | undefined,
    "LAMBDA": number | undefined,
    "M": number | undefined,
    "N": number | undefined,
    "m": number | undefined,
    "n": number | undefined,
    "listTests": IListTests[]
}

export const nonOverlappingTemplateMatchings = (bitsLine: number[], n: number, m: number = 9, sequence: number[][] | null): INonOverlappingTemplateMatchings => {

    /*----------------------------------------------------------------------------
	ПРИМЕЧАНИЕ: Если требуются дополнительные шаблоны длиной более 21, они должны
    быть сначала сконструированы, сохранены в файлах, а затем соответствующее
    количество непериодических шаблонов для этого файла должно быть сохранено в m-й
    позиции переменной numOfTemplates.
	----------------------------------------------------------------------------*/

    const listTests: IListTests[] = []

    const listPValue: number[] = []

    const numOfTemplates: number[] = [0, 0, 2, 4, 6, 12, 20, 40, 74, 148, 284, 568, 1116,
        2232, 4424, 8848, 17622, 35244, 70340, 140680, 281076, 562152];

    const MAXNUMOFTEMPLATES = sequence !== null ? sequence.length : 0
    const pi: number[] = []
    const nu: number[] = []
    const Wj: number[] = []
    const K = 5

    const N = 8;
    const M = n / N;

    const lambda = (M - m + 1) / Math.pow(2, m);
    const varWj = M * (1.0 / Math.pow(2.0, m) - (2.0 * m - 1.0) / Math.pow(2.0, 2.0 * m));

    if ((isNegative(lambda) || isZero(lambda)) || (sequence === null)) {
        return {
            "warning": `Лямбда ${lambda} не является положительной!\nНедостаточно памяти для требуемого рабочего пространства.`,
            "LAMBDA": undefined,
            "M": undefined,
            "N": undefined,
            "m": undefined,
            "n": undefined,
            "listTests": []
        }
    } else {

        let sum = 0.0;

        /* Compute Probabilities */
        for (let i = 0; i < 2; i++) {
            pi[i] = Math.exp(-lambda + i * Math.log(lambda) - cephes.lgam(i + 1));
            sum += pi[i];
        }

        pi[0] = sum;

        /* Compute Probabilities */
        for (let i = 2; i <= K; i++) {
            pi[i - 1] = Math.exp(-lambda + i * Math.log(lambda) - cephes.lgam(i + 1));
            sum += pi[i - 1];
        }

        pi[K] = 1 - sum;

        for (let jj = 0; jj < Math.min(MAXNUMOFTEMPLATES, numOfTemplates[m]); jj++) {

            sum = 0;
            let str = ''

            str += `${sequence[jj].join('')}   `

            for (let k = 0; k <= K; k++) {
                nu[k] = 0;
            }

            for (let i = 0; i < N; i++) {
                let W_obs = 0;
                for (let j = 0; j < M - m + 1; j++) {
                    let match = 1;
                    for (let k = 0; k < m; k++) {
                        if (sequence[jj][k] != bitsLine[i * M + j + k]) {
                            match = 0;
                            break;
                        }
                    }
                    if (match == 1) {
                        W_obs++;
                        j += m - 1;
                    }
                }
                Wj[i] = W_obs;
            }

            sum = 0;
            let chi2 = 0.0;

            /* Compute Chi Square */
            for (let i = 0; i < N; i++) {

                str += `${Wj[i]}   `

                chi2 += Math.pow((Wj[i] - lambda) / Math.pow(varWj, 0.5), 2);
            }

            str += `${chi2} `

            const p_value: number = cephes.igamc(N / 2.0, chi2 / 2.0);

            listPValue.push(p_value)

            if (isNegative(p_value) || isGreaterThanOne(p_value)) {
                str += `WARNING:  P_VALUE IS OUT OF RANGE. `
            } else {
                str += `${p_value} `
            }
            str += `${p_value < 0.01 ? "FAILURE" : "SUCCESS"} ${jj} `

        }
        return {
            "warning": ``,
            "LAMBDA": lambda,
            "M": M,
            "N": N,
            "m": m,
            "n": n,
            "listTests": []
        }
    }

}
