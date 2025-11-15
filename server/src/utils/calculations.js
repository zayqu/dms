function netProfit(revenue, cogs, expenses) { return revenue - cogs - expenses; }
function netProfitMargin(netProfitVal, revenue) { return revenue ? (netProfitVal / revenue) * 100 : 0; }
function grossProfitMargin(revenue, cogs) { return revenue ? ((revenue - cogs) / revenue) * 100 : 0; }
function roi(netProfitVal, costOfInvestment) { return costOfInvestment ? (netProfitVal / costOfInvestment) * 100 : 0; }
function roas(revenueFromAds, costOfAds) { return costOfAds ? (revenueFromAds / costOfAds) : 0; }
function workingCapital(currentAssets, currentLiabilities) { return currentAssets - currentLiabilities; }
function breakEvenUnits(fixedCosts, sellingPricePerUnit, variableCostPerUnit) { const margin = sellingPricePerUnit - variableCostPerUnit; if (!margin) return Infinity; return fixedCosts / margin; }
function revenueRunRate(revenueForPeriod, periodsPerYear) { return revenueForPeriod * periodsPerYear; }
function ebitda(operatingIncome, depreciation = 0, amortization = 0) { return operatingIncome + depreciation + amortization; }
module.exports = { netProfit, netProfitMargin, grossProfitMargin, roi, roas, workingCapital, breakEvenUnits, revenueRunRate, ebitda };