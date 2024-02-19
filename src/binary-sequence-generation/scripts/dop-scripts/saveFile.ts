//**********************************************************************************************************************
// Скрип для сохранения файлов с бинарными последовательностями
//**********************************************************************************************************************


import * as fs from 'fs';

export function writeBinarySequenceToFile(filePath: string, binarySequence: string): boolean {

    const maxLength = 1000000; // Максимальная длина строки

    try {
        const writeStream = fs.createWriteStream('src/binary-sequence-generation/storage-files/' + filePath, {flags: 'a'}); // Флаг 'a' для дополнительной записи
        writeStream.write(binarySequence);

        if (binarySequence.length >= maxLength) {
            // Перейти на новую строку
            writeStream.write('\n');
        }

        writeStream.close(); // Закрыть поток записи
        return true; // Вернуть true, файл успешно создан
    } catch (error: any) {
        console.error("Error writing to file: " + error.message);
        return false; // Вернуть false, файл не создан
    }
}
