hi.geomap = {
    createMap: function(){
        var _this = hi;
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
    createBoundaryLayer: function(){
        var _this = hi;

        /*L.mapbox.featureLayer().setGeoJSON(boundaryjson).setStyle({
         fillOpacity: 0,
         weight: 1,
         color: '#B5BDC1'
         }).addTo(_this.map);*/


    },
    createGeoLayer: function(){
        var _this = hi;
        var geoData = _this.currentMapType === 'carto' ? _this.boundaryData : _this.gridMapData;
        //var geoData =  _this.boundaryData;
        var type = _this.currentMapType;
        var map = _this.map;
        var chartCode = _this.currentIndicatorCode;
        var relationObj = _this.process.transformToObject();
        var originStyle = {};


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


        //highlight feature when hovering
        function highlightFeature(e) {
            var layer = e.target;
            originStyle = layer.options;

            //change highlight style
            _this.geomap.setHighlight(layer);
            _this.charts.setHighlight('.tract_' + _this.currentTractId);
        }

        function lockFeature(e){
            var currentLayer = e.target;

            //remove old lock layer
            if(_this.lockedLayer !== null){
                //reset previous layer
                _this.lockedLayer.setStyle({
                    fillOpacity: 1
                });
                _this.geomap.closePopup();

                //if current layer is the locked layer, remove locker
                if(_this.lockedLayer.feature.properties['GEOID10'] === currentLayer.feature.properties['GEOID10']){
                    _this.isLocked = false;
                    _this.lockedLayer = null;
                }else{
                    //set current layer
                    _this.lockedLayer = currentLayer;
                    _this.lockedLayer.setStyle({
                        fillOpacity: 0.5
                    });

                    _this.geomap.openPopup(currentLayer);
                }
            }else{
                _this.lockedLayer = currentLayer;
                _this.lockedLayer.setStyle({
                    fillOpacity: 0.5
                });

                _this.isLocked = true;
            }

        }

        //reset highlight
        function resetHighlight(e) {
            //_this.geoLayer.resetStyle(e.target);
            var layer = e.target;

            _this.geomap.resetHighlight(layer);
            _this.charts.resetHighlight('.tract_' + _this.currentTractId);
        }

        function onEachFeature(feature, layer) {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight/*,
                click: lockFeature*/
            });
        }

        //L.mapbox.featureLayer().setGeoJSON(gridjson).addTo(map);

    },
    openPopup: function(layer){
        var _this = hi;
        var properties = layer.feature.properties;
        var latLngs = layer._latlngs;
        _this.currentTractId = properties.OBJECTID;

        //calculate the coordinate
        var poly = {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [latLngs[0].lng, latLngs[0].lat],
                    [latLngs[1].lng, latLngs[1].lat],
                    [latLngs[2].lng, latLngs[2].lat],
                    [latLngs[3].lng, latLngs[3].lat]
                ]]
            }
        };

        var center = turf.centroid(poly).geometry.coordinates;

        var data = {
            tract_name: 'TRACT ' + properties.NAME10,
            total_pop: properties.Total_Population,
            total_birth_pop: properties.Total_Births__2008_2012,
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

        //show detail
        _this.popupLayer = L.popup({closeButton: false, offset: [0, -15]})
            .setLatLng([center[1], center[0]])
            .setContent(content)
            .openOn(_this.map);

        function format(num){
            return numeral(num).format('0.00%');
        }

        _this.currentTract = data;
    },
    closePopup: function(){
        var _this = hi;

        if(_this.popupLayer){
            _this.map.closePopup(_this.popupLayer);
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
            _this.geomap.openPopup(layer);
        }

    },
    resetHighlight: function(layer){
        var _this = hi;

        layer.setStyle({
            opacity: 0
        });

        if(!_this.isLocked){
            //close popup
            _this.geomap.closePopup();
        }
    }

};