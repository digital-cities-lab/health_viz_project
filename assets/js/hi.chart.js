;d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};
d3.selection.prototype.moveToBack = function() {
    return this.each(function() {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};

hi.chart = {
    createBoxplot: function(options){
        var _this = hi;

        var settings = $.extend({
            selector: '#chart-low-weight',
            groups: _this.groups,
            type: 'num',
            width: 480,
            height: 240,
            margin: {top: 20, right: 8, bottom: 20, left: 9},
            colors: _this.currentColors,
            data: [],
            matrixObject: []
        }, options);

        var matrixObject = settings.matrixObject;
        //var data = settings.data;
        var groupCount = matrixObject.length;
        var colors = settings.colors;
        var radius = 2.5;
        var maxValue = 0;

        //initialize the dimensions
        var margin = settings.margin;
        var width = settings.width - margin.left - margin.right;
        var height = settings.height - margin.top - margin.bottom;
        var boxHeight = (height / groupCount) / 2;
        var boxMarginBottom = boxHeight;
        var midline = boxHeight/ 2;

        //empty container
        $(settings.selector).html('');

        var svg = d3.select(settings.selector)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //caculate the maximum of all data
        var dataArray = [];
        $.each(matrixObject, function(i, groupObjects){
            $.each(groupObjects, function(j, object){
                if(settings.type === 'pct') {
                    dataArray.push(object.pct);
                }else{
                    dataArray.push(object.value);
                }
            });
        });
        dataArray = dataArray.sort(d3.ascending);
        maxValue = d3.max(dataArray);

        //initialize the x scale
        var xScale = d3.scale.linear()
            .range([0, width]);

        //map the domain to the x scale +10%
        xScale.domain([0, maxValue * 1]);

        //initialize the x axis
        var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom");

        if(settings.type === 'pct'){
            xAxis.tickFormat(d3.format("%"))
        }

        //append the axis
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0, " + height + ")")
            .call(xAxis);

        //append the div for the tooltip
        var $chartComponent = $(settings.selector).closest('.chart-component');
        if($chartComponent.find('.tooltip').length === 0){
            $chartComponent
                .append('<div class="tooltip" style="display: none"></div>');
        }

        //append boxplot for each group
        $.each(matrixObject, function(index, groupObjects){
            createBoxplotItem(groupObjects, index);
        });


        //create one boxplot item
        function createBoxplotItem(groupObjects, groupIndex){
            var outliers = [];
            var minVal = Infinity;
            var lowerWhisker = Infinity;
            var q1Val = Infinity;
            var medianVal = 0;
            var q3Val = -Infinity;
            var iqr = 0;
            var upperWhisker = -Infinity;
            var maxVal = -Infinity;
            var originData = [];
            var data = [];

            $.each(groupObjects, function(i, item){
                if(settings.type === 'pct') {
                    originData.push(item.pct);
                }else{
                    originData.push(item.value);
                }
            });

            data = originData.sort(d3.ascending);

            //calculate the boxplot statistics: http://www.purplemath.com/modules/boxwhisk3.htm
            minVal = data[0];
            q1Val = d3.quantile(data, .25);
            medianVal = d3.quantile(data, .5);
            q3Val = d3.quantile(data, .75);
            iqr = q3Val - q1Val;
            maxVal = data[data.length - 1];

            var container = svg.append("g")
                .attr("height", boxHeight + boxMarginBottom)
                .attr("transform", "translate(0, " + (boxHeight + boxMarginBottom) * groupIndex + ")");

            var index = 0;

            //search for the lower whisker, the mininmum value within q1Val - 1.5*iqr
            while (index < data.length && lowerWhisker == Infinity) {

                if (data[index] >= (q1Val - 1.5*iqr))
                    lowerWhisker = data[index];
                else
                    outliers.push(data[index]);
                index++;
            }

            index = data.length - 1; // reset index to end of array

            //search for the upper whisker, the maximum value within q1Val + 1.5*iqr
            while (index >= 0 && upperWhisker == -Infinity) {

                if (data[index] <= (q3Val + 1.5*iqr))
                    upperWhisker = data[index];
                else
                    outliers.push(data[index]);
                index--;
            }

            //draw data as points
            container.selectAll("circle")
                .data(groupObjects)
                .enter()
                .append("circle")
                .attr("r", radius)
                .attr("class", function(d) {
                    var value = settings.type === 'num'? d.value : d.pct;
                    var classStr = "tract_" + d.tractId;
                    d.disabled = 0;

                    var min = 0;
                    var max = 0;
                    if(_this.currentRange !== null){
                        min = _this.currentRange.min;
                        max = _this.currentRange.max;

                        if(d.rangeValue < min || d.rangeValue > max){
                            d.disabled = 1;
                            //return classStr + ' disabled';
                            classStr += ' disabled';
                        }
                    }

                    if (value < lowerWhisker || value > upperWhisker){
                        classStr += ' outlier';
                    }

                    return classStr;
                })
                .attr("cy", function(d) {
                    return randomJitter();
                })
                .attr("cx", function(d) {
                    var value = settings.type === 'num'? d.value : d.pct;
                    return xScale(value);
                })
                .attr("fill", function(d){
                    var value = settings.type === 'num'? d.value : d.pct;
                    if (value < lowerWhisker || value > upperWhisker){
                        d.color = _this.outlierColor;
                    }else{
                        d.color = colors[groupIndex];
                    }
                    return d.color;
                })
                .on("mouseover", handleMouseOver)
                .on("mouseout", handleMouseOut)
                .on("click", handleClick)
                .append("title");

            //draw horizontal line from lowerWhisker to upperWhisker
            container.append("line")
                .attr("class", "whisker")
                .attr("x1",  xScale(lowerWhisker))
                .attr("x2",  xScale(q1Val))
                .attr("y1", midline)
                .attr("y2", midline)
                .attr('stroke', _this.strokeColor);

            container.append("line")
                .attr("class", "whisker")
                .attr("x1",  xScale(q3Val))
                .attr("x2",  xScale(upperWhisker))
                .attr("y1", midline)
                .attr("y2", midline)
                .attr('stroke', _this.strokeColor);

            //draw rect for iqr
            container.append("rect")
                .attr("class", "box")
                .attr("x", xScale(q1Val))
                .attr("y", midline - boxHeight / 2)
                .attr("width", xScale(iqr))
                .attr("height", boxHeight)
                .attr('stroke', _this.strokeColor)
                .attr('fill', 'none');

            //draw vertical line at median
            container.append("line")
                .attr("class", "median")
                .attr("x1", xScale(medianVal))
                .attr("x2", xScale(medianVal))
                .attr("y1", midline - boxHeight / 2)
                .attr("y2", midline + boxHeight / 2)
                .attr('stroke', _this.strokeColor)
                .attr('stroke-width', 2);

        }

        //event
        function handleMouseOver(d) {
            if(d.disabled == 1){
                return false;
            }
            //change layer color on map to point out location of the tracts
            _this.geoLayer.eachLayer(function(layer) {
                if (layer.feature.properties.OBJECTID == d.tractId) {

                    _this.geomap.setHighlight(layer);

                    return false;
                }
            });

            _this.chart.setHighlight(this, d);
        }

        function handleMouseOut(d) {
            if(d.disabled == 1){
                return false;
            }
            //reset
            _this.geoLayer.eachLayer(function(layer) {
                if (layer.feature.properties.OBJECTID == d.tractId) {

                    _this.geomap.resetHighlight(layer);

                    return false;
                }
            });

            _this.chart.resetHighlight(this);
        }

        function handleClick(d){
            var that = this;

            //remove old lock layer
            if(_this.isLocked) {
                //if current circle is the locked circle, return
                if(_this.lockedTractId === d.tractId){
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
                _this.lockedTractId = d.tractId;

                //change layer color on map to point out location of the tracts
                _this.geoLayer.eachLayer(function(layer) {
                    if (layer.feature.properties.OBJECTID == _this.lockedTractId) {

                        _this.geomap.setLocker(layer);

                        return false;
                    }
                });

                _this.chart.setLocker(that);
            }
        }

        //show circle ramdonly
        function randomJitter() {
            if (Math.round(Math.random() * 1) == 0)
                var seed = - boxHeight / 3;
            else
                var seed = boxHeight / 3;
            return midline + Math.floor((Math.random() * seed) + 1);
        }
    },
    createAllBoxplots: function(){
        var _this = hi;
        var matrixObject = {};          //cache tract id
        var groupCount = _this.groups.length;

        //initialize matrix
        $.each(_this.indicatorIds, function(chartIndex, chartId){
            matrixObject[chartId] = [];
            for(var i = 0; i < groupCount; i++){
                matrixObject[chartId][i] = [];
            }
        });

        $.each(_this.healthData, function(index, item){
            var itemVal = item[_this.currentIndicatorCode];
            var groupIndex = _this.process.getGroupIndex(itemVal);
            var objectId = item.OBJECTID;

            $.each(_this.indicatorCodes, function(chartIndex, chartCode){
                var tmpId = _this.indicatorIds[chartIndex]; //chart id
                var tmp = 0;
                var value = 0;
                var totalBirth = 0;
                var totalPop = 0;
                var pct = 0;

                //calculate facilities count
                if(tmpId === 'emergency' || tmpId === 'hospital'){
                    var facilityArray = _this.facilityProjection[tmpId];
                    var facilityCount = facilityArray[objectId] && facilityArray[objectId].length ? facilityArray[objectId].length : 0;
                    tmp = facilityCount;
                }else{
                    tmp = item[chartCode];
                }

                //transform to numeric type
                value = tmp - 0;

                //calculate percentage
                if(totalBirth === 0){
                    totalBirth = item['Total_Births'] - 0;
                }

                if(tmpId === 'weight' || tmpId === 'teen' || tmpId === 'premature'){
                    if(totalBirth === 0){
                        pct = 0;
                    }else{
                        pct = numeral(value / totalBirth).format('0.000');
                    }
                }else if(tmpId === 'insurance'){
                    pct = (item['Pct_Pop_wNo_Health_Ins'] - 0) / 100;
                }else{
                    pct = 0;
                }

                pct = numeral(pct).value();

                //don't save data from undefined tracts
                for(var i = 0; i < groupCount; i++){
                    if(groupIndex === i){
                        if(tmp !== ''){
                            matrixObject[tmpId][i].push({
                                value: value,
                                tractId: objectId,
                                chartId: tmpId,
                                pct: pct,
                                rangeValue: item[_this.currentIndicatorCode],
                            });
                        }
                    }
                }
            });
        });

        //cache matrix object data
        _this.chartData.matrixObject = matrixObject;

        //show boxplot
        $.each(_this.indicatorIds, function(chartIndex, chartId){
            _this.chart.createBoxplot({
                selector: '#chart-' + chartId,
                matrixObject: matrixObject[chartId]
            });
        });

        //show boxplot legend
        _this.chart.createChartLegend();

        //bind events
        _this.chart.addEventListener();
    },
    updateAllBoxplots: function(){
        var _this = hi;

        //clear right panel
        $.each(_this.indicatorIds, function(chartIndex, chartId){
            $('#chart-' + chartId).html('');
        });

        //clear tooltip
        $('.tooltip').remove();

        _this.chart.createAllBoxplots();

        _this.chart.stopLoading();
    },
    createChartLegend: function(){
        //show boxplot legend
        var _this = hi;
        var data = [];

        $.each(_this.chartData.matrixObject[_this.currentIndicatorId], function(index, item){
            data.push(item.length);
        });

        $('#chart-legend-container').html(template('chart-legend', {data: data, colors: _this.currentColors}));
        $("#chart-legend").makeFixed({
            container: '#panel',
            defTopPos: 47
        });
    },
    setHighlight: function(selector, data){
        var _this = hi;
        var data = data || {};
        var selector = typeof(selector) === 'string' ? selector : '.' + selector.getAttribute('class').replace(' is-locked', '').replace(' outlier', '');
        var elements = d3.selectAll(selector + ':not(.is-locked)');

        //update circles
        elements
            .attr('r', 5)
            .attr('stroke', _this.strokeColor)
            .attr('stroke-width', 2)
            //.attr('fill', data.color)
            .attr('stroke-opacity', 1)
            /*.style({
                'stroke': _this.strokeColor,
                'stroke-width': 2,
                'fill': data.color,
                'stroke-opacity': 1
            })*/
            .moveToFront();


        if(!_this.isLocked){
            //update tooltip
            _this.chart.closeTooltip();

            $.each($(selector), function(index, item){
                var $parent = $(item).closest('.chart-component');
                _this.chart.updateTooltip($parent, '.' + $(item).attr('class'));
            });
        }

    },
    resetHighlight: function(selector){
        var _this = hi;

        if(!_this.isLocked){
            _this.chart.closeTooltip();
        }

        var selector = typeof(selector) === 'string' ? selector : '.' + selector.getAttribute('class').replace(' is-locked', '').replace(' outlier', '');
        //if the dot has class "is-locked", prevent from removing highlighting style
        var elements = d3.selectAll(selector + ':not(.is-locked)');

        elements
            .attr('r', 2.5)
            .attr('stroke-opacity', 0)
            /*.style({
                'stroke-opacity': 0
            })*/
            .moveToBack();

    },
    setLocker: function(selector){
        var _this = hi;
        var selector = typeof(selector) === 'string' ? selector : '.' + selector.getAttribute('class').replace(' is-locked', '').replace(' outlier', '');

        //lock dots
        _this.chart.setLockedCircle(selector);

        //update tooltips
        $.each($(selector), function(index){
            var $parent = $('.chart-component').eq(index);
            _this.chart.updateTooltip($parent, '.tract_' + _this.lockedTractId);
        });
    },
    resetLocker: function(){
        var _this = hi;

        //reset locked dots
        _this.chart.resetLockedCircle('.is-locked');

        //hide tooltips
        _this.chart.closeTooltip();
    },
    addEventListener: function(){
        var _this = hi;

        //switch between "persons" and "percentage"
        $('.chart-title .button-group').on('click', '.button:not(.active)', function(){
            var $this = $(this);
            var chartId = $this.data('chartId');
            var type = $this.data('type');
            var parentSelector = '#chart-component-' + chartId;
            var $parent = $this.closest(parentSelector);

            _this.chart.createBoxplot({
                selector: '#chart-' + chartId,
                type: type,
                matrixObject: _this.chartData.matrixObject[chartId]
            });

            $parent.find('.button').removeClass('active');
            $this.addClass('active');

            if(_this.isLocked){
                var selector = '.tract_' + _this.lockedTractId;

                _this.chart.setLockedCircle(parentSelector + ' ' + selector);
                _this.chart.updateTooltip(parentSelector, selector);
            }
        });
    },
    //container: #chart-component-weight, selector: .tract_343
    updateTooltip: function(container, selector){
        var _this = hi;
        var $panel = $('#panel');
        var panelLeft = parseInt($panel.css('left'));

        var item = $(container).find(selector)[0];
        var $tooltip = $(container).closest('.chart-component').find('.tooltip');
        if(!d3.select(item).data()[0]){
            return;
        }
        var chartId = d3.select(item).data()[0].chartId;

        $tooltip.html(template('chart-popup', {data: _this.currentTract, chartId: chartId}));

        var left = $(item).offset().left - panelLeft - $tooltip.width()/2 - 5;
        var top = $(item).offset().top + $(item).scrollTop() + $panel.scrollTop() - parseInt($panel.css('top')) - $tooltip.height() - 30;

        $tooltip
            .css({
                'left': (left < 0 ? 0 : left) + 'px',
                'top': top + 'px'
            })
            .show();

    },
    closeTooltip: function(){
        $('.tooltip').hide();
    },
    setLockedCircle: function(selector){
        var _this = hi;
        var elements = d3.selectAll(selector);

        elements
            .attr('r', 5)
            /*.style({
                'stroke': _this.strokeColor,
                'stroke-width': 2,
                'fill': _this.strokeColor,
                'stroke-opacity': 1
            })*/
            .attr('stroke', _this.strokeColor)
            .attr('stroke-width', 2)
            .attr('fill', _this.strokeColor)
            .attr('stroke-opacity', 1)
            .classed('is-locked', true)
            .moveToFront();
    },
    resetLockedCircle: function(selector){
        var _this = hi;
        var elements = d3.selectAll(selector)[0];

        elements.forEach(function(element){
            var color = _this.currentColor;

            var element = d3.select(element);
            if(element.classed('outlier')){
                color = _this.outlierColor;
            }

            element
                .attr('r', 2.5)
                .attr('stroke-opacity', 0)
                .attr('fill', color)
                /*.style({
                    'stroke-opacity': 0,
                    'fill': color
                })*/
                .classed('is-locked', false)
                .moveToBack();
        });

    },
    startLoading: function(){
        var selector = '.chart-loading-overlay';

        $(selector).css('display', 'table');
    },
    stopLoading: function(){
        var selector = '.chart-loading-overlay';

        $(selector).fadeOut(150);
    }

};