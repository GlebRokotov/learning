import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import "@nomicfoundation/hardhat-chai-matchers";

describe("LibDemo", function () {

    async function deploy() {
        const [owner] = await ethers.getSigners();
        const LibDemo = await ethers.getContractFactory("LibDemo", owner);
        const demo = await LibDemo.deploy();
        await demo.waitForDeployment();
        return { owner, demo }
    }

    it("compares string", async function() {
        const { owner, demo } = await loadFixture(deploy);
        const result = await demo.runnerStr("cat", "cat");
        expect(result).to.eq(true);

        const result2 = await demo.runnerStr("cat", "dog");
        expect(result2).to.eq(false);
    })

    it("finds uint in array", async function() {
        const { owner, demo } = await loadFixture(deploy);
        const result = await demo.runnerArr([1,2,3], 2);
        expect(result).to.eq(true);

        const result2 = await demo.runnerArr([1,2,3], 42);
        expect(result2).to.eq(false);
    })

});