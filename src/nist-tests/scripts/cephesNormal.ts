import {erf} from "simple-statistics";


export const cephesNormal = (x: number) => {

    const sqrt2=1.414213562373095048801688724209698078569672;

    let result = 0

    if (x > 0) {
        result = 0.5 * ( 1 + erf(x/sqrt2) );
    }
    else {
        result = 0.5 * ( 1 - erf(-x/sqrt2) );
    }

    return result
}