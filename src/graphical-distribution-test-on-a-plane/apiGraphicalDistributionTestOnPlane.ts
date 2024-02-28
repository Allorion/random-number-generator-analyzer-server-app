import express from "express";
import {FILE_DIRECTORY} from "../global-elements/fileDirectory";
import {readBitsFromFile, readTextFromFile} from "../global-elements/functions/readTextFromFile";
import {Canvas, createCanvas} from "canvas";

interface IReqData {
    nameFile: string,
    bitCount: number,
    zoom: 1 | 2 | 3 | 4,
    bitFlag: boolean,
}

const router = express.Router()

const generateImg = async (data: IReqData): Promise<Canvas> => {

    const zoom = data.zoom

    let size = Math.floor(Math.sqrt(data.bitCount))
    let count = size * size

    const width: number = data.bitFlag ? size : 256 * zoom
    const height: number = data.bitFlag ? size : 256 * zoom

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
        // Читаем биты из файла, используя функцию readBitsFromFile
        const buffer = readBitsFromFile(0, data.bitCount, FILE_DIRECTORY + data.nameFile);

        buffer.forEach((opt, index) => {
            if (index % 2 === 1) {
                const x = opt;
                const y = buffer[index - 1];

                ctx.fillStyle = "black"
                ctx.fillRect(x * zoom, y * zoom, 1, 1);

                // // Начинаем новый путь
                // ctx.beginPath();
                // // Рисуем окружность с центром в координатах точки и радиусом 1 пикселей
                // ctx.arc(x * zoom, y * zoom, 1, 0, Math.PI * 2);
                // // Закрываем путь
                // ctx.closePath();
                // // Обводим путь
                // ctx.stroke();
            }
        })

        return canvas
    }
}

const checkReqData = (elem: IReqData, warning: string[]) => {

    if (elem.nameFile === undefined || elem.nameFile === null) {
        warning.push(`Отсутствует название файла`)
    }
    if (elem.bitCount === undefined || elem.bitCount === null) {
        warning.push(`Отсутствует количество бит`)
    }
    if (elem.zoom === undefined || elem.zoom === null) {
        warning.push(`Отсутствует увеличение`)
    }
    if (elem.bitCount < 100) {
        warning.push(`Количество бит последовательности должно быть не менее 100`)
    }
    if (elem.bitCount > 1006000000) {
        warning.push(`Количество бит последовательности должно быть не более 1млн`)
    }
    if (elem.zoom < 0) {
        warning.push(`Увеличение должно быть больше 0`)
    }
    if (elem.zoom > 4) {
        warning.push(`Максимальное увеличение 4`)
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