var dynamicSkyEntityMethods = {
  currentDate: new Date(),
  getDayOfTheYear: function(){
    var month = this.currentDate.getMonth() + 1;
    var dayOfThisMonth = this.currentDate.getDate();
    var year = this.currentDate.getFullYear();

    return this.getDayOfTheYearFromYMD(year, month, dayOfThisMonth);
  },

  getNowFromData: function(data){
    //Initialize our day
    var outDate = new Date(data.year, 0);
    outDate.setDate(data.dayOfTheYear);
    outDate.setSeconds(data.timeOffset);

    return new Date(outDate);
  },

  getDayOfTheYearFromYMD: function(year, month, day){
    var daysInEachMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if(year == 0.0 || (year % 4 == 0.0) ){
      daysInEachMonth[1] = 29;
    }
    var currentDayOfYear = 0;

    for(var m = 0; m < (month - 1); m++){
      currentDayOfYear += daysInEachMonth[m];
    }
    currentDayOfYear += day;

    return currentDayOfYear.toString();
  },

  getIsLeapYear: function(year){
    if(((year % 4 == 0 || year == 0) && (((year % 100 == 0) && (year % 400 == 0)) || (year % 100 != 0)))){
      return true;
    }
    return false;
  },

  getSecondOfDay: function(){
    var midnightOfPreviousDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), this.currentDate.getDate(), 0,0,0);
    return (this.currentDate - midnightOfPreviousDay) / 1000.0;
  },

  getYear: function(){
    return Math.trunc(this.currentDate.getFullYear().toString());
  },
}

//For Mocha testing
if(typeof exports !== 'undefined') {
  exports.dynamicSkyEntityMethods = dynamicSkyEntityMethods;
}
