import java.io.*;
import java.util.*;

public class BinarySequenceGenerator {

    // Метод для генерации бинарной последовательности заданной длины
    public static String generateBinarySequence(int length) {
        // Создаем объект класса Random для генерации случайных чисел
        Random random = new Random();
        // Создаем объект класса StringBuilder для построения строки
        StringBuilder sb = new StringBuilder();
        // Повторяем length раз
        for (int i = 0; i < length; i++) {
            // Генерируем случайное число 0 или 1 и добавляем его к строке
            sb.append(random.nextInt(2));
        }
        // Возвращаем строку
        return sb.toString();
    }

    // Метод для сохранения строки в файл
    public static void saveToFile(String s, String fileName) {
        // Создаем объект класса File для представления файла
        File file = new File(fileName);
        // Создаем объект класса PrintWriter для записи в файл
        try (PrintWriter pw = new PrintWriter(file)) {
            // Записываем строку в файл
            pw.println(s);
            // Закрываем поток
            pw.close();
        } catch (FileNotFoundException e) {
            // Обрабатываем исключение
            e.printStackTrace();
        }
    }

    // Главный метод
    public static void main(String[] args) {
        // Задаем длину бинарной последовательности
        int length = 1000000;
        // Генерируем бинарную последовательность
        String binarySequence = generateBinarySequence(length);
        // Выводим последовательность на экран
        System.out.println(binarySequence);
        // Сохраняем последовательность в файл
        saveToFile(binarySequence, "binary.txt");
    }
}
