hi.geomap = {
    createMap: function(){
        var _this = hi;

        //create map
        //var mapStyleUrl = 'mapbox://styles/xiaoxuezhang/ciy0tczyo005k2rqjn4oncbhp';
        var mapStyleUrl = 'mapbox://styles/mapbox/light-v9';
        L.mapbox.accessToken = _this.accessToken;

        var map = L.map('map', {zoomControl: false})
            .setView([33.8356178, -84.3984737], 9);

        L.mapbox.styleLayer(mapStyleUrl)
            .addTo(map);

        //add zoom control with your options
        L.control.zoom({
            position:'topright'
        }).addTo(map);

        //map settings
        map.scrollWheelZoom.disable();

        //global map
        _this.map = map;
    },
    createGridMap: function(){
        var _this = hi;

        if(_this.map === null){
            _this.geomap.createMap();
        }

        //clear layer first
        if(_this.geoLayer !== null){
            _this.geoLayer.clearLayers();
        }

        //create geo layer after map initialized
        _this.geomap.createGeoLayer();
        //_this.geomap.createLegend();

        //stop loading
        _this.geomap.stopLoading();
    },
    createCartoMap: function(){
        var _this = hi;

        if(_this.map === null){
            _this.geomap.createMap();
        }

        if($.isEmptyObject(_this.cartoMapData)){

            $.when($.getJSON('data/boundaries.geojson')).done(function(a1){
                //cache data to show and update charts
                _this.cartoMapData = a1;

                //clear layer first
                if(_this.geoLayer !== null){
                    _this.geoLayer.clearLayers();
                }

                //show map and charts
                _this.geomap.createGeoLayer();

                //stop loading
                _this.geomap.stopLoading();
            });

        }else{

            //clear layer first
            if(_this.geoLayer !== null){
                _this.geoLayer.clearLayers();
            }
            _this.geomap.createGeoLayer();

            _this.geomap.stopLoading();
        }
    },
    updateMap: function(){
        var _this = hi;

        if(_this.geoLayer !== null){
            _this.geoLayer.clearLayers();
        }
        _this.geomap.createGeoLayer();
        //_this.geomap.createLegend();

        _this.geomap.stopLoading();
    },
    createGeoLayer: function(){
        var _this = hi;
        var geoData = _this.currentMapType === 'carto' ? _this.cartoMapData : _this.gridMapData;
        var map = _this.map;
        var chartCode = _this.currentIndicatorCode;
        var relationObj = _this.process.transformToObject();


        geoData.features.forEach(function(cell, index) {
            //get info
            var tractIndex = _this.currentMapType === 'carto' ? index : relationObj[index];
            cell.properties = _this.healthData[tractIndex];

            var cellVal = cell.properties[chartCode] - 0;
            var groupIndex = _this.process.getGroupIndex(cellVal);
            var color = _this.currentColors[groupIndex];
            var isDisabled = false;
            cell.properties.disabled = 0;

            var min = _this.currentGroupThreshold.minVal;
            var max = _this.currentGroupThreshold.maxVal;
            if(_this.currentRange !== null){
                min = _this.currentRange.min;
                max = _this.currentRange.max;
            }

            if(cellVal < min || cellVal > max){
                isDisabled = true;
                cell.properties.disabled = 1;
            }

            cell.properties.style = {
                fillColor: color,
                fillOpacity: 1,
                color: _this.strokeColor,
                //color: '#44474E',
                //color: color,
                weight: 2,
                opacity: 0
            };

            //Disabled
            if(isDisabled){
                cell.properties.style = {
                    fillColor: color,
                    fillOpacity: 0,
                    color: _this.strokeColor,
                    weight: 2,
                    opacity: 0
                };
            }

        });

        //apply styles and events
        _this.geoLayer = L.geoJson(geoData, {style: {smoothFactor: 0}, onEachFeature: onEachFeature})
            .eachLayer(function(l) {
                var style = l.feature.properties.style;
                var tractId = l.feature.properties['OBJECTID'];

                //Locked
                if(_this.isLocked && _this.lockedTractId === tractId){
                    style.fillColor = _this.strokeColor;
                    _this.lockedLayer = l;
                }

                l.setStyle(style);
            })
            .addTo(map);


        function onEachFeature(feature, layer) {
            layer.on({
                mouseover: handleMouseOver,
                mouseout: handleMouseOut,
                click: handleClick
            });
        }

        //highlight feature when hovering
        function handleMouseOver(e) {
            var layer = e.target;

            if(layer.feature.properties.disabled && layer.feature.properties.disabled == 1){
                return false;
            }

            _this.geomap.setHighlight(layer);
            _this.chart.setHighlight('.tract_' + layer.feature.properties.OBJECTID);
        }

        //reset highlight
        function handleMouseOut(e) {
            var layer = e.target;

            if(layer.feature.properties.disabled && layer.feature.properties.disabled == 1){
                return false;
            }

            _this.geomap.resetHighlight(layer);
            _this.chart.resetHighlight('.tract_' + layer.feature.properties.OBJECTID);
        }

        //lock feature
        function handleClick(e){
            var layer = e.target;

            if(layer.feature.properties.disabled && layer.feature.properties.disabled == 1){
                return false;
            }

            //remove old lock layer
            if(_this.isLocked) {
                //if current layer is the locked layer, return
                if(_this.lockedTractId === layer.feature.properties['OBJECTID']){
                    _this.lockedTractId = null;
                    _this.geomap.resetLocker();
                    _this.chart.resetLocker();
                }else{
                    _this.geomap.resetLocker();
                    _this.chart.resetLocker();

                    setNewLocker();
                }
            }else{
                setNewLocker();
            }

            function setNewLocker(){
                _this.lockedTractId = layer.feature.properties['OBJECTID'];

                _this.geomap.setLocker(layer);
                _this.chart.setLocker('.tract_' + _this.lockedTractId);
            }
        }

    },
    createLegend: function(){
        var _this = hi;
        var threshold = _this.currentGroupThreshold;
        var unit = _this.process.getUnit();
        var ranges = [
            format(threshold.p80) + ' - ' + format(threshold.maxVal),
            format(threshold.p60) + ' - ' + format(threshold.p80),
            format(threshold.p40) + ' - ' + format(threshold.p60),
            format(threshold.p20) + ' - ' + format(threshold.p40),
            format(threshold.minVal) + ' - ' + format(threshold.p20)
        ];

        var data = {
            currentIndicatorName: _this.currentIndicatorName,
            colors: _this.currentColors,
            unit: unit,
            ranges: ranges
        };

        var html = template('legend', data);
        $('#legend').html(html);

        function format(num){
            return numeral(num).format('0a');
        }
    },
    openFixedPopup: function(layer){
        var _this = hi;
        var properties = layer.feature.properties;
        var $popup = $('#map-popup');
        var tractId = properties.OBJECTID;

        var data = {
            tract_id: tractId,
            tract_name: 'TRACT ' + properties.NAME10,
            total_pop: properties.Total_Population,
            total_birth_pop: properties.Total_Births,
            color: _this.isLocked ? _this.currentColor : layer.options.fillColor,
            income: {
                name: _this.indicatorNames[0],
                num: properties.Median_household_income
            },
            weight: {
                name: _this.indicatorNames[1],
                num: properties.LowBirthw,
                pct: format(properties.LowBirthw/properties.Total_Births)
            },
            teen: {
                name: _this.indicatorNames[2],
                num: properties.BirthsTeens,
                pct: format(properties.BirthsTeens/properties.Total_Births)

            },
            premature: {
                name: _this.indicatorNames[3],
                num: properties.PreBirths,
                pct: format(properties.PreBirths/properties.Total_Births)

            },
            insurance: {
                name: _this.indicatorNames[4],
                num: properties.Pop_wNo_Health_Ins,
                pct: format(properties.Pop_wNo_Health_Ins/properties.Total_Population)

            },
            hospital: {
                name: _this.indicatorNames[5],
                num: _this.facilityCountData.hospital[tractId],
                max: 3

            },
            emergency: {
                name: _this.indicatorNames[6],
                num: _this.facilityCountData.emergency[tractId],
                max: 5
            },
            demographic: {
                education: {
                    title: "Educational Attainment 2012",
                    name: ["Population with Less than a High School or GED Education",
                        "Population with a Bachelor's Degree or Higher"],
                    num: [properties.Less_than_HS_or_GED, properties.BA_or_Higher],
                    pct: [properties.Pct_Less_than_HS_or_GED, properties.Pct_BA_or_Higher]
                },
                unemployment:{
                    title: "Unemployment 2012",
                    name: ["Population with 16 Years and Over", "Civilian Labor Force", "Civilian Labor Force Unemployed"],
                    num: [properties.Pop_16_Years_and_Over, properties.CivilLaborForce, properties.Unemp_CivilLaborForce],
                    pct: ['', properties.Pct_CivilLaborForce, properties.Pct_Unempl_CivilLaborForce]
                }
            }
        };

        var content = template('map-popup', data);

        $popup.find('.content').html(content).end().show();

        $popup.find('.show-more-info').on('click', function(e){
            e.preventDefault();

            $(this).toggleClass('is-shown');
            $('.more-info').toggle();
        });

        function format(num){
            return numeral(num).format('0.00%');
        }

        //addEvent
        $popup.off();
        $popup.on('click', '.close', function(e){
            e.preventDefault();

            _this.geomap.resetLocker();
            _this.chart.resetLocker();
        });

        _this.currentTract = data;
    },
    closeFixedPopup: function(){
        var _this = hi;

        if(!_this.popupLayer){
            var $popup = $('#map-popup');
            $popup.hide();

            _this.popupLayer = null;
        }
    },
    createGrid: function(){
        var bbox = [
            -85.33823447054434,
            33.178626321468165,
            -83.50593195157465,
            34.51410261996982
        ];
        var cellWidth = 2.8;
        var units = 'miles';

        grid = turf.squareGrid(bbox, cellWidth, units);

        L.mapbox.featureLayer().setGeoJSON(grid).addTo(map);
    },
    setHighlight: function(layer){
        var _this = hi;

        layer.setStyle({
            opacity: 1
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }

        if(!_this.isLocked){
            //show popup
            _this.geomap.openFixedPopup(layer);
        }

    },
    resetHighlight: function(layer){
        var _this = hi;

        layer.setStyle({
            opacity: 0
        });

        if(!_this.isLocked){
            //close popup
            _this.geomap.closeFixedPopup();
        }
    },
    setLocker: function(layer){
        var _this = hi;

        //set new lock layer
        _this.currentColor = layer.options.fillColor;
        _this.lockedLayer = layer;
        _this.isLocked = true;
        _this.lockedLayer.setStyle({
            fillColor: _this.strokeColor
        });

        _this.geomap.openFixedPopup(layer);
    },
    resetLocker: function(){
        var _this = hi;
        //reset previous layer
        _this.lockedLayer.setStyle({
            fillColor: _this.currentColor
        });
        _this.geomap.closeFixedPopup();
        _this.lockedLayer = null;
        _this.isLocked = false;
    },
    startLoading: function(){
        var selector = '.map-loading-overlay';
        var $map = $('#map');

        $(selector).css({
            width: $map.width(),
            height: $map.height(),
            display: 'table'
        });
    },
    stopLoading: function(){
        var selector = '.map-loading-overlay';

        $(selector).fadeOut(150);
    },
    setLockerByAddress: function(address){
        var _this = hi;
        var address = encodeURIComponent(address);
        var requestUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + address + '%20Atlanta%20Atlanta%20GA.json?access_token=' + _this.accessToken + '&country=us&types=address&autocomplete=true';

        if(_this.isLocked){
            _this.lockedTractId = null;
            _this.geomap.resetLocker();
            _this.chart.resetLocker();
        }

        $.get(requestUrl, function(data){
            console.log(data);

            var center = data.features[0].center;
            //var center = [-84.3963, 33.7756];

            var point = {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "Point",
                    "coordinates": center
                }
            };

            $.each(_this.cartoMapData.features, function(index, geoItem){
                var poly = {
                    "type": "Feature",
                    "properties": {},
                    "geometry": geoItem.geometry
                };

                //check inside
                if(turf.inside(point, poly)){
                    _this.lockedTractId = geoItem.properties.OBJECTID;

                    //change layer color on map to point out location of the tracts
                    _this.geoLayer.eachLayer(function(layer) {
                        if (layer.feature.properties.OBJECTID == _this.lockedTractId) {

                            _this.geomap.setLocker(layer);

                            return false;
                        }
                    });

                    _this.chart.setLocker('.tract_' + _this.lockedTractId);
                }

            });
        })
    }
};