import async from 'async';
import { augur, abi } from '../../../../services/augurjs';
import { ZERO } from '../../../trade/constants/numbers';
import { SUCCESS } from '../../../transactions/constants/statuses';

export function shortSell(marketID, outcomeID, numShares, takerAddress, getTradeIDs, cbStatus, cb) {
	const res = {
		remainingShares: numShares,
		filledShares: ZERO,
		filledEth: ZERO,
		tradingFees: ZERO,
		gasFees: ZERO
	};

	const matchingIDs = getTradeIDs();

	if (!matchingIDs.length) return cb(null, res);

	async.eachSeries(matchingIDs, (matchingID, nextMatchingID) => {
		augur.short_sell({
			max_amount: res.remainingShares.toFixed(),
			buyer_trade_id: matchingID,
			sender: takerAddress,
			onTradeHash: (data) => cbStatus({ status: 'submitting' }),
			onCommitSent: (data) => cbStatus({ status: 'committing' }),
			onCommitSuccess: (data) => {
				res.gasFees = res.gasFees.plus(abi.bignum(data.gasFees));
				cbStatus({
					status: 'sending',
					hash: data.txHash,
					timestamp: data.timestamp,
					gasFees: res.gasFees
				});
			},
			onCommitFailed: (err) => nextMatchingID,
			onNextBlock: (data) => console.log('short_sell-onNextBlock', data),
			onTradeSent: (data) => {
				console.log('!!!! onTradeSent', data);
				cbStatus({ status: 'filling' });
			},
			onTradeSuccess: (data) => {
				if (data.unmatchedShares) {
					res.remainingShares = parseFloat(data.unmatchedShares);
				} else {
					res.remainingShares = 0;
				}
				if (data.matchedShares) {
					res.filledShares = res.filledShares.plus(abi.bignum(data.matchedShares));
				}
				if (data.cashFromTrade) {
					res.filledEth = res.filledEth.plus(abi.bignum(data.cashFromTrade));
				}
				res.tradingFees = res.tradingFees.plus(abi.bignum(data.tradingFees));
				res.gasFees = res.gasFees.plus(abi.bignum(data.gasFees));
				cbStatus({
					status: SUCCESS,
					hash: data.txHash,
					timestamp: data.timestamp,
					gasFees: res.gasFees
				});
				if (res.remainingShares > 0) return nextMatchingID();
				nextMatchingID({ isComplete: true });
			},
			onTradeFailed: (err) => nextMatchingID
		});
	}, (err) => {
		if (err && !err.isComplete) return cb(err);
		console.log('* short_sell success:', res);
		return cb(null, res);
	});
}
