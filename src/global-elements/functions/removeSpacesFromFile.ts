import fs from "fs";



export const removeSpacesFromFile = async (fileName: string, FILE_DIRECTORY: string) => {
    // Читаем содержимое файла в виде строки
    const text = fs.readFileSync(FILE_DIRECTORY + fileName, "utf8");
    // Удаляем все пробелы из строки с помощью регулярного выражения
    const newText = text.replace(/\s/g, ""); // \s - регулярное выражение для пробелов
    // Перезаписываем файл с новым текстом
    fs.writeFileSync(FILE_DIRECTORY + fileName, newText, "utf8");
}