import mocks from "test/mockStore";

import { BUY } from "modules/transactions/constants/types";

import { formatEther, formatPercent } from "utils/format-number";

describe("modules/trades/helpers/generate-trade.js", () => {
  const { state } = mocks;
  const { generateTrade } = require("modules/trades/helpers/generate-trade");
  const trade = generateTrade(
    state.marketsData.testMarketId,
    state.outcomesData.testMarketId["1"],
    {
      numShares: 5000,
      limitPrice: "0.50",
      totalCost: "2500",
      type: "yes/no ",
      side: BUY,
      sharesFilled: 5000,
      sharesFilledAvgPrice: ""
    },
    state.orderBooks.testMarketId
  );

  test("should generate trade object", () => {
    expect(trade).toEqual({
      limitPrice: "0.50",
      numShares: 5000,
      maxNumShares: {
        denomination: " Shares",
        formatted: "0",
        formattedValue: 0,
        full: "0 Shares",
        minimized: "0",
        rounded: "0",
        roundedValue: 0,
        value: 0
      },
      orderShareProfit: null,
      orderShareTradingFee: null,
      potentialEthProfit: formatEther("7499.49999999403477"),
      potentialEthLoss: formatEther("-2500.50000000596523"),
      potentialProfitPercent: formatPercent("-299.9799999997613908"),
      potentialLossPercent: formatPercent(100),
      tradingFees: formatEther("0.50000000596523"),
      side: "buy",
      shareCost: formatEther(0),
      sharesFilled: 5000,
      totalCost: formatEther(2500),
      totalFee: {
        denomination: "",
        formatted: "",
        formattedValue: 0,
        full: "",
        minimized: "",
        rounded: "",
        roundedValue: 0,
        value: 0
      },
      totalFeePercent: {
        denomination: "",
        formatted: "",
        formattedValue: 0,
        full: "",
        minimized: "",
        rounded: "",
        roundedValue: 0,
        value: 0
      },
      tradeTypeOptions: [
        {
          label: "buy",
          value: "buy"
        },
        {
          label: "sell",
          value: "sell"
        }
      ],
      totalOrderValue: formatEther(-2500),
      totalSharesUpToOrder: trade.totalSharesUpToOrder
    });
  });

  // FIXME
  // it('should return the expected share total for a deeply selected bid', () => {
  //   assert.strictEqual(trade.totalSharesUpToOrder(1, BUY), 20, `total returned from 'totalSharesUpToOrder' for deep bid order was not the expected value`);
  // });

  // FIXME
  // it('should return the expected share total for a deeply selected ask', () => {
  //   assert.strictEqual(trade.totalSharesUpToOrder(1, SELL), 40, `total returned from 'totalSharesUpToOrder' for deep ask order was not the expected value`);
  // });
});
