hi.geomap = {
    createMap: function(){
        var _this = hi;

        //create map
        var mapStyleUrl = 'mapbox://styles/xiaoxuezhang/ciy0tczyo005k2rqjn4oncbhp';
        L.mapbox.accessToken = 'pk.eyJ1IjoieGlhb3h1ZXpoYW5nIiwiYSI6ImNpc2dzcWN5eTAwMGoyeW1zcTI5OTQ3YTgifQ.DCqBTREvXqcE1iEeVNwoYQ';

        var map = L.mapbox.map('map')
            .setView([33.8356178, -84.3984737], 9);

        var styleLayer = L.mapbox.styleLayer(mapStyleUrl)
            .addTo(map);

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
        //create geo layer after map initialized
        _this.geomap.createGeoLayer();
        _this.geomap.createLegend();
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

                //show map and charts
                _this.geomap.createGeoLayer();
            });

        }else{
            _this.geomap.createGeoLayer();
        }
    },
    updateMap: function(){
        var _this = hi;

        if(_this.geoLayer !== null){
            _this.geoLayer.clearLayers();
        }
        _this.geomap.createGeoLayer();
        _this.geomap.createLegend();
    },
    createGeoLayer: function(){
        var _this = hi;
        var geoData = _this.currentMapType === 'carto' ? _this.cartoMapData : _this.gridMapData;
        //var geoData =  _this.cartoMapData;
        var type = _this.currentMapType;
        var map = _this.map;
        var chartCode = _this.currentIndicatorCode;
        var relationObj = _this.process.transformToObject();


        geoData.features.forEach(function(cell, index) {
            //get info
            var tractIndex = relationObj[index];
            cell.properties = _this.healthData[tractIndex];

            var cellVal = cell.properties[chartCode] - 0;
            var groupIndex = _this.process.getGroupIndex(cellVal);
            var color = _this.currentColors[groupIndex];
/*
            if(type === 'carto'){
                cell.properties.style = {
                    fillColor: color,
                    fillOpacity: 1,
                    opacity: 0,
                    color: color
                };
            }else{*/
                cell.properties.style = {
                    fillColor: color,
                    fillOpacity: 1,
                    color: _this.strokeColor,
                    weight: 2,
                    opacity: 0
                };
            //}
        });

        //apply styles and events
        _this.geoLayer = L.geoJson(geoData, {style: {smoothFactor: 0}, onEachFeature: onEachFeature})
            .eachLayer(function(l) {
                l.setStyle(l.feature.properties.style);
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
            //_this.lockedTractId = layer.feature.properties.OBJECTID;

            _this.geomap.setHighlight(layer);
            _this.chart.setHighlight('.tract_' + layer.feature.properties.OBJECTID);
        }

        //reset highlight
        function handleMouseOut(e) {
            var layer = e.target;
            //_this.lockedTractId = layer.feature.properties.OBJECTID;

            _this.geomap.resetHighlight(layer);
            _this.chart.resetHighlight('.tract_' + layer.feature.properties.OBJECTID);
        }

        //lock feature
        function handleClick(e){
            var layer = e.target;

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

        var data = {
            tract_id: properties.OBJECTID,
            tract_name: 'TRACT ' + properties.NAME10,
            total_pop: properties.Total_Population,
            total_birth_pop: properties.Total_Births__2008_2012,
            color: _this.isLocked ? _this.currentColor : layer.options.fillColor,
            income: {
                name: _this.indicatorNames[0],
                num: properties.Median_household_income
            },
            weight: {
                name: _this.indicatorNames[1],
                num: properties.LowBirthw_2500_grams_2008_2012,
                pct: format(properties.LowBirthw_2500_grams_2008_2012/properties.Total_Births__2008_2012)
            },
            teen: {
                name: _this.indicatorNames[2],
                num: properties.BirthsTeens_15_19_2008_2012,
                pct: format(properties.BirthsTeens_15_19_2008_2012/properties.Total_Births__2008_2012)

            },
            premature: {
                name: _this.indicatorNames[3],
                num: properties.PreBirths_37wks_Gest_2008_2012,
                pct: format(properties.PreBirths_37wks_Gest_2008_2012/properties.Total_Births__2008_2012)

            },
            insurance: {
                name: _this.indicatorNames[4],
                num: properties.Pop_wNo_Health_Ins,
                pct: format(properties.Pop_wNo_Health_Ins/properties.Total_Population)

            },
            hospital: {
                name: _this.indicatorNames[5],
                num: properties.Hospital_Amount,
                max: 3

            },
            emergency: {
                name: _this.indicatorNames[6],
                num: properties.Emergency_Amount,
                max: 5
            }
        };

        var content = template('map-popup', data);

        $popup.find('.content').html(content).end().show();

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
            //_this.geomap.openPopup(layer);
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
    }
};