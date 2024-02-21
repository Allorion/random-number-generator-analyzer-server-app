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