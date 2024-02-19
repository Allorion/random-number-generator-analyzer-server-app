//**********************************************************************************************************************
// Скрип для генерации файла с бинарной последовательностью с помощью модуля MersenneTwister19937 из random-js
//**********************************************************************************************************************



import * as fs from 'fs';
import {MersenneTwister19937, integer} from 'random-js';

function generateMersenneTwisterChunk(length: number): string {
    const engine = MersenneTwister19937.autoSeed();
    let binarySequence = '';

    for (let i = 0; i < length; i++) {
        const randomBit = integer(0, 1)(engine);
        binarySequence += randomBit.toString();
    }

    return binarySequence;
}

export function mersenneTwisterGenerate(length: number, filePath: string): {
    flag: boolean,
    text: string
} {
    const chunkSize = 1000000; // Размер порции данных
    const totalChunks = Math.ceil(length / chunkSize);

    try {
        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            const binarySequence = generateMersenneTwisterChunk(chunkSize);
            fs.appendFileSync(filePath, binarySequence);
            if (chunkIndex < totalChunks - 1) {
                fs.appendFileSync(filePath, '\n'); // Добавить новую строку после каждой порции
            }
        }
        return {
            flag: true,
            text: 'OK'
        }; // Вернуть true при успешном завершении
    } catch (error: any) {
        return {
            flag: false,
            text: error.message
        }; // Вернуть false в случае ошибки
    }
}
