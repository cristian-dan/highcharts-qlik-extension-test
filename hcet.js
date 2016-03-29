requirejs.config({
    shim: {
        "extensions/hcet/app/dataProcessing": {
            "deps": []
        },
        "extensions/hcet/app/highchartsBarType": {
            "deps": []
        },
        "extensions/hcet/app/highchartsTypeStrategy": {
            "deps": ['./highchartsBarType']
        },
        "extensions/hcet/js/highcharts.src": {
            "deps": []
        },
        "extensions/hcet/js/data.src": {
            "deps": ["./highcharts.src"]
        },
        "extensions/hcet/js/exporting.src": {
            "deps": ["./highcharts.src"]
        },
        "extensions/hcet/js/highcharts-more.src": {
            "deps": ["./highcharts.src"]
        },
        "extensions/hcet/js/offline-exporting.src": {
            "deps": ["./highcharts.src", './exporting.src']
        },
    }
});




define(["jquery", "text!./hcet.css", './app/dataProcessing', './app/highchartsTypeStrategy', './js/highcharts.src', './js/data.src', './js/exporting.src', './js/highcharts-more.src', './js/offline-exporting.src'], function($, cssContent, dataProcessing, highchartsTypeStrategy) {
    'use strict';
    $("<style>").html(cssContent).appendTo("head");
    return {
        initialProperties: {
            version: 1.0,
            qHyperCubeDef: {
                qDimensions: [],
                qMeasures: [],
                qInitialDataFetch: [{
                    qWidth: 10,
                    qHeight: 50
                }]
            },
            striping: {
                freq: 0,
                groupA: 'White',
                groupB: 'LightGray'
            }
        },
        definition: {
            type: "items",
            component: "accordion",
            items: {
                additionalProperties: {
                    type: "items",
                    label: "Chart Settings",
                    items: {
                        property1: {
                            ref: "chartType",
                            type: "string",
                            component: "dropdown",
                            label: "Chart Type",
                            options: [{
                                value: "line",
                                label: "Line"
                            }, {
                                value: "pie",
                                label: "Pie"
                            }]
                        }
                    }
                },
                dimensions: {
                    uses: "dimensions",
                    min: 1,
                    max: 2
                },
                measures: {
                    uses: "measures",
                    min: 1,
                    max: 1
                },
                sorting: {
                    uses: "sorting"
                },
                settings: {
                    uses: "settings",
                    items: {
                        initFetchRows: {
                            ref: "qHyperCubeDef.qInitialDataFetch.0.qHeight",
                            label: "Initial fetch rows",
                            type: "number",
                            defaultValue: 50
                        },
                        striping: {
                            type: "items",
                            label: "Row Striping",
                            items: {
                                rowStripe: {
                                    ref: "striping.freq",
                                    label: "Stripes",
                                    type: "number",
                                    defaultValue: 0
                                },
                                stripeColorA: {
                                    ref: "striping.groupA",
                                    label: "Stripe A",
                                    type: "string",
                                    defaultValue: "White"
                                },
                                stripeColorB: {
                                    ref: "striping.groupB",
                                    label: "Stripe B",
                                    type: "string",
                                    defaultValue: "LightGray"
                                },
                            }
                        },
                    }
                }
            }
        },
        snapshot: {
            canTakeSnapshot: true
        },
        paint: function($element, layout) {
            var stripeSettings = this.backendApi.model.layout.striping;
            var stripeCount = this.backendApi.model.layout.striping.freq;
            var id = layout.qInfo.qId + '_cont1';
            var html = html + "<div id='" + id + "'></div>";

            var dimensions = new Array();
            var measures = new Array();


            $.each(this.backendApi.getDimensionInfos(), function(key, value) {
                dimensions.push(value.qFallbackTitle);
            });

            $.each(this.backendApi.getMeasureInfos(), function(key, value) {
                measures.push(value.qFallbackTitle);
            });

            dataProcessing.init(dimensions, measures)

            $element.html(html);

            if (dataProcessing.isEmpty()) {
                // if there's no data, we get it from the backendApi
                this.backendApi.eachDataRow(function(rownum, row) {

                    if (rownum < 10) { // limit the values for testing purposes
                        if (row.length > 0) {
                            dataProcessing.addRow(row);
                        }
                    }
                });
            }

            var processedData = dataProcessing.getDataForBarChart();

            console.log(processedData);



            $('#' + id).highcharts({
                chart: {
                    type: 'bar'
                },
                title: {
                    text: "Highcharts extensions test"
                },
                subtitle: {
                    text: 'Source: <a href="https://github.com/cristian-dan/highcharts-qlik-extension-test.git">Github.com</a>'
                },
                xAxis: {
                    categories: processedData.categories,
                    title: {
                        text: null
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Population (millions)',
                        align: 'high'
                    },
                    labels: {
                        overflow: 'justify'
                    }
                },
                tooltip: {
                    valueSuffix: ' millions'
                },
                plotOptions: {
                    bar: {
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'top',
                    x: -40,
                    y: 80,
                    floating: true,
                    borderWidth: 1,
                    backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
                    shadow: true
                },
                credits: {
                    enabled: false
                },
                series: processedData.series
            });

        }
    };
});