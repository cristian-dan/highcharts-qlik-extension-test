requirejs.config({
    shim: {
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




define(["jquery", "text!./hcet.css", './js/highcharts.src', './js/data.src', './js/exporting.src', './js/highcharts-more.src', './js/offline-exporting.src'], function($, cssContent) {
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
                          	type : "string",
							component : "dropdown",
							label : "Chart Type",
                            options :[{value:"line",label:"Line"},{value:"pie",label:"Pie"}]
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
                    min: 0
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
            var customers = new Array();
            var lastrow = 0;
            var currCount = 0;
            var currGroup = 0;

            var allData = [];

            $.each(this.backendApi.getDimensionInfos(), function(key, value) {
                dimensions.push(value.qFallbackTitle);
            });

            $.each(this.backendApi.getMeasureInfos(), function(key, value) {
                measures.push(value.qFallbackTitle);
                // init an empty array for this measure
                allData.push({
                    name: value.qFallbackTitle,
                    data: []
                });
            });

            $element.html(html);

            this.backendApi.eachDataRow(function(rownum, row) {

                var obj = {};

                if (rownum < 10) {
                    $.each(row, function(key, cell) {

                        if (key == 0) {
                            customers.push(cell.qText);
                        } else {
                            allData[key-1].data.push(cell.qNum)
                        }


                    });

                }
            });

            $('#'+id).highcharts({
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
                    categories: customers,
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
                series: allData
            });

            //console.log(this.backendApi.model.properties.extraSettings.esStripes);
            /*var html = "<table><thead><tr>", self = this, lastrow = 0, morebutton = false;
            //render titles
            $.each(this.backendApi.getDimensionInfos(), function(key, value) {
            	html += '<th>' + value.qFallbackTitle + '</th>';
            });
            $.each(this.backendApi.getMeasureInfos(), function(key, value) {
            	html += '<th>' + value.qFallbackTitle + '</th>';
            });
            html += "</tr></thead><tbody>";
			
            //striping properties			
            var currCount = stripeCount,
            	currGroup = 1,
            	stripePair = [stripeSettings.groupA,stripeSettings.groupB];//TODO: add logic that will allow changing of color stripes
            	
            //render data
            this.backendApi.eachDataRow(function(rownum, row) {
            	lastrow = rownum;
            	//for striping purposes
            	if(currCount==0){
            		currCount=stripeCount;
            		currGroup = -(currGroup-1);
            	}				
            	
            	html += '<tr';			
            	//for striping purposes
            	//TODO: add logic that will allow striping to be optional
            	html += " style='";
            	html += "background-color:"+stripePair[currGroup];
            	html += "'";
            	
            	html+= '>';
            	$.each(row, function(key, cell) {
            		
            		
            		if(cell.qIsOtherCell) {
            			cell.qText = self.backendApi.getDimensionInfos()[key].othersLabel;
            		}
            		html += '<td';					
            		if(!isNaN(cell.qNum)) {
            			html += " class='numeric'";
            		}
            		
            		html += '>' + cell.qText + '</td>';
            		
            	});
            	html += '</tr>';
            	currCount--;
            });
            html += "</tbody></table>";*/
            //add 'more...' button


            /*if(this.backendApi.getRowCount() > lastrow + 1) {
				html += "<button id='more'>More...</button>";
				morebutton = true;
			}
			$element.html(html);
			if(morebutton) {
				var requestPage = [{
					qTop : lastrow + 1,
					qLeft : 0,
					qWidth : 10, //should be # of columns
					qHeight : Math.min(50, this.backendApi.getRowCount() - lastrow)
				}];
				$element.find("#more").on("qv-activate", function() {
					self.backendApi.getData(requestPage).then(function(dataPages) {
						self.paint($element);
					});
				});
			}
            */
        }
    };
});