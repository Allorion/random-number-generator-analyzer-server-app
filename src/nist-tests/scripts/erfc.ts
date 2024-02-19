export function erfc(x: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const t = 1.0 / (1.0 + p * Math.abs(x));
    const erfcc = t * (a1 + t * (a2 + t * (a3 + t * (a4 + t * a5))));

    return erfcc * Math.exp(-x * x);
}