// Функция для чтения текста из файла по индексу и количеству символов
import fs from "fs";

export const readTextFromFile = async (index: number, length: number, nameFile: string, FILE_DIRECTORY: string) => {
    return new Promise((resolve: (value: number[]) => void): void => { // Изменить типы здесь
        // Создаем поток для чтения файла
        const stream = fs.createReadStream(FILE_DIRECTORY + nameFile, {
            // Указываем кодировку файла
            encoding: "utf-8",
            // Указываем начальную и конечную позицию в байтах
            start: index,
            end: index + length - 1,
            highWaterMark: 256 * 1024
        });
        // Объявляем переменную для хранения результата
        let result: number[] = [];
        // Подписываемся на событие 'data', которое срабатывает при получении части данных
        stream.on("data", (chunk: string) => {
            // Добавляем часть данных к результату
            result = chunk.split("").map((s) => Number(s));
        });

        // Подписываемся на событие 'end', которое срабатывает при окончании чтения файла
        stream.on("end", () => {
            // Возвращаем результат
            resolve(result); // Использовать resolve здесь
        });
    })
}