/**
 * Created by zhangxiaoxue on 1/28/17.
 */
hi.process = {
    getFacilityCount: function(){
        var data = {
            emergency: {},
            hospital: {}
        };

        $.when($.getJSON('data/emergency_service_facilities.json'), $.getJSON('data/hospital_community_facilities.json'), $.getJSON('data/boundaries.geojson')).done(function( a1, a2, a3 ) {
            var emergencyData = a1[0];
            var hospitalData = a2[0];
            var geoData = a3[0];
            var length = emergencyData.length > hospitalData.length ? emergencyData.length: hospitalData.length;

            for(var i = 0; i < length; i++){
                var emergencyPt = !emergencyData[i] ? {} : {
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "type": "Point",
                        "coordinates": [emergencyData[i].X, emergencyData[i].Y]
                    }
                };

                var hospitalPt = !hospitalData[i] ? {} : {
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "type": "Point",
                        "coordinates": [hospitalData[i].X, hospitalData[i].Y]
                    }
                };

                $.each(geoData.features, function(index, geoItem){
                    var poly = {
                        "type": "Feature",
                        "properties": {},
                        "geometry": geoItem.geometry
                    };

                    //check inside
                    if(emergencyPt.geometry && turf.inside(emergencyPt, poly)){
                        if(!data.emergency[geoItem.properties.OBJECTID]){
                            data.emergency[geoItem.properties.OBJECTID] = [];
                        }
                        data.emergency[geoItem.properties.OBJECTID].push(emergencyData[i].OBJECTID);
                        return;
                    }

                    if(hospitalPt.geometry && turf.inside(hospitalPt, poly)){
                        if(!data.hospital[geoItem.properties.OBJECTID]){
                            data.hospital[geoItem.properties.OBJECTID] = [];
                        }
                        data.hospital[geoItem.properties.OBJECTID].push(hospitalData[i].OBJECTID);
                        return;
                    }
                });

            }

            console.log(data);
        });
    },
    getProjection: function(){
        var tractPts = [];
        var tractPtsArray = [];
        var gridPts = [];
        var gridPtsArray = [];

        //get data
        $.when($.getJSON('data/boundaries.geojson'), $.getJSON('data/grid.geojson')).done(function(a1, a2){
            ready(a1[0], a2[0]);
        });

        function ready(geojson, gridjson){
            //tract center list
            $.each(geojson.features, function(index, item){
                var poly = {
                    "type": "Feature",
                    "properties": {},
                    "geometry": item.geometry
                };

                var tractPt = turf.centroid(poly);

                tractPts.push(tractPt);
                tractPtsArray.push(tractPt.geometry.coordinates);
            });
            tractPts = turf.featurecollection(tractPts);

            //grid center list
            $.each(gridjson.features, function(index, item){
                var poly = {
                    "type": "Feature",
                    "properties": {},
                    "geometry": item.geometry
                };

                var gridPt = turf.centroid(poly);

                gridPts.push(gridPt);
                gridPtsArray.push(gridPt.geometry.coordinates);
            });
            gridPts = turf.featurecollection(gridPts);

            //Relationship
            var matrix = [];
            for (var i = 0; i <= tractPtsArray.length - 1; i++) {
                console.log(i);
                matrix[i] = [];
                for (var j = 0; j <= gridPtsArray.length - 1; j++) {
                    matrix[i][j] = (tractPtsArray[i][0] - gridPtsArray[j][0]) * (tractPtsArray[i][0] - gridPtsArray[j][0]) + (tractPtsArray[i][1] - gridPtsArray[j][1]) * (tractPtsArray[i][1] - gridPtsArray[j][1]);
                }
            }

            var munkres = new Munkres();
            var relation = munkres.compute(matrix);

            console.log(relation);
            return relation;
        }
    },
    transformToObject: function(){
        var _this = hi;
        var array = _this.tract2grid;
        var result = {};

        $.each(array, function(index, item){
            result[item[1]] = item[0];
        });

        return result;
    },
    getGroupThreshold: function(chartCode){
        //process data
        var _this = hi;

        var data = $.merge([], _this.healthData).sort(
            function(a, b) {
                return d3.ascending(a[chartCode] - 0, b[chartCode] - 0);
            });
        var minVal = 0;
        var maxVal = 0;
        var p20 = 0;
        var p40 = 0;
        var p60 = 0;
        var p80 = 0;
        var range = 0;

        console.log(data);
        //use d3 to divide data into quintile groups
        $.each(data, function(){
            var first = data[0];
            if(first[chartCode] !== ''){
                minVal = first[chartCode] - 0;
                return false;
            }else{
                data.shift();
            }
        });

        maxVal = data[data.length - 1][chartCode] - 0;
        /*p20 = 0.2 * (maxVal - minVal);
        p40 = 0.4 * (maxVal - minVal);
        p60 = 0.6 * (maxVal - minVal);
        p80 = 0.8 * (maxVal - minVal);*/

        range = (maxVal - minVal)/5;
        p20 = minVal + range;
        p40 = minVal + 2 * range;
        p60 = minVal + 3 * range;
        p80 = minVal + 4 * range;

        function changeFormat(number){
            return Math.floor(number * 100)/100
        }
        return {
            minVal: changeFormat(minVal),
            maxVal: changeFormat(maxVal),
            p20: changeFormat(p20),
            p40: changeFormat(p40),
            p60: changeFormat(p60),
            p80: changeFormat(p80)
        }
    },
    getGroupIndex: function(value, groupThreshold, chartCode){
        var _this = hi;
        var chartCode = chartCode || _this.currentIndicatorCode;
        //var groupThreshold = groupThreshold || _this.process.getGroupThreshold(chartCode);
        var groupThreshold = groupThreshold || _this.currentGroupThreshold;
        var groupIndex = 0;

        if(groupThreshold.p80 < value && value <= groupThreshold.maxVal){
            groupIndex = 0;
        }else if(groupThreshold.p60 < value && value <= groupThreshold.p80){
            groupIndex = 1;
        }else if(groupThreshold.p40 < value && value <= groupThreshold.p60){
            groupIndex = 2;
        }else if(groupThreshold.p20 < value && value <= groupThreshold.p40){
            groupIndex = 3;
        }else if(groupThreshold.minVal < value && value <= groupThreshold.p20){
            groupIndex = 4;
        }else{
            //color to indicate undefined data
            groupIndex = 5;
        }

        return groupIndex;
    },
    getGroupNames: function(groupThreshold){
        var groupThreshold = groupThreshold;
        return [
            groupThreshold.minVal + ' - ' + groupThreshold.p20,
            groupThreshold.p20 + ' - ' + groupThreshold.p40,
            groupThreshold.p40 + ' - ' + groupThreshold.p60,
            groupThreshold.p60 + ' - ' + groupThreshold.p80,
            groupThreshold.p80 + ' - ' + groupThreshold.maxVal
        ]
    },
    getUnit: function(){
        var _this = hi;
        var unit = '';
        var indicator = _this.currentIndicatorId;

        if(_this.currentDataType === 'num'){
            switch(indicator){
                case 'income':
                    unit = 'Dollars';
                    break;
                case 'weight':
                case 'teen':
                case 'premature':
                case 'insurance':
                    unit = 'Persons';
                    break;
                case 'hospital':
                case 'emergency':
                    unit = 'Facilities'
                    break;
                default:
                    unit = '';
            }
        }else{
            unit = 'Percentage'
        }


        return unit;

    }
};
