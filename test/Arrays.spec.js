import { expect } from "chai";

describe("Arrays", () => {
    describe("#sort", () => {
        it("should sort an array", () => {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            expect(arr.sort()).to.be.eql([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        });
    })

    describe("#sort2", () => {
        it("should sort an array 2", () => {
            const arr = [2, 1, 3, 4, 5, 6, 7, 8, 9];
            expect(arr.sort()).to.be.eql([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        });
    })
});