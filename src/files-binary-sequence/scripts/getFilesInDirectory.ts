//**********************************************************************************************************************
// Скрип для получения всех файлов с последовательностями из директории
//**********************************************************************************************************************

import * as fs from 'fs';

export function getFilesInDirectory(directoryPath: string): string[] {
    // Получите список файлов в директории
    const files = fs.readdirSync(directoryPath);

    // Отфильтруйте только файлы, исключая директории
    return files
        .filter((fileName) => fs.statSync(`${directoryPath}/${fileName}`).isFile())
        .map((fileName) => `${fileName}`);
}



