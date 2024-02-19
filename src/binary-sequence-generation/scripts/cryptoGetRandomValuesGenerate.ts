//**********************************************************************************************************************
// Скрип для генерации файла с бинарной последовательностью с помощью модуля Сrypto
//**********************************************************************************************************************

import * as fs from 'fs';
import * as crypto from 'crypto';

function generateCryptoChunk(length: number): string {
    const randomValues = crypto.randomBytes(Math.ceil(length / 8));

    let binarySequence = '';
    for (let i = 0; i < length; i++) {
        const byteIndex = Math.floor(i / 8);
        const bitIndex = i % 8;
        const bitValue = (randomValues[byteIndex] >> bitIndex) & 1;
        binarySequence += bitValue.toString();
    }

    return binarySequence;
}

export function generateCryptoSequence(length: number, filePath: string): {
    flag: boolean,
    text: string
} {
    const chunkSize = 1000000; // Размер порции данных
    const totalChunks = Math.ceil(length / chunkSize);

    try {
        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            const binarySequence = generateCryptoChunk(chunkSize);
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
