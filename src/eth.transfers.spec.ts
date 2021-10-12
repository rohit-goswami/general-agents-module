import { Finding, HandleTransaction, TransactionEvent } from "forta-agent";
import provideETHTransferHandler from "./eth.transfers";
import { createAddress, generalTestFindingGenerator, TestTransactionEvent } from "./tests.utils";
import { toWei } from "web3-utils";

describe("ETH Transfer Agent Tests", () => {
  let handleTransaction: HandleTransaction;

  it("should returns empty findings if no threshold was specified and transactions are below 10 ETH", async () => {
    handleTransaction = provideETHTransferHandler(generalTestFindingGenerator);

    const txEvent: TransactionEvent = new TestTransactionEvent().setValue(toWei("9"));

    const findings: Finding[] = await handleTransaction(txEvent);

    expect(findings).toStrictEqual([]);
  });

  it("should returns empty findings if no threshold was specified and transactions are 10 ETH or more", async () => {
    handleTransaction = provideETHTransferHandler(generalTestFindingGenerator);

    const txEvent1: TransactionEvent = new TestTransactionEvent().setValue(toWei("10"));
    let findings: Finding[] = await handleTransaction(txEvent1);
    expect(findings).toStrictEqual([generalTestFindingGenerator()]);

    const txEvent2: TransactionEvent = new TestTransactionEvent().setValue(toWei("100"));
    findings = await handleTransaction(txEvent2);
    expect(findings).toStrictEqual([generalTestFindingGenerator()]);
  });

  it("should returns empty findings if value is under specified threshold", async () => {
    handleTransaction = provideETHTransferHandler(generalTestFindingGenerator, { valueThreshold: toWei("100") });

    const txEvent: TransactionEvent = new TestTransactionEvent().setValue(toWei("99"));

    const findings: Finding[] = await handleTransaction(txEvent);

    expect(findings).toStrictEqual([]);
  });

  it("should returns findings if value is equal or greater to specified threshold ", async () => {
    handleTransaction = provideETHTransferHandler(generalTestFindingGenerator, { valueThreshold: toWei("100") });

    const txEvent1: TransactionEvent = new TestTransactionEvent().setValue(toWei("100"));
    let findings: Finding[] = await handleTransaction(txEvent1);
    expect(findings).toStrictEqual([generalTestFindingGenerator()]);

    const txEvent2: TransactionEvent = new TestTransactionEvent().setValue(toWei("1000"));
    findings = await handleTransaction(txEvent2);
    expect(findings).toStrictEqual([generalTestFindingGenerator()]);
  });

  it("should returns empty findings if transaction are not from the specified address", async () => {
    handleTransaction = provideETHTransferHandler(generalTestFindingGenerator, { from: createAddress("0x12") });

    const txEvent: TransactionEvent = new TestTransactionEvent().setValue(toWei("15")).setFrom(createAddress("0x13"));

    const findings: Finding[] = await handleTransaction(txEvent);

    expect(findings).toStrictEqual([]);
  });

  it("should returns findings if transactions are from the specified address", async () => {
    handleTransaction = provideETHTransferHandler(generalTestFindingGenerator, { from: createAddress("0x12") });

    const txEvent: TransactionEvent = new TestTransactionEvent().setValue(toWei("15")).setFrom(createAddress("0x12"));

    const findings: Finding[] = await handleTransaction(txEvent);

    expect(findings).toStrictEqual([generalTestFindingGenerator()]);
  });

  it("should returns empty findings if transactions are not to specified address", async () => {
    handleTransaction = provideETHTransferHandler(generalTestFindingGenerator, { to: createAddress("0x12") });

    const txEvent: TransactionEvent = new TestTransactionEvent().setValue(toWei("15")).setTo(createAddress("0x13"));

    const findings: Finding[] = await handleTransaction(txEvent);

    expect(findings).toStrictEqual([]);
  });

  it("should returns findings if transactions are to specified address", async () => {
    handleTransaction = provideETHTransferHandler(generalTestFindingGenerator, { to: createAddress("0x12") });

    const txEvent: TransactionEvent = new TestTransactionEvent().setValue(toWei("15")).setTo(createAddress("0x12"));

    const findings: Finding[] = await handleTransaction(txEvent);

    expect(findings).toStrictEqual([generalTestFindingGenerator()]);
  });

  it("should returns findings only when all the specified conditions are met", async () => {
    handleTransaction = provideETHTransferHandler(generalTestFindingGenerator, {
      from: createAddress("0x12"),
      to: createAddress("0x13"),
      valueThreshold: toWei("50"),
    });

    const txEvent1: TransactionEvent = new TestTransactionEvent().setValue(toWei("100")).setTo(createAddress("0x13"));
    let findings: Finding[] = await handleTransaction(txEvent1);
    expect(findings).toStrictEqual([]);

    const txEvent2: TransactionEvent = new TestTransactionEvent().setValue(toWei("100")).setFrom(createAddress("0x12"));
    findings = await handleTransaction(txEvent2);
    expect(findings).toStrictEqual([]);

    const txEvent3: TransactionEvent = new TestTransactionEvent()
      .setValue(toWei("40"))
      .setFrom(createAddress("0x12"))
      .setTo(createAddress("0x13"));
    findings = await handleTransaction(txEvent3);
    expect(findings).toStrictEqual([]);

    const txEvent4: TransactionEvent = new TestTransactionEvent()
      .setValue(toWei("80"))
      .setFrom(createAddress("0x12"))
      .setTo(createAddress("0x13"));
    findings = await handleTransaction(txEvent4);
    expect(findings).toStrictEqual([generalTestFindingGenerator()]);
  });
});
