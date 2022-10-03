import { BigNumber } from "ethers";

import { ApprovalHandler, TransferHandler } from "../generated/WETH";

const handleTransfer: TransferHandler = async (event, context) => {
  const { block } = event;
  const { Account } = context.entities;
  const { src, dst, wad } = event.params;

  const existingSrcAccount = await Account.get(src);
  if (existingSrcAccount) {
    await Account.upsert({
      ...existingSrcAccount,
      balance: BigNumber.from(existingSrcAccount.balance).sub(wad).toString(),
      lastActivityTimestamp: block.timestamp,
    });
  } else {
    await Account.insert({
      id: src,
      balance: wad.toString(),
      lastActivityTimestamp: block.timestamp,
    });
  }

  const existingDstAccount = await Account.get(dst);
  if (existingDstAccount) {
    await Account.upsert({
      ...existingDstAccount,
      balance: BigNumber.from(existingDstAccount.balance).add(wad).toString(),
    });
  } else {
    await Account.insert({
      id: dst,
      balance: wad.toString(),
    });
  }
};

const handleApproval: ApprovalHandler = async (event, context) => {
  const { Allowance } = context.entities;
  const { src, guy, wad } = event.params;

  const allowanceId = `${src}-${guy}`;

  const existingAllowance = await Allowance.get(allowanceId);
  if (existingAllowance) {
    await Allowance.upsert({
      ...existingAllowance,
      amount: BigNumber.from(existingAllowance.amount).add(wad).toString(),
    });
  } else {
    await Allowance.insert({
      id: allowanceId,
      owner: src,
      spender: guy,
      amount: wad.toString(),
    });
  }
};

export const WETH = {
  Transfer: handleTransfer,
  Approval: handleApproval,
};