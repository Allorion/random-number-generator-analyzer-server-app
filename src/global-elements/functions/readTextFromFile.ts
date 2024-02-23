import * as fs from 'fs';

// Функция, которая читает биты из файла, начиная с заданного смещения и длины
export function readBitsFromFile(startBit: number, bitCount: number, fileName: string): Buffer {
    // Открываем файл для чтения, используя fs.openSync
    const fd = fs.openSync(fileName, 'r');
    // Вычисляем размер буфера, который нужен для хранения битов
    const bufferSize = Math.ceil(bitCount / 8);
    // Создаем буфер нужного размера, используя Buffer.alloc
    const buffer = Buffer.alloc(bufferSize);
    // Вычисляем смещение в файле, откуда начинать чтение, в байтах
    const fileOffset = Math.floor(startBit / 8);
    // Вычисляем смещение в буфере, куда начинать запись, в байтах
    const bufferOffset = 0;
    // Читаем байты из файла в буфер, используя fs.readSync
    fs.readSync(fd, buffer, bufferOffset, bufferSize, fileOffset);
    // Закрываем файл, используя fs.closeSync
    fs.closeSync(fd);
    // Возвращаем буфер
    return buffer;
}

// Функция, которая принимает буфер из единиц и нулей и преобразует его в массив чисел
function bufferToNumberArray(buffer: Buffer): number[] {
    // Создаем пустой массив для хранения чисел
    const array: number[] = [];
    // Проходим по каждому байту в буфере
    for (let i = 0; i < buffer.length; i++) {
        // Получаем значение байта, используя readUInt8 и указывая смещение
        const byte = buffer.readUInt8(i);
        // Проходим по каждому биту в байте
        for (let j = 0; j < 8; j++) {
            // Получаем значение бита, используя побитовое И и сдвиг вправо
            const bit = (byte & (1 << (7 - j))) >> (7 - j);
            // Добавляем бит к массиву
            array.push(bit);
        }
    }
    // Возвращаем массив
    return array;
}

// Функция, которая читает текст из файла, начиная с заданного индекса и длины
export const readTextFromFile = async (index: number, length: number, nameFile: string, FILE_DIRECTORY: string) => {
    return new Promise((resolve: (value: number[]) => void): void => {
        // Читаем биты из файла, используя функцию readBitsFromFile
        const buffer = readBitsFromFile(index, length, FILE_DIRECTORY + nameFile);
        // Преобразуем буфер в массив чисел, используя функцию bufferToNumberArray
        const array = bufferToNumberArray(buffer);
        // Возвращаем массив
        resolve(array);
    })
}
