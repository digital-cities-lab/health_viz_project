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

var hi = {
    healthData: {},
    facilityProjection: {},
    gridMapData: {},
    boundaryShapeData: {},
    map: null,
    geoLayer: null,
    popupLayer : null,
    groups: ['Top Fifth', 'Upper Middle', 'Middle', 'Lower Middle', 'Bottom Fifth'],
    groupColors: ['#00C8FF', '#4096BF', '#806480', '#BF3240', '#FF0000', '#DBE2E6'],
    groupThreshold: {},
    tract2grid: [[0,12],[1,13],[2,9],[3,16],[4,20],[5,5],[6,7],[7,4],[8,1],[9,8],[10,17],[11,10],[12,11],[13,3],[14,18],[15,0],[16,2],[17,150],[18,121],[19,149],[20,181],[21,241],[22,365],[23,304],[24,273],[25,242],[26,151],[27,122],[28,182],[29,211],[30,212],[31,335],[32,180],[33,243],[34,213],[35,272],[36,334],[37,784],[38,814],[39,844],[40,785],[41,816],[42,842],[43,782],[44,726],[45,783],[46,870],[47,815],[48,843],[49,754],[50,813],[51,871],[52,296],[53,329],[54,201],[55,268],[56,235],[57,204],[58,139],[59,140],[60,267],[61,199],[62,237],[63,141],[64,171],[65,142],[66,170],[67,203],[68,234],[69,172],[70,227],[71,259],[72,143],[73,50],[74,236],[75,98],[76,111],[77,257],[78,258],[79,226],[80,112],[81,225],[82,194],[83,205],[84,136],[85,202],[86,108],[87,362],[88,198],[89,779],[90,750],[91,607],[92,745],[93,691],[94,636],[95,746],[96,718],[97,719],[98,693],[99,547],[100,775],[101,776],[102,721],[103,110],[104,82],[105,107],[106,79],[107,137],[108,389],[109,357],[110,228],[111,196],[112,262],[113,197],[114,518],[115,609],[116,638],[117,777],[118,778],[119,806],[120,807],[121,808],[122,488],[123,519],[124,106],[125,174],[126,163],[127,164],[128,76],[129,166],[130,113],[131,102],[132,101],[133,83],[134,114],[135,637],[136,694],[137,692],[138,717],[139,579],[140,549],[141,548],[142,667],[143,608],[144,578],[145,747],[146,666],[147,720],[148,723],[149,752],[150,751],[151,748],[152,722],[153,77],[154,78],[155,165],[156,134],[157,173],[158,131],[159,162],[160,99],[161,780],[162,836],[163,749],[164,49],[165,229],[166,260],[167,291],[168,261],[169,232],[170,231],[171,230],[172,292],[173,109],[174,80],[175,81],[176,294],[177,293],[178,263],[179,295],[180,360],[181,361],[182,298],[183,299],[184,75],[185,74],[186,145],[187,144],[188,233],[189,200],[190,169],[191,130],[192,103],[193,104],[194,324],[195,325],[196,135],[197,167],[198,168],[199,138],[200,105],[201,132],[202,100],[203,388],[204,326],[205,327],[206,359],[207,133],[208,328],[209,330],[210,195],[211,264],[212,297],[213,265],[214,290],[215,266],[216,358],[217,585],[218,306],[219,396],[220,552],[221,522],[222,460],[223,492],[224,524],[225,554],[226,491],[227,493],[228,555],[229,525],[230,495],[231,432],[232,430],[233,494],[234,307],[235,274],[236,463],[237,277],[238,428],[239,459],[240,398],[241,337],[242,369],[243,308],[244,338],[245,461],[246,246],[247,584],[248,523],[249,368],[250,400],[251,431],[252,276],[253,370],[254,397],[255,553],[256,305],[257,366],[258,399],[259,462],[260,401],[261,429],[262,245],[263,339],[264,367],[265,336],[266,275],[267,668],[268,724],[269,643],[270,490],[271,581],[272,641],[273,640],[274,725],[275,669],[276,696],[277,642],[278,670],[279,613],[280,671],[281,644],[282,697],[283,615],[284,612],[285,583],[286,753],[287,582],[288,695],[289,614],[290,781],[291,810],[292,148],[293,117],[294,59],[295,118],[296,115],[297,60],[298,146],[299,62],[300,61],[301,87],[302,86],[303,88],[304,116],[305,85],[306,147],[307,686],[308,689],[309,713],[310,742],[311,771],[312,855],[313,827],[314,853],[315,846],[316,820],[317,847],[318,874],[319,872],[320,873],[321,882],[322,905],[323,768],[324,767],[325,856],[326,854],[327,899],[328,877],[329,879],[330,900],[331,880],[332,901],[333,919],[334,902],[335,881],[336,741],[337,826],[338,769],[339,797],[340,850],[341,825],[342,824],[343,796],[344,819],[345,765],[346,794],[347,795],[348,766],[349,683],[350,709],[351,684],[352,573],[353,812],[354,840],[355,811],[356,891],[357,841],[358,866],[359,893],[360,867],[361,839],[362,868],[363,869],[364,892],[365,894],[366,603],[367,602],[368,659],[369,601],[370,688],[371,744],[372,715],[373,714],[374,743],[375,800],[376,770],[377,799],[378,828],[379,829],[380,857],[381,858],[382,772],[383,801],[384,830],[385,773],[386,802],[387,804],[388,774],[389,832],[390,803],[391,711],[392,600],[393,710],[394,631],[395,831],[396,690],[397,658],[398,712],[399,633],[400,661],[401,687],[402,660],[403,632],[404,738],[405,685],[406,572],[407,657],[408,851],[409,878],[410,852],[411,798],[412,792],[413,791],[414,823],[415,739],[416,737],[417,876],[418,822],[419,848],[420,875],[421,845],[422,821],[423,790],[424,849],[425,793],[426,764],[427,818],[428,763],[429,740],[430,708],[431,736],[432,762],[433,351],[434,154],[435,125],[436,126],[437,127],[438,314],[439,217],[440,279],[441,248],[442,155],[443,190],[444,464],[445,186],[446,926],[447,930],[448,928],[449,927],[450,929],[451,931],[452,837],[453,888],[454,889],[455,835],[456,862],[457,911],[458,912],[459,864],[460,187],[461,157],[462,218],[463,545],[464,516],[465,575],[466,485],[467,340],[468,278],[469,313],[470,288],[471,256],[472,348],[473,349],[474,409],[475,378],[476,350],[477,543],[478,310],[479,189],[480,220],[481,286],[482,317],[483,513],[484,512],[485,453],[486,482],[487,438],[488,417],[489,356],[490,387],[491,420],[492,287],[493,223],[494,192],[495,312],[496,158],[497,216],[498,224],[499,247],[500,374],[501,406],[502,316],[503,665],[504,345],[505,376],[506,421],[507,514],[508,515],[509,544],[510,185],[511,215],[512,402],[513,214],[514,184],[515,153],[516,664],[517,716],[518,574],[519,390],[520,424],[521,418],[522,442],[523,441],[524,443],[525,379],[526,411],[527,412],[528,191],[529,159],[530,128],[531,255],[532,193],[533,386],[534,452],[535,353],[536,320],[537,382],[538,383],[539,156],[540,662],[541,663],[542,634],[543,576],[544,577],[545,380],[546,381],[547,321],[548,319],[549,289],[550,323],[551,355],[552,496],[553,434],[554,466],[555,467],[556,436],[557,471],[558,160],[559,152],[560,123],[561,97],[562,129],[563,546],[564,486],[565,517],[566,606],[567,484],[568,635],[569,605],[570,604],[571,391],[572,392],[573,346],[574,439],[575,440],[576,469],[577,309],[578,341],[579,403],[580,435],[581,373],[582,161],[583,124],[584,95],[585,96],[586,94],[587,68],[588,67],[589,454],[590,455],[591,393],[592,423],[593,371],[594,372],[595,342],[596,343],[597,311],[598,404],[599,405],[600,375],[601,407],[602,422],[603,425],[604,487],[605,456],[606,183],[607,244],[608,483],[609,419],[610,408],[611,410],[612,377],[613,347],[614,344],[615,437],[616,282],[617,315],[618,284],[619,285],[620,883],[621,907],[622,451],[623,416],[624,447],[625,449],[626,385],[627,318],[628,280],[629,249],[630,281],[631,250],[632,470],[633,468],[634,465],[635,188],[636,860],[637,910],[638,859],[639,884],[640,805],[641,833],[642,925],[643,908],[644,861],[645,885],[646,354],[647,322],[648,413],[649,444],[650,384],[651,414],[652,415],[653,352],[654,219],[655,283],[656,251],[657,253],[658,252],[659,254],[660,221],[661,222],[662,433],[663,834],[664,886],[665,909],[666,863],[667,887],[668,838],[669,809],[670,865],[671,913],[672,890],[673,427],[674,611],[675,639],[676,520],[677,580],[678,610],[679,550],[680,458],[681,489],[682,521],[683,551],[684,303],[685,71],[686,70],[687,36],[688,44],[689,35],[690,64],[691,210],[692,119],[693,92],[694,41],[695,32],[696,90],[697,179],[698,120],[699,91],[700,66],[701,65],[702,45],[703,43],[704,37],[705,28],[706,46],[707,19],[708,73],[709,69],[710,42],[711,33],[712,89],[713,63],[714,23],[715,93],[716,24],[717,15],[718,47],[719,26],[720,27],[721,72],[722,34],[723,25],[724,38],[725,559],[726,728],[727,698],[728,473],[729,595],[730,624],[731,565],[732,528],[733,534],[734,561],[735,533],[736,645],[737,594],[738,526],[739,672],[740,760],[741,788],[742,674],[743,564],[744,558],[745,618],[746,557],[747,587],[748,619],[749,678],[750,650],[751,735],[752,681],[753,566],[754,535],[755,504],[756,649],[757,755],[758,620],[759,503],[760,498],[761,531],[762,500],[763,499],[764,537],[765,480],[766,706],[767,560],[768,475],[769,507],[770,477],[771,501],[772,532],[773,472],[774,527],[775,497],[776,529],[777,648],[778,647],[779,727],[780,556],[781,586],[782,616],[783,817],[784,758],[785,651],[786,646],[787,673],[788,702],[789,761],[790,703],[791,622],[792,653],[793,677],[794,629],[795,538],[796,510],[797,675],[798,617],[799,699],[800,621],[801,592],[802,733],[803,541],[804,448],[805,506],[806,446],[807,789],[808,787],[809,590],[810,591],[811,563],[812,562],[813,623],[814,679],[815,700],[816,593],[817,654],[818,734],[819,630],[820,567],[821,568],[822,680],[823,652],[824,704],[825,625],[826,676],[827,502],[828,570],[829,571],[830,505],[831,474],[832,445],[833,569],[834,589],[835,508],[836,732],[837,756],[838,530],[839,628],[840,481],[841,655],[842,656],[843,627],[844,707],[845,682],[846,626],[847,596],[848,598],[849,705],[850,757],[851,701],[852,729],[853,759],[854,786],[855,597],[856,542],[857,511],[858,450],[859,599],[860,540],[861,478],[862,476],[863,509],[864,539],[865,479],[866,730],[867,731],[868,588],[869,536],[870,269],[871,300],[872,208],[873,333],[874,332],[875,239],[876,394],[877,426],[878,331],[879,270],[880,206],[881,175],[882,177],[883,176],[884,240],[885,915],[886,897],[887,896],[888,895],[889,914],[890,898],[891,916],[892,917],[893,918],[894,932],[895,933],[896,934],[897,942],[898,943],[899,935],[900,238],[901,207],[902,302],[903,271],[904,363],[905,364],[906,178],[907,301],[908,457],[909,395],[910,209],[911,939],[912,922],[913,945],[914,941],[915,904],[916,906],[917,947],[918,938],[919,936],[920,944],[921,937],[922,920],[923,946],[924,940],[925,924],[926,903],[927,923],[928,921],[929,57],[930,39],[931,48],[932,40],[933,51],[934,55],[935,84],[936,22],[937,30],[938,21],[939,29],[940,53],[941,54],[942,14],[943,56],[944,58],[945,31],[946,52],[947,6]],
    indicatorIds: ['income', 'weight', 'teen', 'premature', 'insurance', 'hospital', 'emergency'],
    indicatorCodes: ['Median_household_income', 'LowBirthw_2500_grams_2008_2012', 'BirthsTeens_15_19_2008_2012', 'PreBirths_37wks_Gest_2008_2012', 'Pop_wHealth_Insurance', 'Hospital_Amount', 'Emergency_Amount'],
    indicatorNames: ['Median Household Income', 'Low Birth Weight Babies Born', 'Teen Pregnancy', 'Premature Births', 'Health Insurance Coverage', 'Access to Hospital Community Facilities', 'Access to Emergency Medical Service Community Facilities'],
    currentIndicatorId: 'income',
    currentIndicatorCode: 'Median_household_income',
    currentIndicatorName: 'Median Household Income',
    currentTractId: null,
    init: function(){
        var _this = this;

        //selectize
        var selectList = {};
        $.each($('.selectbox'), function(){
            var $this = $(this);
            selectList[$this.attr('id')] = $this.selectize({
                create: true
            });
        });

        $.when($.getJSON('data/health_inside_atlanta.json'), $.getJSON('data/grid.geojson'), $.getJSON('data/boundary.geojson'), $.getJSON('data/facility_projection.json')).done(function(a1, a2, a3, a4){
            //cache data to show and update charts
            _this.healthData = a1[0];
            _this.gridMapData = a2[0];
            _this.boundaryShapeData = a3[0];
            _this.facilityProjection = a4[0];

            _this.groupThreshold = _this.process.getGroupThreshold(_this.currentIndicatorCode);

            //show map and charts
            _this.showBoxplot();
            _this.showMap();
        });

        //add events
        _this.addEventListener();

        //process data
        //hi.data.getOutlier();
    },
    addEventListener: function(){
        var _this = hi;
        var $legend = $('#legend');

        $('#indicator-select').on('change', function(e){
            e.preventDefault();

            //change current indicator
            var indicatorId = $(this).val();
            _this.currentIndicatorId = indicatorId;
            _this.currentIndicatorCode = _this.indicatorCodes[_this.indicatorIds.indexOf(indicatorId)];
            _this.currentIndicatorName = _this.indicatorNames[_this.indicatorIds.indexOf(indicatorId)];

            //group data
            _this.groupThreshold = _this.process.getGroupThreshold(_this.currentIndicatorCode);

            console.log(_this.groupThreshold);

            //show map and charts
            _this.updateBoxPlot();
            _this.updateMap();

            //change legend title
            $legend.find('.legend-title').html(_this.currentIndicatorName);
        });
    },
    //show default overview charts on the right panel
    showBoxplot: function(){
        var _this = this;
        var data = {};
        var matrixData = {};         //cache data
        var matrixObject = {};          //cache tract id
        var groupCount = _this.groups.length;

        //initialize matrix
        $.each(_this.indicatorIds, function(chartIndex, chartId){
            data[chartId] = [];
            matrixData[chartId] = [];
            matrixObject[chartId] = [];
            for(var i = 0; i < groupCount; i++){
                matrixData[chartId][i] = [];
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

                //don't save data from undefined tracts
                if(tmp !== ''){
                    data[tmpId].push(value);
                }

                for(var i = 0; i < groupCount; i++){
                    if(groupIndex === i){
                        if(tmp !== ''){
                            matrixData[tmpId][i].push(value);
                            matrixObject[tmpId][i].push({
                                value: value,
                                tractId: objectId
                            });
                        }
                    }
                }
                console.log(matrixData);
            });
        });

        //show boxplot
        $.each(_this.indicatorIds, function(chartIndex, chartId){
            _this.charts.createBoxplot({
                selector: '#chart-' + chartId,
                data: data[chartId],
                matrixData: matrixData[chartId],
                matrixObject: matrixObject[chartId],
                groups: _this.groups,
                colors: _this.groupColors
            });
        });

    },
    updateBoxPlot: function(){
        var _this = hi;

        //clear right panel
        $.each(_this.indicatorIds, function(chartIndex, chartId){
            $('#chart-' + chartId).html('');
        });

        _this.showBoxplot();
    },
    showMap: function(){
        var _this = hi;

        _this.charts.createGridMap();
    },
    updateMap: function(){
        var _this = hi;

        if(_this.geoLayer !== null){
            _this.geoLayer.clearLayers();
        }
        _this.charts.createGridLayer();
    },
    charts: {
        createBoxplot: function(options){
            var _this = hi;

            var settings = $.extend({
                selector: '#chart-low-weight',
                groups: [],
                width: 420,
                height: 240,
                margin: {top: 20, right: 10, bottom: 20, left: 10},
                data: [],
                colors: [],
                matrixData: [],
                matrixObject: []
            }, options);

            //initialize boxplot statistics
            function showBoxPlot(matrix, matrixObject, data){

                var groupCount = matrix.length;
                var maxValue = 0;
                var colors = settings.colors;
                var radius = 2.5;
                var originColor = '';

                //initialize the dimensions
                var margin = settings.margin,
                    width = settings.width - margin.left - margin.right,
                    height = settings.height - margin.top - margin.bottom,
                    boxHeight = (height / groupCount) / 2,
                    boxMarginBottom = boxHeight,
                    midline = boxHeight/ 2;

                var svg = d3.select(settings.selector)
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                //caculate the maximum of all data
                var data = data.sort(d3.ascending);
                maxValue = d3.max(data);

                //initialize the x scale
                var xScale = d3.scale.linear()
                    .range([0, width]);

                //map the domain to the x scale +10%
                xScale.domain([0, maxValue * 1]);

                //initialize the x axis
                var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom");

                $.each(matrix, function(index, data){
                    showBoxPlotGroup(data, matrixObject[index], index);
                });

                //append the axis
                svg.append("g")
                    .attr("class", "axis")
                    .attr("transform", "translate(0, " + height + ")")
                    .call(xAxis);

                function showBoxPlotGroup(groupData, groupObjects, groupIndex){
                    var data = groupData,
                        outliers = [],
                        minVal = Infinity,
                        lowerWhisker = Infinity,
                        q1Val = Infinity,
                        medianVal = 0,
                        q3Val = -Infinity,
                        iqr = 0,
                        upperWhisker = -Infinity,
                        maxVal = -Infinity;

                    data = data.sort(d3.ascending);

                    //calculate the boxplot statistics
                    minVal = data[0],
                        q1Val = d3.quantile(data, .25),
                        medianVal = d3.quantile(data, .5),
                        q3Val = d3.quantile(data, .75),
                        iqr = q3Val - q1Val,
                        maxVal = data[data.length - 1];
                    // lowerWhisker = d3.max([minVal, q1Val - iqr])
                    // upperWhisker = d3.min([maxVal, q3Val + iqr]);

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

                    index = data.length-1; // reset index to end of array

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
                            if (d.value < lowerWhisker || d.value > upperWhisker)
                                return 1;
                            else
                                return 0.3;
                        })
                        .attr("cy", function(d) {
                            return random_jitter();
                        })
                        .attr("cx", function(d) {
                            return xScale(d.value);
                        })
                        .attr("fill", function(d){
                            d.color = colors[groupIndex];
                            return colors[groupIndex];
                        })
                        .on("mouseover", handleMouseOver)
                        .on("mouseout", handleMouseOut)
                        .append("title")
                        .text(function(d) {
                            var result = 'Tract ID: ' + d.tractId +
                                    'Value: ' + d.value;
                            return result;
                        });


                    //draw verical line for lowerWhisker
                    container.append("line")
                        .attr("class", "whisker")
                        .attr("x1", xScale(lowerWhisker))
                        .attr("x2", xScale(lowerWhisker))
                        .attr("stroke", "#041725")
                        .attr("stroke-width", 2)
                        .attr("y1", midline - boxHeight / 4 )
                        .attr("y2", midline + boxHeight / 4);

                    //draw vertical line for upperWhisker
                    container.append("line")
                        .attr("class", "whisker")
                        .attr("x1", xScale(upperWhisker))
                        .attr("x2", xScale(upperWhisker))
                        .attr("stroke", "#041725")
                        .attr("stroke-width", 2)
                        .attr("y1", midline - boxHeight / 4)
                        .attr("y2", midline + boxHeight / 4);

                    //draw horizontal line from lowerWhisker to upperWhisker
                    container.append("line")
                        .attr("class", "whisker")
                        .attr("x1",  xScale(lowerWhisker))
                        .attr("x2",  xScale(q1Val))
                        .attr("stroke", "#041725")
                        .attr("y1", midline)
                        .attr("y2", midline);

                    container.append("line")
                        .attr("class", "whisker")
                        .attr("x1",  xScale(q3Val))
                        .attr("x2",  xScale(upperWhisker))
                        .attr("stroke", "#041725")
                        .attr("y1", midline)
                        .attr("y2", midline);

                    //draw rect for iqr
                    container.append("rect")
                        .attr("class", "box")
                        .attr("stroke", "#041725")
                        .attr("fill", "none")
                        .attr("x", xScale(q1Val))
                        .attr("y", midline - boxHeight / 2)
                        .attr("width", xScale(iqr))
                        .attr("height", boxHeight);

                    //draw vertical line at median
                    container.append("line")
                        .attr("class", "median")
                        .attr("stroke", "#041725")
                        .attr("stroke-width", 2)
                        .attr("x1", xScale(medianVal))
                        .attr("x2", xScale(medianVal))
                        .attr("y1", midline - boxHeight / 2)
                        .attr("y2", midline + boxHeight / 2);

                }

                //event
                function handleMouseOver(d, i) {  // Add interactivity
                    d3.select(this)
                        .attr({ fill: "orange", opacity: 1, r: 3.5})
                        .moveToFront();

                    _this.currentTractId = d.tractId;

                    //change layer color on map to point out location of the tracts
                    _this.geoLayer.eachLayer(function(layer) {
                        if (layer.feature.properties.OBJECTID == _this.currentTractId) {
                            originColor = layer.options.fillColor;
                            layer.setStyle({
                                fillColor: 'orange'
                            });

                            //show popup
                            _this.charts.openPopup(layer);

                            return false;
                        }
                    });
                }

                function handleMouseOut(d, i) {
                    d3.select(this)
                        .attr('fill', function(d){ return d.color; })
                        .attr('opacity', 0.3)
                        .attr('r', 2.5);

                    //reset
                    _this.geoLayer.eachLayer(function(layer) {
                        if (layer.feature.properties.OBJECTID == _this.currentTractId) {
                            layer.setStyle({
                                fillColor: originColor
                            });

                            //close popup
                            _this.charts.closePopup();

                            return false;
                        }
                    })
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

            showBoxPlot(settings.matrixData, settings.matrixObject, settings.data);
        },
        createGridMap: function(){
            var _this = hi;
            var mapStyleUrl = 'mapbox://styles/xiaoxuezhang/civfvp28i00142jrergqofl77';

            L.mapbox.accessToken = 'pk.eyJ1IjoieGlhb3h1ZXpoYW5nIiwiYSI6ImNpc2dzcWN5eTAwMGoyeW1zcTI5OTQ3YTgifQ.DCqBTREvXqcE1iEeVNwoYQ';

            var map = L.mapbox.map('map')
                .setView([33.8356178, -84.3984737], 9);

            var styleLayer = L.mapbox.styleLayer(mapStyleUrl)
                .addTo(map);

            //map settings
            map.scrollWheelZoom.disable();

            //global map
            _this.map = map;

            //create grid layer after map initialized
            _this.charts.createGridLayer();
            //_this.charts.createBoundaryLayer(boundaryjson);

        },
        createBoundaryLayer: function(boundaryjson){
            var _this = hi;

            L.mapbox.featureLayer().setGeoJSON(boundaryjson).setStyle({
                fillOpacity: 0,
                weight: 1,
                color: '#B5BDC1'
            }).addTo(_this.map);
        },
        createGridLayer: function(){
            var _this = hi;
            var gridMapData = _this.gridMapData;
            var map = _this.map;
            var layerPopup = null;
            var chartCode = _this.currentIndicatorCode;
            var relationObj = _this.process.transformToObject();
            var originColor = '#ffffff';

            //grid style
            gridMapData.features.forEach(function(cell, index) {
                //get info
                var tractIndex = relationObj[index];
                cell.properties = _this.healthData[tractIndex];

                var cellVal = cell.properties[chartCode] - 0;
                var groupIndex = _this.process.getGroupIndex(cellVal);
                var color = _this.groupColors[groupIndex];

                cell.properties.style = {
                    fillColor: color,
                    fillOpacity: 0.8,
                    weight: 1,
                    opacity: 0,
                    color: 'white'
                };
            });

            //apply styles and events
            _this.geoLayer = L.geoJson(gridMapData, {onEachFeature: onEachFeature})
                .eachLayer(function(l) {
                    l.setStyle(l.feature.properties.style);
                })
                .addTo(map);

            //highlight feature when hovering
            function highlightFeature(e) {
                var layer = e.target;
                originColor = layer.options.fillColor;

                //change highlight style
                layer.setStyle({
                    fillOpacity: 1,
                    fillColor: 'orange'
                });

                layerPopup = _this.charts.openPopup(layer);

                //show relevant circles on the box plot
                d3.selectAll('.tract_' + _this.currentTractId)
                    .attr({ fill: 'orange' , opacity: 1, r: 3.5})
                    .moveToFront();

                if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                    layer.bringToFront();
                }
            }

            //reset highlight
            function resetHighlight(e) {
                //gridjson.resetStyle(e.target);
                var layer = e.target;

                layer.setStyle({
                    fillOpacity: 0.8,
                    fillColor: originColor
                });

                //close popup
                _this.charts.closePopup();

                //reset color of circles on the box plot
                d3.selectAll('.tract_' + _this.currentTractId)
                    .attr('fill', function(d){ return d.color;  })
                    .attr('opacity', 0.3)
                    .attr('r', 2.5);

            }

            function onEachFeature(feature, layer) {
                layer.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight
                });
            }

            //L.mapbox.featureLayer().setGeoJSON(gridjson).addTo(map);

        },
        createCartoLayer: function(){

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
            var groupString = properties.GROUP === '9' ? 'Undefined Class' : _this.groups[properties.GROUP - 0 - 1];
            var content = '<div class="tract-name">TRACT ' + properties.NAME10 + '</div>' +
                '<div class="properties>">' +
                '<span class="label">Income Class: </span><span class="property-cnt">' + groupString + '</span>' +
                '</div>';

            //show detail
            _this.popupLayer = L.popup({closeButton: false, offset: [0, 0]})
                .setLatLng([center[1], center[0]])
                .setContent(content)
                .openOn(_this.map);
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
        }
    },
    process: {
        getFacilityCount: function(){
            var data = {
                emergency: {},
                hospital: {}
            };

            $.when($.getJSON('data/emergency_service_facilities.json'), $.getJSON('data/hospital_community_facilities.json'), $.getJSON('data/poverty.geojson')).done(function( a1, a2, a3 ) {
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
                //console.log(facilityData);
            });
        },
        getProjection: function(){
            var tractPts = [];
            var tractPtsArray = [];
            var gridPts = [];
            var gridPtsArray = [];

            //get data
            $.when($.getJSON('data/poverty.geojson'), $.getJSON('data/grid.geojson')).done(function(a1, a2){
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
            p20 = 0.2 * (maxVal - minVal);
            p40 = 0.4 * (maxVal - minVal);
            p60 = 0.6 * (maxVal - minVal);
            p80 = 0.8 * (maxVal - minVal);

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
            var groupThreshold = groupThreshold || _this.process.getGroupThreshold(chartCode);
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
        }
    }
};