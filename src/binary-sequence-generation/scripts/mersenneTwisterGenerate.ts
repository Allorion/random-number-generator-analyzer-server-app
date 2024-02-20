//**********************************************************************************************************************
// Скрип для генерации файла с бинарной последовательностью с помощью модуля MersenneTwister19937 из random-js
//**********************************************************************************************************************


import * as fs from 'fs';
import {MersenneTwister19937, integer} from 'random-js';
import {saveBinFile} from "./dop-scripts/saveBinFile";

// Функция, которая генерирует буфер из единиц и нулей заданной длины
function generateMersenneTwisterChunk(length: number): Buffer {
    const engine = MersenneTwister19937.autoSeed();
    // Создаем буфер нужного размера, используя Buffer.alloc
    const buffer = Buffer.alloc(Math.ceil(length / 8));
    // Создаем переменную для хранения текущего байта
    let byte = 0;
    // Создаем переменную для хранения текущего смещения в буфере
    let offset = 0;
    // Проходим по длине последовательности
    for (let i = 0; i < length; i++) {
        const bit = integer(0, 1)(engine);
        // Добавляем бит к текущему байту, сдвигая его на один разряд влево
        byte = (byte << 1) | bit;
        // Проверяем, если мы сгенерировали 8 бит, то есть один байт
        if ((i + 1) % 8 === 0) {
            // Записываем байт в буфер, используя writeUInt8 и указывая смещение
            buffer.writeUInt8(byte, offset);
            // Обнуляем байт
            byte = 0;
            // Увеличиваем смещение на 1
            offset++;
        }
    }
    // Проверяем, если остались незаполненные биты в последнем байте
    if (length % 8 !== 0) {
        // Сдвигаем байт на нужное количество разрядов влево, чтобы заполнить нулями
        byte = byte << (8 - length % 8);
        // Записываем байт в буфер, используя writeUInt8 и указывая смещение
        buffer.writeUInt8(byte, offset);
    }
    // Возвращаем буфер
    return buffer;
}

export function mersenneTwisterGenerate(length: number, filePath: string): {
    flag: boolean,
    text: string
} {
    const chunkSize = 1000000; // Размер порции данных
    const totalChunks = Math.ceil(length / chunkSize);

    try {
        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            // Генерируем буфер из единиц и нулей, используя функцию generateBinarySequenceChunk
            const buffer = generateMersenneTwisterChunk(chunkSize);
            // Используем функцию saveBinFile вместо saveBinFileHex
            saveBinFile(buffer, filePath);
        }
        return {
            flag: true,
            text: 'OK'
        };  // Вернуть true при успешном завершении
    } catch (error: any) {
        console.error("Error writing to file: " + error.message);
        return {
            flag: false,
            text: error.message
        }; // Вернуть false в случае ошибки
    }
}

