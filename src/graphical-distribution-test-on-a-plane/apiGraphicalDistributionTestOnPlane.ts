import express from "express";
import {FILE_DIRECTORY} from "../global-elements/fileDirectory";
import {readBitsFromFile, readTextFromFile} from "../global-elements/functions/readTextFromFile";
import {Canvas, createCanvas} from "canvas";

interface IReqData {
    nameFile: string,
    bitCount: number,
    bitFlag: boolean,
    fillingDensity: boolean,
}

const router = express.Router()

const fillingDensityFunc = async (data: IReqData, canvas: Canvas, ctx: any): Promise<Canvas> => {
    // Читаем биты из файла, используя функцию readBitsFromFile
    const buffer: Buffer = readBitsFromFile(0, data.bitCount, FILE_DIRECTORY + data.nameFile);

    // Создаем объект для хранения координат и количества точек
    const result: Record<string, { x: number; y: number; curVal: number }> = {};

    // Находим максимальное количество точек в одной координате
    let maxVal: number = 0;

    // Проходим по буферу парами значений
    for (let i: number = 0; i < buffer.length; i += 2) {
        // Получаем координаты x и y из буфера
        const x: number = buffer[i + 1];
        const y: number = buffer[i];

        // Формируем ключ из координат
        const key: string = `${x}:${y}`;

        // Если точка уже существует, увеличиваем счетчик на 1
        if (result[key]) {
            result[key].curVal++;

            // Обновляем максимальное значение, если нужно
            maxVal = Math.max(maxVal, result[key].curVal);
        } else {
            // Иначе, добавляем точку с счетчиком 1
            result[key] = {curVal: 1, x, y};
        }
    }

    // Проходим по всем точкам в результате
    for (const [key, value] of Object.entries(result)) {
        // Вычисляем прозрачность точки в зависимости от количества
        const alpha: number = value.curVal / maxVal;

        // Задаем цвет точки с прозрачностью
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;

        // Рисуем точку на холсте
        ctx.fillRect(value.x, value.y, 1, 1);
    }

    // Возвращаем холст
    return canvas;
};


const generateImg = async (data: IReqData): Promise<Canvas> => {

    let size = Math.floor(Math.sqrt(data.bitCount))
    let count = size * size

    const width: number = data.bitFlag ? size : 256
    const height: number = data.bitFlag ? size : 256

    const canvas = createCanvas(width, height);

    // Получаем контекст для рисования на холсте
    const ctx = canvas.getContext('2d');

    // Заливаем холст белым цветом
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    // Устанавливаем цвет и толщину линии для рисования точек
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;

    if (data.bitFlag) {

        let bitsLine: number[] = await readTextFromFile(0, count, data.nameFile, FILE_DIRECTORY)

        let x: number = size - 1
        let y: number = 0

        for (let i: number = 0; i < count; i++) {

            ctx.fillStyle = bitsLine[i] === 1 ? "black" : 'white';

            ctx.fillRect(x, y, 1, 1); // Задать ширину и высоту пикселя равными 1

            if (x === size - 1) {
                y++
                x = 0
            } else {
                x++
            }
        }

        return canvas
    } else {

        if (data.fillingDensity) {

            return await fillingDensityFunc(data, canvas, ctx)

        } else {

            // Читаем биты из файла, используя функцию readBitsFromFile
            const buffer = readBitsFromFile(0, data.bitCount, FILE_DIRECTORY + data.nameFile);

            buffer.forEach((opt, index) => {
                if (index % 2 === 1) {
                    const x = opt;
                    const y = buffer[index - 1];

                    ctx.fillStyle = "black"
                    ctx.fillRect(x, y, 1, 1);
                }
            })

            return canvas
        }
    }
}

const checkReqData = (elem: IReqData, warning: string[]) => {

    if (elem.nameFile === undefined || elem.nameFile === null) {
        warning.push(`Отсутствует название файла`)
    }
    if (elem.bitCount === undefined || elem.bitCount === null) {
        warning.push(`Отсутствует количество бит`)
    }
    if (elem.bitCount < 100) {
        warning.push(`Количество бит последовательности должно быть не менее 100`)
    }
    if (elem.bitCount > 1006000000) {
        warning.push(`Количество бит последовательности должно быть не более 1млн`)
    }
}

router.post('/start-analysis', async (req, res) => {

    const reqData: IReqData = req.body

    const warning: string[] = []

    checkReqData(reqData, warning)

    if (warning.length === 0) {
        try {
            // Создаем распределение на плоскости
            const resData = await generateImg(reqData)
            // Устанавливаем заголовок Content-Type как "image/png"
            res.type("png");
            // Отправляем буфер изображения в теле ответа
            res.status(200).send(resData.toBuffer("image/png"));
            // Завершаю отправку
            res.end()
        } catch (e) {
            res.status(500).json(e)
        }
    } else {
        res.status(500).json(warning)
    }
})

export = router