import {readFileSync} from 'fs';
import {saveBinFile} from "./dop-scripts/saveBinFile";

// Функция для выполнения побитового XOR над парами чисел с учетом нового условия
function performXOR(numbers: number[]): Buffer {
    const result: number[] = [];
    for (let i = 0; i < numbers.length; i++) {
        let j = i + 1;
        // Поиск следующего отличного числа, если текущая пара одинакова
        while (numbers[j] === numbers[i]) {
            j++;
        }
        if (numbers[j] !== undefined) {
            result.push(numbers[i] ^ numbers[j]);
            i = j; // Пропускаем проверенные числа
        } else {
            // Если достигнут конец массива, прерываем цикл
            break;
        }
    }
    return Buffer.from(result);
}

// Функция для чтения чисел из файла и записи результата в другой файл
export function processFile(inputFilePath: string, filePath: string): {
    flag: boolean,
    text: string
} {
    try {

        // Чтение содержимого файла и преобразование в массив чисел
        const fileContent = readFileSync(inputFilePath, 'utf-8');
        const numbers = fileContent.split(',').map(num => parseInt(num.trim(), 10));

        // Выполнение побитового XOR
        const xorResults = performXOR(numbers);

        saveBinFile(xorResults, filePath);

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


// Функция для перекодирования Buffer в number
// function bufferToBitArray(buffer: Buffer): number[] {
//     const bitArray: number[] = [];
//     for (let i = 0; i < buffer.length; i++) {
//         const byte = buffer[i];
//         for (let j = 7; j >= 0; j--) {
//             bitArray.push((byte >> j) & 1);
//         }
//     }
//     return bitArray;
// }