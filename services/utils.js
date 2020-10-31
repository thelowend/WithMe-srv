const cDates = require('compare-dates');
class Utils {
  twoWeeksAgo(date) {
    return new Date(new Date(date).setDate(date.getDate() - 14)); // Jajaj la clase Date en JS es malísima
  }
  happenedAfter(first, second) {
    return cDates.isAfter(first, second);
  }
  happenedBefore(first, second) {
    return cDates.isSameOrBefore(first, second);
  }
}

module.exports = new Utils()