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

hi.charts = {
    createBoxplot: function(options){
        var _this = hi;

        var settings = $.extend({
            selector: '#chart-low-weight',
            groups: _this.groups,
            type: 'num',
            width: 480,
            height: 240,
            margin: {top: 20, right: 8, bottom: 20, left: 9},
            colors: _this.groupColors,
            data: [],
            matrixObject: []
        }, options);

        //initialize boxplot statistics
        function showBoxPlot(matrixObject, data){

            var groupCount = matrixObject.length;
            var colors = settings.colors;
            var radius = 2.5;
            var maxValue = 0;

            //initialize the dimensions
            var margin = settings.margin,
                width = settings.width - margin.left - margin.right,
                height = settings.height - margin.top - margin.bottom,
                boxHeight = (height / groupCount) / 2,
                boxMarginBottom = boxHeight,
                midline = boxHeight/ 2;

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

            //define the div for the tooltip
            _this.charts.initTooltip();

            //append boxplot for each group
            $.each(matrixObject, function(index, groupObjects){
                showBoxPlotItem(groupObjects, index);
            });

            function showBoxPlotItem(groupObjects, groupIndex){
                var data = [],
                    outliers = [],
                    minVal = Infinity,
                    lowerWhisker = Infinity,
                    q1Val = Infinity,
                    medianVal = 0,
                    q3Val = -Infinity,
                    iqr = 0,
                    upperWhisker = -Infinity,
                    maxVal = -Infinity;

                var originData = [];

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
                        return "tract_" + d.tractId;
                    })
                    .attr("opacity", function(d){
                        return 1;
                    })
                    .attr("cy", function(d) {
                        return random_jitter();
                    })
                    .attr("cx", function(d) {
                        var value = settings.type === 'num'? d.value : d.pct;
                        return xScale(value);
                    })
                    .attr("fill", function(d){
                        var value = settings.type === 'num'? d.value : d.pct;
                        if (value < lowerWhisker || value > upperWhisker){
                            d.color = '#F7BB4D';
                        }else{
                            d.color = colors[groupIndex];
                        }
                        return d.color;
                    })
                    .on("mouseover", handleMouseOver)
                    .on("mouseout", handleMouseOut)
                    .append("title");



                //draw verical line for lowerWhisker
                /*container.append("line")
                 .attr("class", "whisker")
                 .attr("x1", xScale(lowerWhisker))
                 .attr("x2", xScale(lowerWhisker))
                 .attr("stroke", "#041725")
                 .attr("stroke-width", 2)
                 .attr("y1", midline - boxHeight / 4 )
                 .attr("y2", midline + boxHeight / 4);*/

                //draw vertical line for upperWhisker
                /* container.append("line")
                 .attr("class", "whisker")
                 .attr("x1", xScale(upperWhisker))
                 .attr("x2", xScale(upperWhisker))
                 .attr("stroke", "#041725")
                 .attr("stroke-width", 2)
                 .attr("y1", midline - boxHeight / 4)
                 .attr("y2", midline + boxHeight / 4);*/

                //draw horizontal line from lowerWhisker to upperWhisker
                container.append("line")
                    .attr("class", "whisker")
                    .attr("x1",  xScale(lowerWhisker))
                    .attr("x2",  xScale(q1Val))
                    .attr("stroke", _this.strokeColor)
                    .attr("y1", midline)
                    .attr("y2", midline);

                container.append("line")
                    .attr("class", "whisker")
                    .attr("x1",  xScale(q3Val))
                    .attr("x2",  xScale(upperWhisker))
                    .attr("stroke", _this.strokeColor)
                    .attr("y1", midline)
                    .attr("y2", midline);

                //draw rect for iqr
                container.append("rect")
                    .attr("class", "box")
                    .attr("stroke", _this.strokeColor)
                    .attr("fill", "none")
                    .attr("x", xScale(q1Val))
                    .attr("y", midline - boxHeight / 2)
                    .attr("width", xScale(iqr))
                    .attr("height", boxHeight);

                //draw vertical line at median
                container.append("line")
                    .attr("class", "median")
                    .attr("stroke", _this.strokeColor)
                    .attr("stroke-width", 2)
                    .attr("x1", xScale(medianVal))
                    .attr("x2", xScale(medianVal))
                    .attr("y1", midline - boxHeight / 2)
                    .attr("y2", midline + boxHeight / 2);

            }

            //event
            function handleMouseOver(d) {
                _this.currentTractId = d.tractId;

                //change layer color on map to point out location of the tracts
                _this.geoLayer.eachLayer(function(layer) {
                    if (layer.feature.properties.OBJECTID == _this.currentTractId) {

                        _this.geomap.setHighlight(layer);

                        return false;
                    }
                });

                _this.charts.setHighlight(this, d);
            }

            function handleMouseOut() {
                //reset
                _this.geoLayer.eachLayer(function(layer) {
                    if (layer.feature.properties.OBJECTID == _this.currentTractId) {

                        _this.geomap.resetHighlight(layer);

                        return false;
                    }
                });

                _this.charts.resetHighlight(this);
            }

            //show circle ramdonly
            function random_jitter() {
                if (Math.round(Math.random() * 1) == 0)
                    var seed = - boxHeight / 3;
                else
                    var seed = boxHeight / 3;
                return midline + Math.floor((Math.random() * seed) + 1);
            }
        }

        showBoxPlot(settings.matrixObject, settings.data);
    },
    initTooltip: function(){
        d3.select('#panel').append("div")
            .attr("class", "tooltip")
            .style("display", 'none');
    },
    setHighlight: function(selector, data){
        var _this = hi;
        var data = data || {};
        var $panel = $('#panel');
        var panelLeft = parseInt($panel.css('left'));

        var elements = null;

        if(typeof(selector) === 'string'){
            elements = d3.selectAll(selector);
        }else{
            elements = d3.select(selector)
        }

        elements
            .attr('r', 5)
            .style({
                'stroke': _this.strokeColor,
                'stroke-width': 2,
                'stroke-opacity': 1
            })
            .moveToFront();


        if($(selector).length === 1){
            //hover on dot to show tooltip
            var $tooltip = $('.tooltip').eq(0);
            var left = d3.event.pageX - panelLeft - $tooltip.width()/2 - 5;
            var top = d3.event.pageY + $panel.scrollTop() - parseInt($panel.css('top')) - $tooltip.height() - 30;

            $tooltip.show();

            $tooltip.html(template('chart-popup', {data: _this.currentTract, chartId: data.chartId}))
                .css("left", (left < 0 ? 0 : left) + "px")
                .css("top", top + "px");
        }else{
            //hover on map to show tooltips
            $.each($(selector), function(index, item){
                var $tooltip = $('.tooltip').eq(index);
                var chartId = d3.select(item).data()[0].chartId;
                var left = $(item).offset().left - panelLeft - $tooltip.width()/2 - 5;
                var top = $(item).offset().top + $(item).scrollTop() + $panel.scrollTop() - parseInt($panel.css('top')) - $tooltip.height() - 30;

                $tooltip.show();

                $tooltip.html(template('chart-popup', {data: _this.currentTract, chartId: chartId}))
                    .css("left", (left < 0 ? 0 : left) + "px")
                    .css("top", top + "px");
            })
        }
    },
    resetHighlight: function(selector){
        var _this = hi;
        if(!_this.isLocked){
            var elements = null;

            if(typeof(selector) === 'string'){
                elements = d3.selectAll(selector);
            }else{
                elements = d3.select(selector)
            }

            elements
                .attr('r', 2.5)
                .style({
                    'stroke-opacity': 0
                })
                .moveToBack();

            //close tooltip
            $('.tooltip').hide();
        }
    },
    updateChartLegend: function(){
        //show boxplot legend
        var _this = hi;
        var data = [];

        $.each(_this.chartData.matrixObject[_this.currentIndicatorId], function(index, item){
            data.push(item.length);
        });

        $('#chart-legend').html(template('chart-legend', {data: data}));
    },
    addEventListener: function(){
        var _this = hi;

        $('.button-group').on('click', '.button:not(.active)', function(){
            var $this = $(this);
            var $parent = $this.closest('.chart-component');
            var type = $this.data('type');
            var chartId = $this.data('chartId');

            _this.charts.createBoxplot({
                selector: '#chart-' + chartId,
                type: type,
                data: _this.chartData.data[chartId],
                matrixObject: _this.chartData.matrixObject[chartId]
            });

            $parent.find('.button').removeClass('active');
            $this.addClass('active');
        })
    }
};