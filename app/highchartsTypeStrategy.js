define(['../app/highchartsBarType'],function (highchartsBarType) {
    
    var HighchartsTypes = {
            Pie: "pie",
            Bar: "bar"
        }
        
    return {
        // implemented types
        HighchartsTypes: HighchartsTypes,
        
        getHighchartsDataForType: function (type) {
            var chart;
            switch(type){
                case HighchartsTypes.Bar:
                    chart = highchartsBarType.init();
                    break;
            }
        }
    }
})