// Version 0.0  Initial version 
// Version 0.1  10/10/2006 Added E_STYLE_7


      function EStyle(stemImage, stemSize, boxClass, boxOffset) {
        this.stemImage = stemImage;
        this.stemSize = stemSize;
        this.boxClass = boxClass;
        this.boxOffset = boxOffset;
        //this.border = border;
        
        // Known fudge factors are:
        // Firefox (1.0.6 and 1.5)    5, -1
        // IE 6.0                     0, -1
        // Opera 8.54                 3, -1
        // Opera 9 prev               4, -1
        // Netscape (7.2, 8.0)        5, -1
        // Safari                     5, -1        
        
        var agent = navigator.userAgent.toLowerCase();
        
        var fudge = 5;  // assume Netscape if no match found
       
        if (agent.indexOf("opera") > -1) {
          fudge = 3;
        }   
        if (agent.indexOf("firefox") > -1) {
          fudge = 5;
        }   
        if (agent.indexOf("safari") > -1) {
          fudge = 5;
        }   
        if ((agent.indexOf("msie") > -1) && (agent.indexOf("opera") < 1)){
          fudge = 0;
        }
        this.fudge = fudge;
      }

        var agent2 = navigator.userAgent.toLowerCase();
        
        var fudge2 = 5;  // assume Netscape if no match found
       
        if (agent2.indexOf("opera") > -1) {
          fudge2 = 3;
        }   
        if (agent2.indexOf("firefox") > -1) {
          fudge2 = 5;
        }   
        if (agent2.indexOf("safari") > -1) {
          fudge2 = 5;
        }   
        if ((agent2.indexOf("msie") > -1) && (agent2.indexOf("opera") < 1)){
          fudge2 = 0;
        }
        this.fudge2 = fudge2;
     
      var E_STYLE_7 = new EStyle("../../share/imgs/stem7.png", new GSize(24,24),  "estyle2", new GPoint(-10,23-this.fudge2));


      function EWindow(map,estyle) {
        // parameters
        this.map=map;
        this.estyle=estyle;
        // internal variables
        this.visible = false;
        // browser - specific variables
        this.ie = false;
        var agent = navigator.userAgent.toLowerCase();
        if ((agent.indexOf("msie") > -1) && (agent.indexOf("opera") < 1)){ this.ie = true} else {this.ie = false}
      } 
      
      EWindow.prototype = new GOverlay();

      EWindow.prototype.initialize = function(map) {
        var div1 = document.createElement("div");
        div1.style.position = "absolute";
        map.getPane(G_MAP_FLOAT_SHADOW_PANE).appendChild(div1);
        var div2 = document.createElement("div");
        div2.style.position = "absolute";
        div2.style.width = this.estyle.stemSize.width+"px";
        map.getPane(G_MAP_FLOAT_SHADOW_PANE).appendChild(div2);
        this.div1 = div1;
        this.div2 = div2;
      }

      EWindow.prototype.openOnMap = function(point, html, offset) {
        this.offset = offset||new GPoint(0,0);
        this.point = point;
        this.div1.innerHTML = '<div class="' + this.estyle.boxClass + '"><nobr>' + html + '</nobr></div>';
        if (this.ie && this.estyle.stemImage.toLowerCase().indexOf(".png")>-1) {
          var loader = "filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+this.estyle.stemImage+"', sizingMethod='scale');";
          this.div2.innerHTML = '<div style="height:' +this.estyle.stemSize.height+ 'px; width:'+this.estyle.stemSize.width+'px; ' +loader+ '" ></div>';
        } else {
          this.div2.innerHTML = '<img src="' + this.estyle.stemImage + '" width="' + this.estyle.stemSize.width +'" height="' + this.estyle.stemSize.height +'">';
        }
        var z = GOverlay.getZIndex(this.point.lat());
        this.div1.style.zIndex = z;
        this.div2.style.zIndex = z+1;
        this.visible = true;
        this.show();
        this.redraw(true);
      }
      
      EWindow.prototype.openOnMarker = function(marker,html) {
        var vx = marker.getIcon().iconAnchor.x - marker.getIcon().infoWindowAnchor.x;
        var vy = marker.getIcon().iconAnchor.y - marker.getIcon().infoWindowAnchor.y;
        this.openOnMap(marker.getPoint(), html, new GPoint(vx,vy));
      }
      

      EWindow.prototype.redraw = function(force) {
        if (!this.visible) {return;}
        var p = this.map.fromLatLngToDivPixel(this.point);
        this.div2.style.left   = (p.x + this.offset.x) + "px";
        this.div2.style.bottom = (-p.y + this.offset.y -this.estyle.fudge) + "px";
        this.div1.style.left   = (p.x + this.offset.x + this.estyle.boxOffset.x) + "px";
        this.div1.style.bottom = (-p.y + this.offset.y + this.estyle.boxOffset.y) + "px";
      }

      EWindow.prototype.remove = function() {
        this.div1.parentNode.removeChild(this.div1);
        this.div2.parentNode.removeChild(this.div2);
        this.visible = false;
      }

      EWindow.prototype.copy = function() {
        return new EWindow(this.map, this.estyle);
      }

      EWindow.prototype.show = function() {
        this.div1.style.display="";
        this.div2.style.display="";
        this.visible = true;
      }
      
      EWindow.prototype.hide = function() {
        this.div1.style.display="none";
        this.div2.style.display="none";
        this.visible = false;
      }




