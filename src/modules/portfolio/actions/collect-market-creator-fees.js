import speedomatic from 'speedomatic'
import { augur } from 'services/augurjs'
import logError from 'utils/log-error'
import { loadMarketsInfo } from 'modules/markets/actions/load-markets-info'

export const collectMarketCreatorFees = (marketId, callback = logError) => (dispatch, getState) => {
  augur.api.Market.getMarketCreatorMailbox({ tx: { to: marketId } }, (err, marketMailboxAddress) => {
    if (err) return callback(err)
    augur.api.Cash.getBalance({ _address: marketMailboxAddress }, (err, cashBal) => {
      const cashBalance = speedomatic.unfix(cashBal, 'number')
      augur.rpc.eth.getBalance([marketMailboxAddress, 'latest'], (attoEthBalance) => {
        const ethBalance = speedomatic.unfix(attoEthBalance, 'number')
        const combined = ethBalance + cashBalance
        if (combined > 0) {
          augur.api.Mailbox.withdrawEther({ tx: { to: marketMailboxAddress } }, logError)
          dispatch(loadMarketsInfo([marketId]))
        }
      })
    })
  })
}
