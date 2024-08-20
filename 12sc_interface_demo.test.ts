import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import "@nomicfoundation/hardhat-chai-matchers";

describe("Demo12", function () {

    async function deploy() {
        const [owner] = await ethers.getSigners();
        const Logger = await ethers.getContractFactory("Logger", owner);
        const logger = await Logger.deploy();
        await logger.waitForDeployment();
        const loggerAddress: string = await logger.getAddress();           // получаем адрес контракта Logger в виде строки. эта строка уже имеет
                                                                           // правильный формат для использования как адрес в Ethereum.

        const Demo12 = await ethers.getContractFactory("Demo12", owner);
        const demo = await Demo12.deploy(loggerAddress);                   // передаем loggerAddress (строку) в конструктор контракта Demo12.
                                                                           // Контракт Demo12 принимает строку как адрес и использует ее для
                                                                           // инициализации своего состояния.
        await demo.waitForDeployment();
        return { owner, logger, demo }   
    }

    it("allows to pay and get payment info", async function() {
        const { owner, demo } = await loadFixture(deploy);
        const sum = 100
        const demoAddress = await demo.getAddress();
    
        const txData = {
          value: sum,
          to: demoAddress
        }
    
        const tx = await owner.sendTransaction(txData);
    
        await tx.wait();
    
        await expect(tx)
          .to.changeEtherBalance(demo, sum);
    
        const amount = await demo.payment(owner.address, 0);
    
        expect(amount).to.eq(sum);
      })

});