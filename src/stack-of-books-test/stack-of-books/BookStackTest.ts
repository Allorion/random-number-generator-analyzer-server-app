// *********************************************************************************************************************
// Класс, который реализует тест "Стопка книг" для последовательности бит
// *********************************************************************************************************************

import {IResultBookStackTest} from "../types/TypeStackOfBooks";

const cephes = require('cephes');

export class BookStackTest {
    // Свойство, которое хранит последовательность бит
    bits: number[];
    // Свойство, которое хранит длину блока
    blockSize: number;
    // Свойство, которое хранит уровень значимости
    alpha: number;
    // Свойство, которое хранит массив частот блоков
    private frequencies: number[];
    // Свойство, которое хранит статистику хи-квадрат
    private chi: number;
    // Свойство, которое хранит количество степеней свободы
    private df: number;
    // Свойство, которое хранит результат теста
    private passed: boolean;
    // Свойство, которое хранит результат вычисления pValue
    private pValue: number;
    // Свойство, которое хранит сравнение pValue и ALPHA
    private resultPValue: 'FAILURE' | 'SUCCESS';

    // Конструктор, который принимает последовательность бит, длину блока и уровень значимости в качестве аргументов и инициализирует свойства
    constructor(bits: number[], blockSize: number, alpha: number) {
        this.bits = bits;
        this.blockSize = blockSize;
        this.alpha = alpha;
        this.frequencies = [];
        this.chi = 0;
        this.df = 0;
        this.passed = false;
        this.pValue = 0.000000;
        this.resultPValue = 'FAILURE';
    }

    // Метод, который вычисляет массив частот блоков
    private countBlocks(): void {
        // Вычисляем количество возможных блоков
        let numBlocks = Math.pow(2, this.blockSize);
        // Создаем массив частот, заполненный нулями
        this.frequencies = new Array(numBlocks).fill(0);
        // Проходим по последовательности бит, беря блоки фиксированной длины
        for (let i = 0; i < this.bits.length - this.blockSize + 1; i++) {
            // Преобразуем блок бит в десятичное число
            let block = 0;
            for (let j = 0; j < this.blockSize; j++) {
                block = block * 2 + this.bits[i + j];
            }
            // Увеличиваем частоту соответствующего блока на единицу
            this.frequencies[block]++;
        }
    }

    // Метод, который вычисляет статистику хи-квадрат
    private chiSquare(): void {
        // Вычисляем общее количество блоков
        let total = this.frequencies.reduce((a, b) => a + b, 0);
        // Вычисляем ожидаемое количество блоков для равномерного распределения
        let expected = total / this.frequencies.length;
        // Вычисляем сумму квадратов отклонений от ожидаемого значения, деленных на ожидаемое значение
        this.chi = this.frequencies.reduce(
            (a, b) => a + Math.pow(b - expected, 2) / expected,
            0
        );
    }

    // Метод, который проверяет, прошел ли тест
    private chiTest(): void {
        // Вычисляем количество степеней свободы
        this.df = this.frequencies.length - 1;
        // Вычисляем критическое значение хи-квадрат для заданных степеней свободы и уровня значимости
        // Используем функцию cephes.chdtri, которая возвращает обратное значение хи-квадрат распределения
        let chiCritical = cephes.chdtri(this.df, this.alpha);
        // Сравниваем статистику хи-квадрат с критическим значением
        // Если статистика больше критического значения, то тест не пройден
        // Если статистика меньше или равна критическому значению, то тест пройден
        this.passed = this.chi <= chiCritical;
    }

    private resPValue(): void {
        // Вычисляем p-значение с помощью функции cephes.igamc
        this.pValue = cephes.igamc(this.df / 2, this.chi / 2).toFixed(6);
        this.resultPValue = this.pValue < this.alpha ? "FAILURE" : "SUCCESS";
    }

