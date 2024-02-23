import express from "express";
import {FILE_DIRECTORY} from "../global-elements/fileDirectory";
import {readBitsFromFile} from "../global-elements/functions/readTextFromFile";
import {Canvas, createCanvas} from "canvas";

interface IReqData {
    nameFile: string,
    bitCount: number,
    zoom: 1 | 2 | 3 | 4
}

const router = express.Router()

const generateImg = async (data: IReqData): Promise<Canvas> => {

    // Читаем биты из файла, используя функцию readBitsFromFile
    const buffer = readBitsFromFile(0, data.bitCount, FILE_DIRECTORY + data.nameFile);

    const zoom = data.zoom

    const width: number = 255 * zoom
    const height: number = 255 * zoom

    const canvas = createCanvas(width, height);

    // Получаем контекст для рисования на холсте
    const ctx = canvas.getContext('2d');

    // Заливаем холст белым цветом
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    // Устанавливаем цвет и толщину линии для рисования точек
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;

    buffer.forEach((opt, index) => {
        if (index % 2 === 1) {
            const x = opt;
            const y = buffer[index - 1];
            // Начинаем новый путь
            ctx.beginPath();
            // Рисуем окружность с центром в координатах точки и радиусом 1 пикселей
            ctx.arc(x * zoom, y * zoom, 1, 0, Math.PI * 2);
            // Закрываем путь
            ctx.closePath();
            // Обводим путь
            ctx.stroke();
        }
    })

    return canvas

}

router.post('/test', async (req, res) => {

    const reqData: IReqData = req.body

    const warning: string[] = []

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