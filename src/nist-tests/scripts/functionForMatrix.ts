import {BitSequence} from "../types/INistTestTypes";

export function createMatrix(rows: number, cols: number): BitSequence[][] {
    const matrix: BitSequence[][] = [];

    for (let i = 0; i < rows; i++) {
        matrix[i] = [];
        for (let j = 0; j < cols; j++) {
            matrix[i][j] = 0; // Инициализируйте элементы матрицы по умолчанию значением 0 (или другими значениями по вашему выбору).
        }
    }

    return matrix;
}

export const defMatrix = (M: number, Q: number, m: BitSequence[][], k: number, bitsLine: number[]): void => {

    for (let i = 0; i < M; i++) {
        for (let j = 0; j < Q; j++) {
            m[i][j] = bitsLine[k * (M * Q) + j + i * M] as BitSequence;
        }
    }
}

export function computeRank(M: number, Q: number, matrix: BitSequence[][]): number {
    const m = Math.min(M, Q);

    // FORWARD APPLICATION OF ELEMENTARY ROW OPERATIONS
    for (let i = 0; i < m - 1; i++) {
        if (matrix[i][i] === 1) {
            performElementaryRowOperations(MatrixOperation.FORWARD_ELIMINATION, i, M, Q, matrix);
        } else {
            if (findUnitElementAndSwap(MatrixOperation.FORWARD_ELIMINATION, i, M, Q, matrix) === 1) {
                performElementaryRowOperations(MatrixOperation.FORWARD_ELIMINATION, i, M, Q, matrix);
            }
        }
    }

    // BACKWARD APPLICATION OF ELEMENTARY ROW OPERATIONS
    for (let i = m - 1; i > 0; i--) {
        if (matrix[i][i] === 1) {
            performElementaryRowOperations(MatrixOperation.BACKWARD_ELIMINATION, i, M, Q, matrix);
        } else {
            if (findUnitElementAndSwap(MatrixOperation.BACKWARD_ELIMINATION, i, M, Q, matrix) === 1) {
                performElementaryRowOperations(MatrixOperation.BACKWARD_ELIMINATION, i, M, Q, matrix);
            }
        }
    }

    return determineRank(m, M, Q, matrix);
}

enum MatrixOperation {
    FORWARD_ELIMINATION,
    BACKWARD_ELIMINATION,
}

function performElementaryRowOperations(
    flag: MatrixOperation,
    i: number,
    M: number,
    Q: number,
    A: BitSequence[][]
): void {
    let j, k;

    if (flag === MatrixOperation.FORWARD_ELIMINATION) {
        for (j = i + 1; j < M; j++) {
            if (A[j][i] === 1) {
                for (k = i; k < Q; k++) {
                    A[j][k] = (A[j][k] + A[i][k]) % 2 as BitSequence;
                }
            }
        }
    } else {
        for (j = i - 1; j >= 0; j--) {
            if (A[j][i] === 1) {
                for (k = 0; k < Q; k++) {
                    A[j][k] = (A[j][k] + A[i][k]) % 2 as BitSequence;
                }
            }
        }
    }
}

function findUnitElementAndSwap(
    flag: MatrixOperation,
    i: number,
    M: number,
    Q: number,
    A: BitSequence[][]
): number {
    let index = 0;
    let row_op = 0;

    if (flag === MatrixOperation.FORWARD_ELIMINATION) {
        index = i + 1;
        while (index < M && A[index][i] === 0) {
            index++;
        }
        if (index < M) {
            row_op = swapRows(i, index, Q, A);
        }
    } else {
        index = i - 1;
        while (index >= 0 && A[index][i] === 0) {
            index--;
        }
        if (index >= 0) {
            row_op = swapRows(i, index, Q, A);
        }
    }

    return row_op;
}

function swapRows(i: number, index: number, Q: number, A: BitSequence[][]): number {
    let p;
    let temp;

    for (p = 0; p < Q; p++) {
        temp = A[i][p];
        A[i][p] = A[index][p];
        A[index][p] = temp;
    }

    return 1;
}


function determineRank(m: number, M: number, Q: number, A: BitSequence[][]): number {
    let i, j, rank, allZeroes;

    // ОПРЕДЕЛЕНИЕ РАНГА, ТО ЕСТЬ ПОДСЧЕТ КОЛИЧЕСТВА НЕНУЛЕВЫХ СТРОК

    rank = m;
    for (i = 0; i < M; i++) {
        allZeroes = 1;
        for (j = 0; j < Q; j++) {
            if (A[i][j] === 1) {
                allZeroes = 0;
                break;
            }
        }
        if (allZeroes === 1) {
            rank--;
        }
    }

    return rank;
}

