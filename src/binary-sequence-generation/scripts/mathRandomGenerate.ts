//**********************************************************************************************************************
// Скрип для генерации файла с бинарной последовательностью с помощью модуля Match.random
//**********************************************************************************************************************


import * as fs from 'fs';

function generateBinarySequenceChunk(length: number): string {
    let binarySequence = '';
    for (let i = 0; i < length; i++) {
        binarySequence += Math.random() < 0.5 ? '0' : '1';
    }
    return binarySequence;
}

export function mathRandomGenerate(length: number, frequency: number | undefined, filePath: string): {
    flag: boolean,
    text: string
} {
    const chunkSize = 1000000; // Размер порции данных
    const totalChunks = Math.ceil(length / chunkSize);

    try {
        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            const binarySequence = generateBinarySequenceChunk(chunkSize);
            fs.appendFileSync(filePath, binarySequence);
            if (chunkIndex < totalChunks - 1) {
                fs.appendFileSync(filePath, '\n'); // Добавить новую строку после каждой порции
            }
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
