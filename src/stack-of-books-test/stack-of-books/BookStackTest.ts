// *********************************************************************************************************************
// Класс, который реализует тест "Стопка книг" для последовательности бит
// *********************************************************************************************************************

import {IResultBookStackTest} from "../types/TypeStackOfBooks";

const cephes = require('cephes');

// Таблица критических значений хи-квадрат
const chiSquareCriticalValues: { [key: number]: number } = {
    1: 3.841,
    2: 5.991,
    3: 7.815,
    4: 9.488,
    5: 11.070,
    6: 12.592,
    7: 14.067,
    8: 15.507,
    9: 16.919,
    10: 18.307,
    11: 19.675,
    12: 21.026,
    13: 22.362,
    14: 23.685,
    15: 24.996,
    16: 26.296,
    17: 27.587,
    18: 28.869,
    19: 30.144,
    20: 31.410,
    21: 32.671,
    22: 33.924,
    23: 35.172,
    24: 36.415,
    25: 37.652,
    26: 38.885,
    27: 40.113,
    28: 41.337,
    29: 42.557,
    30: 43.773,
};

class BookStackTestHelper {
    static calculateExpectedFrequency(totalBlocks: number, blockSize: number): number {
        return totalBlocks / Math.pow(2, blockSize);
    }

    static calculateExpectedFrequencies(totalBlocks: number, blockSize: number): number[] {
        const expectedFrequency = this.calculateExpectedFrequency(totalBlocks, blockSize);
        return new Array(Math.pow(2, blockSize)).fill(expectedFrequency);
    }
}

class ChiSquareCritical {
    static chiSquareCritical(df: number): number {
        // Если df есть в таблице, возвращаем соответствующее критическое значение
        if (chiSquareCriticalValues.hasOwnProperty(df)) {
            return chiSquareCriticalValues[df];
        }

        // Если df нет в таблице, выполняем линейную интерполяцию между ближайшими значениями
        const dfKeys = Object.keys(chiSquareCriticalValues).map(Number).sort((a, b) => a - b);
        let lowerDf = dfKeys.find(key => key < df) || dfKeys[0];
        let upperDf = dfKeys.find(key => key > df) || dfKeys[dfKeys.length - 1];

        // Выполняем линейную интерполяцию
        let lowerValue = chiSquareCriticalValues[lowerDf];
        let upperValue = chiSquareCriticalValues[upperDf];
        return lowerValue + ((upperValue - lowerValue) * (df - lowerDf)) / (upperDf - lowerDf);
    }
}

export class BookStackTest {
    bits: number[];
    blockSize: number;
    alpha: number;
    private frequencies: number[];
    private chi: number;
    private df: number;
    private passed: boolean;
    private pValue: number;
    private resultPValue: 'FAILURE' | 'SUCCESS';

    constructor(bits: number[], blockSize: number, alpha: number) {
        this.bits = bits;
        this.blockSize = blockSize;
        this.alpha = alpha;
        this.frequencies = [];
        this.chi = 0;
        this.df = 0;
        this.passed = false;
        this.pValue = 0;
        this.resultPValue = 'FAILURE';
    }

    private countBlocks(): void {
        let numBlocks = Math.pow(2, this.blockSize);
        this.frequencies = new Array(numBlocks).fill(0);
        for (let i = 0; i < this.bits.length - this.blockSize + 1; i++) {
            let block = 0;
            for (let j = 0; j < this.blockSize; j++) {
                block = block * 2 + this.bits[i + j];
            }
            this.frequencies[block]++;
        }
    }

    private chiSquare(): void {
        let total = this.frequencies.reduce((a, b) => a + b, 0);
        let expectedFrequencies = BookStackTestHelper.calculateExpectedFrequencies(total, this.blockSize);
        this.chi = 0;
        for (let i = 0; i < expectedFrequencies.length; i++) {
            this.chi += Math.pow(this.frequencies[i] - expectedFrequencies[i], 2) / expectedFrequencies[i];
        }
    }

    private chiTest(): void {
        this.df = this.frequencies.length - 1;
        let chiCritical = ChiSquareCritical.chiSquareCritical(this.df);
        this.passed = this.chi <= chiCritical;
    }

    private resPValue(): void {
        try {
            this.pValue = cephes.igamc(this.df / 2, this.chi / 2);
            this.resultPValue = this.pValue < this.alpha ? "FAILURE" : "SUCCESS";
        } catch (e) {
            this.pValue = 0;
            this.resultPValue = "FAILURE";
        }
    }

    public runTest(): IResultBookStackTest {
        this.countBlocks();
        this.chiSquare();
        this.chiTest();
        this.resPValue();
        return {
            frequencies: this.frequencies,
            chi: this.chi,
            df: this.df,
            alpha: this.alpha,
            passed: this.passed,
            pValue: this.pValue,
            resultPValue: this.resultPValue,
            chiCritical: chiSquareCriticalValues[this.df]
        }
    }
}


// export class BookStackTest {
//     bits: number[];
//     blockSize: number;
//     alpha: number;
//     private frequencies: number[];
//     private chi: number;
//     private df: number;
//     private passed: boolean;
//     private pValue: number;
//     private resultPValue: 'FAILURE' | 'SUCCESS';
//
//     constructor(bits: number[], blockSize: number, alpha: number) {
//         this.bits = bits;
//         this.blockSize = blockSize;
//         this.alpha = alpha;
//         this.frequencies = [];
//         this.chi = 0;
//         this.df = 0;
//         this.passed = false;
//         this.pValue = 0;
//         this.resultPValue = 'FAILURE';
//     }
//
//     private countBlocks(): void {
//         let numBlocks = Math.pow(2, this.blockSize);
//         this.frequencies = new Array(numBlocks).fill(0);
//         for (let i = 0; i < this.bits.length - this.blockSize + 1; i++) {
//             let block = 0;
//             for (let j = 0; j < this.blockSize; j++) {
//                 block = block * 2 + this.bits[i + j];
//             }
//             this.frequencies[block]++;
//         }
//     }
//
//     private chiSquare(): void {
//         let total = this.frequencies.reduce((a, b) => a + b, 0);
//         let expected = total / this.frequencies.length;
//         this.chi = this.frequencies.reduce(
//             (a, b) => a + Math.pow(b - expected, 2) / expected,
//             0
//         );
//     }
//
//     private chiTest(): void {
//         this.df = this.frequencies.length - 1;
//         let chiCritical = cephes.chdtri(this.df, this.alpha);
//         this.passed = this.chi <= chiCritical;
//     }
//
//     private resPValue(): void {
//         try {
//             this.pValue = cephes.igamc(this.df / 2, this.chi / 2);
//             this.resultPValue = this.pValue < this.alpha ? "FAILURE" : "SUCCESS";
//         } catch (e) {
//             this.pValue = 0;
//             this.resultPValue = "FAILURE";
//         }
//     }
//
//     public runTest(): IResultBookStackTest {
//         this.countBlocks();
//         this.chiSquare();
//         this.chiTest();
//         this.resPValue();
//         return {
//             frequencies: this.frequencies,
//             chi: this.chi,
//             df: this.df,
//             alpha: this.alpha,
//             passed: this.passed,
//             pValue: this.pValue,
//             resultPValue: this.resultPValue
//         }
//     }
// }