    // Метод, который запускает тест и выводит результат
    public runTest(): IResultBookStackTest {
        // Вычисляем массив частот блоков
        this.countBlocks();
        // Вычисляем статистику хи-квадрат
        this.chiSquare();
        // Проверяем, прошел ли тест
        this.chiTest();
        // Проверяем, прошел ли тест по значению pValue
        this.resPValue();
        // Выводим результат
        return {
            frequencies: this.frequencies,
            chi: this.chi.toFixed(2),
            df: this.df,
            alpha: this.alpha,
            passed: this.passed,
            pValue: this.pValue,
            resultPValue: this.resultPValue
        }
    }
}

// [
//     {
//         "result": [
//             {
//                 "frequencies": [
//                     24921,
//                     25032,
//                     25032,
//                     25014
//                 ],
//                 "chi": "0.34",
//                 "df": 3,
//                 "alpha": 0.05,
//                 "passed": true,
//                 "pValue": "0.952457",
//                 "resultPValue": "SUCCESS"
//             },
//             {
//                 "frequencies": [
//                     25431,
//                     24976,
//                     24977,
//                     24615
//                 ],
//                 "chi": "13.40",
//                 "df": 3,
//                 "alpha": 0.05,
//                 "passed": false,
//                 "pValue": "0.003840",
//                 "resultPValue": "FAILURE"
//             },
//             {
//                 "frequencies": [
//                     25184,
//                     24847,
//                     24847,
//                     25121
//                 ],
//                 "chi": "3.81",
//                 "df": 3,
//                 "alpha": 0.05,
//                 "passed": false,
//                 "pValue": "0.282421",
//                 "resultPValue": "SUCCESS"
//             },
//             {
//                 "frequencies": [
//                     24947,
//                     24994,
//                     24995,
//                     25063
//                 ],
//                 "chi": "0.27",
//                 "df": 3,
//                 "alpha": 0.05,
//                 "passed": true,
//                 "pValue": "0.964923",
//                 "resultPValue": "SUCCESS"
//             },
//             {
//                 "frequencies": [
//                     25353,
//                     24845,
//                     24845,
//                     24956
//                 ],
//                 "chi": "6.98",
//                 "df": 3,
//                 "alpha": 0.05,
//                 "passed": false,
//                 "pValue": "0.072414",
//                 "resultPValue": "SUCCESS"
//             },
//             {
//                 "frequencies": [
//                     25078,
//                     24926,
//                     24927,
//                     25068
//                 ],
//                 "chi": "0.86",
//                 "df": 3,
//                 "alpha": 0.05,
//                 "passed": true,
//                 "pValue": "0.834944",
//                 "resultPValue": "SUCCESS"
//             },
//             {
//                 "frequencies": [
//                     25338,
//                     24838,
//                     24838,
//                     24985
//                 ],
//                 "chi": "6.68",
//                 "df": 3,
//                 "alpha": 0.05,
//                 "passed": false,
//                 "pValue": "0.082889",
//                 "resultPValue": "SUCCESS"
//             },
//             {
//                 "frequencies": [
//                     24879,
//                     24994,
//                     24995,
//                     25131
//                 ],
//                 "chi": "1.27",
//                 "df": 3,
//                 "alpha": 0.05,
//                 "passed": true,
//                 "pValue": "0.735192",
//                 "resultPValue": "SUCCESS"
//             },
//             {
//                 "frequencies": [
//                     24823,
//                     25040,
//                     25040,
//                     25096
//                 ],
//                 "chi": "1.75",
//                 "df": 3,
//                 "alpha": 0.05,
//                 "passed": false,
//                 "pValue": "0.625918",
//                 "resultPValue": "SUCCESS"
//             },
//             {
//                 "frequencies": [
//                     24995,
//                     24937,
//                     24938,
//                     25129
//                 ],
//                 "chi": "0.98",
//                 "df": 3,
//                 "alpha": 0.05,
//                 "passed": true,
//                 "pValue": "0.806294",
//                 "resultPValue": "SUCCESS"
//             }
//         ],
//         "nameFile": "cryptoSequence:1000000:19.02.2024, 09:55:35.txt",
//         "blockSize": 2,
//         "bitstreams": 10,
//         "numberOfBits": 100000,
//         "quantityCompletedTests": 5
//     }
// ]