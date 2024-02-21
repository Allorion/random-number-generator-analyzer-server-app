const cephes = require('cephes');

export interface ILinearComplexity {
    "M": number,
    "N": number,
    "C0": number,
    "C1": number,
    "C2": number,
    "C3": number,
    "C4": number,
    "C5": number,
    "C6": number,
    "CHI2": number,
    "bits": number,
    "pValue": number,
    "result": "FAILURE" | "SUCCESS",
    "warning": string | undefined,
}

export const linearComplexity = (bitsLine: number[], n: number, M: number = 500, ALPHA: number = 0.05): ILinearComplexity => {
    let i, ii, j, d, N, L, m, N_, parity, sign;
    const K = 6;
    let p_value, T_, mean;
    const nu: number[] = new Array(7).fill(0);
    const pi: number[] = [0.01047, 0.03125, 0.125, 0.5, 0.25, 0.0625, 0.020833];
    let T: number[] | null = null;
    let P: number[] | null = null;
    let B_: number[] | null = null;
    let C: number[] | null = null;

    N = Math.floor(n / M);
    if (
        ((B_ = new Array(M).fill(0)) == null) ||
        ((C = new Array(M).fill(0)) == null) ||
        ((P = new Array(M).fill(0)) == null) ||
        ((T = new Array(M).fill(0)) == null)
    ) {
        return {
            C0: 0,
            C1: 0,
            C2: 0,
            C3: 0,
            C4: 0,
            C5: 0,
            C6: 0,
            CHI2: 0,
            M: 0,
            N: 0,
            bits: 0,
            pValue: 0,
            result: 'FAILURE',
            warning: "Недостаточно памяти для рабочего пространства:: Тест линейной сложности"
        }
    }

    for (i = 0; i < K + 1; i++) nu[i] = 0;
    for (ii = 0; ii < N; ii++) {
        for (i = 0; i < M; i++) {
            B_[i] = 0;
            C[i] = 0;
            T[i] = 0;
            P[i] = 0;
        }
        L = 0;
        m = -1;
        d = 0;
        C[0] = 1;
        B_[0] = 1;

        /* DETERMINE LINEAR COMPLEXITY */
        N_ = 0;
        while (N_ < M) {
            d = bitsLine[ii * M + N_];
            for (i = 1; i <= L; i++) d += C[i] * bitsLine[ii * M + N_ - i];
            d = d % 2;
            if (d === 1) {
                for (i = 0; i < M; i++) {
                    T[i] = C[i];
                    P[i] = 0;
                }
                for (j = 0; j < M; j++)
                    if (B_[j] == 1) P[j + N_ - m] = 1;
                for (i = 0; i < M; i++) C[i] = (C[i] + P[i]) % 2;
                if (L <= N_ / 2) {
                    L = N_ + 1 - L;
                    m = N_;
                    for (i = 0; i < M; i++) B_[i] = T[i];
                }
            }
            N_++;
        }
        if ((parity = (M + 1) % 2) === 0) sign = -1;
        else sign = 1;
        mean = M / 2.0 + (9.0 + sign) / 36.0 - 1.0 / Math.pow(2, M) * (M / 3.0 + 2.0 / 9.0);
        if ((parity = M % 2) === 0) sign = 1;
        else sign = -1;
        T_ = sign * (L - mean) + 2.0 / 9.0;

        if (T_ <= -2.5) nu[0]++;
        else if (T_ > -2.5 && T_ <= -1.5) nu[1]++;
        else if (T_ > -1.5 && T_ <= -0.5) nu[2]++;
        else if (T_ > -0.5 && T_ <= 0.5) nu[3]++;
        else if (T_ > 0.5 && T_ <= 1.5) nu[4]++;
        else if (T_ > 1.5 && T_ <= 2.5) nu[5]++;
        else nu[6]++;
    }
    let chi2 = 0.0;
    for (i = 0; i < K + 1; i++) chi2 += Math.pow(nu[i] - N * pi[i], 2) / (N * pi[i]);
    p_value = cephes.igamc(K / 2.0, chi2 / 2.0);

    return {
        C0: nu[0],
        C1: nu[1],
        C2: nu[2],
        C3: nu[3],
        C4: nu[4],
        C5: nu[5],
        C6: nu[6],
        CHI2: chi2,
        M: M,
        N: N,
        bits: n % M,
        "pValue": p_value,
        "result": p_value < ALPHA ? "FAILURE" : "SUCCESS",
        warning: undefined
    }
}