function initialize() {
 if (GBrowserIsCompatible()) { 

  var baseIcon = new GIcon();
  baseIcon.shadow = "http://www.google.com/mapfiles/shadow50.png";
  baseIcon.iconSize = new GSize(20, 34);
  baseIcon.shadowSize = new GSize(37, 34);
  baseIcon.iconAnchor = new GPoint(9, 34);
  baseIcon.infoWindowAnchor = new GPoint(9, 2);
  baseIcon.infoShadowAnchor = new GPoint(18, 25);

  map = new google.maps.Map2(document.getElementById("map"));
  map.addControl(new GLargeMapControl());
  map.addControl(new GMapTypeControl(true));
  var point = new GLatLng(35.70414710206052 , 140.0042724609375);
  map.setCenter(point, 9);

  function createMarker(point,label,alph, name,html,index) {
   var letter = String.fromCharCode("A".charCodeAt(0) + index);
   var icon = new GIcon(baseIcon);
   icon.image = "http://www.google.com/mapfiles/marker" + letter + ".png";
   var marker = new GMarker(point, icon);
   GEvent.addListener(marker, "click", function() {
    ew.openOnMarker(marker,html);
    map.panTo(point);
    //map.setCenter(point, 9);
   });
   gmarkers[charNum] = marker;
   htmls[charNum] = html;
   points[charNum] = point;
   sidebar_html += '<div class="label">' + label + '<\/div><p>' + alph + '<a href="javascript:myclick(' + charNum + ')">' + name + '<\/a></p>';
   charNum++;

   return marker;
  }

  ew = new EWindow(map, E_STYLE_7);
  map.addOverlay(ew);

  function pretty(a) {
   return '<table border="0" cellpadding="0" cellspacing="5" bordercolor="#FFFFFF" bgcolor="#FFFFFF" class="popup"><tr><td width="100%" class="EWTitle" align="center">' + a + '<\/td><\/tr><\/table>';
  }

  var point = new GLatLng(35.69213199326626 , 139.75836753845215);
  var label = '開催会場';
  var alph = 'A ';
  var name = '如水会館';
  var html = pretty(name);
  var marker = createMarker(point, label, alph, name, html, 0);
  map.addOverlay(marker);

  var point = new GLatLng(35.605792659229905 , 139.6829491853714);
  var label = '';
  var alph = 'B ';
  var name = '東京工業大学 大岡山キャンパス 西9号館';
  var html = pretty('東京工業大学<br>大岡山キャンパス<br>西9号館');
  var marker = createMarker(point, label, alph, name, html, 1);
  map.addOverlay(marker);

  var point = new GLatLng(35.607456552899706 , 139.68563944101334);
  var label = '鉄道';
  var alph = 'C ';
  var name = '大岡山駅';
  var html = pretty(name);
  var marker = createMarker(point, label, alph, name, html, 2);
  map.addOverlay(marker);

  var point = new GLatLng(35.6954975389312 , 139.75811809301376);
  var label = '';
  var alph = 'D ';
  var name = '神保町駅';
  var html = pretty(name);
  var marker = createMarker(point, label, alph, name, html, 3);
  map.addOverlay(marker);

  var point = new GLatLng(35.69067027839031 , 139.7568118572235);
  var label = '';
  var alph = 'E ';
  var name = '竹橋駅';
  var html = pretty(name);
  var marker = createMarker(point, label, alph, name, html, 4);
  map.addOverlay(marker);

  var point = new GLatLng(35.681413581253274 , 139.76607084274292);
  var label = '';
  var alph = 'F ';
  var name = '東京駅';
  var html = pretty(name);
  var marker = createMarker(point, label, alph, name, html, 5);
  map.addOverlay(marker);

  var point = new GLatLng(35.550175168336715 , 139.7863483428955);
  var label = '空港';
  var alph = 'G ';
  var name = '羽田国際空港';
  var html = pretty(name);
  var marker = createMarker(point, label, alph, name, html, 6);
  map.addOverlay(marker);

  var point = new GLatLng(35.773745052689385 , 140.3882360458374);
  var label = '';
  var alph = 'H ';
  var name = '成田国際空港';
  var html = pretty(name);
  var marker = createMarker(point, label, alph, name, html, 7);
  map.addOverlay(marker);

  document.getElementById("sidebar").innerHTML = sidebar_html;

 }

 GEvent.addListener(map, "click", function(marker,point) {
  if (point) {
   ew.hide();
  }
 });
}


