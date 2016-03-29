define(function() {
    function computeData(data) {

    }

    this.allData = {};
    this.dimensions = [];
    this.measures = [];
    this.dimensionsLength = 0;
    this.measuresLength = 0;

    return {
        init: function(dimensions, measures) {
            if ((!this.dimensions) || (this.dimensions.length == 0) || this.dimensions.length == dimensions.length) {
                this.dimensions = dimensions;
            } else {
                this.dimensions = dimensions;
                this.allData = {}
                
            }
            this.measures = measures;
            this.dimensionsLength = dimensions.length;
            this.measuresLength = measures.length;
        },
        addRow: function(data) {
            addDimensionDataToDict(this.allData, data, this.dimensionsLength - 1);
        },
        allData: this.allData,
        getDataForBarChart: function() {
            if (this.dimensionsLength > 2)
                throw "This type of chart can have 2 dimensions max";
            if (this.measuresLength > 1)
                throw "This type of chart can have 1 measure max";
            var dict = this.allData;
            var seriesData = [];
            var categories = [];
            for (key in dict) {
                categories.push(key);
                var innerObject = dict[key];
                if (this.dimensionsLength == 2) {
                    for (innerKey in innerObject) {
                        appendToSeriesArray(innerObject[innerKey][0].qNum, seriesData, innerKey);
                    }
                } else if (this.dimensionsLength == 1) {
                    appendToSeriesArray(innerObject[0].qNum, seriesData, this.measures[0]);
                }
            }

            return {
                series: seriesData,
                categories: categories
            };
        },
        isEmpty: function() {
            for (var prop in this.allData)
                if (this.allData.hasOwnProperty(prop)) return false;
            return true;
        }

    }

    function appendToSeriesArray(data, array, name) {
        var index = 0;
        var added = false;
        for (index = 0; index < array.length; index++) {
            if (array[index].name == name) {
                array[index].data.push(data);
                added = true;
            }
        }
        if (!added) {
            array.push({
                name: name,
                data: [data]
            });
        }

        //return array;
    }

    function addDimensionDataToDict(dict, data, depth) {
        var value = data[0].qText;

        var innerDict = dict[value]

        if (!innerDict) {
            dict[value] = {};
            innerDict = dict[value];
        }

        data.shift();
        if (depth > 0)
            addDimensionDataToDict(innerDict, data, depth - 1);
        else {
            dict[value] = data; //could parse the data here

        }

    }
})