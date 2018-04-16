var dynamicSkyEntityMethods = {
  currentDate: new Date(),
  getDayOfTheYear: function(){
    var month = this.currentDate.getMonth() + 1;
    var dayOfThisMonth = this.currentDate.getDate();
    var year = this.currentDate.getFullYear();

    return this.getDayOfTheYearFromYMD(year, month, dayOfThisMonth);
  },

  getNowFromData: function(data){
    var outDate = new Date(data.year, 0);
    outDate.setDate(day.dayOfYear);
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
    return (this.currentDate.getHours() * 3600 + this.currentDate.getMinutes() * 60 + this.currentDate.getSeconds()).toString();
  },

  getYear: function(){
    return this.currentDate.getFullYear().toString();
  },
}

//For Mocha testing
if(typeof exports !== 'undefined') {
  exports.dynamicSkyEntityMethods = dynamicSkyEntityMethods;
}