function initializeEN() {
 if (GBrowserIsCompatible()) { 

  var baseIcon = new GIcon();
  baseIcon.shadow = "http://www.google.com/mapfiles/shadow50.png";
  baseIcon.iconSize = new GSize(20, 34);
  baseIcon.shadowSize = new GSize(37, 34);
  baseIcon.iconAnchor = new GPoint(9, 34);
  baseIcon.infoWindowAnchor = new GPoint(9, 2);
  baseIcon.infoShadowAnchor = new GPoint(18, 25);

  map = new google.maps.Map2(document.getElementById("map"));
  map.addControl(new GLargeMapControl());
  map.addControl(new GMapTypeControl(true));
  var point = new GLatLng(35.70414710206052 , 140.0042724609375);
  map.setCenter(point, 9);

  function createMarker(point,label,alph, name,html,index) {
   var letter = String.fromCharCode("A".charCodeAt(0) + index);
   var icon = new GIcon(baseIcon);
   icon.image = "http://www.google.com/mapfiles/marker" + letter + ".png";
   var marker = new GMarker(point, icon);
   GEvent.addListener(marker, "click", function() {
    ew.openOnMarker(marker,html);
    map.panTo(point);
    //map.setCenter(point, 9);
   });
   gmarkers[charNum] = marker;
   htmls[charNum] = html;
   points[charNum] = point;
   sidebar_html += '<div class="label" style="font-size: smaller">' + label + '<\/div><p style="font-size: smaller">' + alph + '<a href="javascript:myclick(' + charNum + ')">' + name + '<\/a></p>';
   charNum++;

   return marker;
  }

  ew = new EWindow(map, E_STYLE_7);
  map.addOverlay(ew);

  function pretty(a) {
   return '<table border="0" cellpadding="0" cellspacing="5" bordercolor="#FFFFFF" bgcolor="#FFFFFF" class="popup"><tr><td width="100%" class="EWTitle" align="center">' + a + '<\/td><\/tr><\/table>';
  }

  var point = new GLatLng(35.69213199326626 , 139.75836753845215);
  var label = 'Conference Place';
  var alph = 'A ';
  var name = '&ldquo;Josui Kaikan&rdquo;, Hitotsubashi University';
  var html = pretty('&ldquo;Josui Kaikan&rdquo;,<br>Hitotsubashi University');
  var marker = createMarker(point, label, alph, name, html, 0);
  map.addOverlay(marker);

  var point = new GLatLng(35.605792659229905 , 139.6829491853714);
  var label = '';
  var alph = 'B ';
  var name = '&ldquo;West Bldg. #9&rdquo;, Ookayama Campus, Tokyo Institute of Technology';
  var html = pretty('&ldquo;West Bldg. #9&rdquo;,<br>Ookayama Campus,<br>Tokyo Institute of Technology');
  var marker = createMarker(point, label, alph, name, html, 1);
  map.addOverlay(marker);

  var point = new GLatLng(35.607456552899706 , 139.68563944101334);
  var label = 'Train';
  var alph = 'C ';
  var name = 'Ookayama Station';
  var html = pretty(name);
  var marker = createMarker(point, label, alph, name, html, 2);
  map.addOverlay(marker);

  var point = new GLatLng(35.6954975389312 , 139.75811809301376);
  var label = '';
  var alph = 'D ';
  var name = 'Jimbocho Station';
  var html = pretty(name);
  var marker = createMarker(point, label, alph, name, html, 3);
  map.addOverlay(marker);

  var point = new GLatLng(35.69067027839031 , 139.7568118572235);
  var label = '';
  var alph = 'E ';
  var name = 'Takebashi Station';
  var html = pretty(name);
  var marker = createMarker(point, label, alph, name, html, 4);
  map.addOverlay(marker);

  var point = new GLatLng(35.681413581253274 , 139.76607084274292);
  var label = '';
  var alph = 'F ';
  var name = 'Tokyo Station';
  var html = pretty(name);
  var marker = createMarker(point, label, alph, name, html, 5);
  map.addOverlay(marker);

  var point = new GLatLng(35.550175168336715 , 139.7863483428955);
  var label = 'Airport';
  var alph = 'G ';
  var name = 'Haneda Airport';
  var html = pretty(name);
  var marker = createMarker(point, label, alph, name, html, 6);
  map.addOverlay(marker);

  var point = new GLatLng(35.773745052689385 , 140.3882360458374);
  var label = '';
  var alph = 'H ';
  var name = 'Narita Airport';
  var html = pretty(name);
  var marker = createMarker(point, label, alph, name, html, 7);
  map.addOverlay(marker);

  document.getElementById("sidebar").innerHTML = sidebar_html;

 }

 GEvent.addListener(map, "click", function(marker,point) {
  if (point) {
   ew.hide();
  }
 });
}

function myclick(i) {
 ew.openOnMarker(gmarkers[i],htmls[i]);
 map.panTo(points[i]);
}
