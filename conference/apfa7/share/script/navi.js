function smartRollover() {
	if(document.getElementsByTagName) {
		var images = document.getElementsByTagName("img");

		for(var i=0; i < images.length; i++) {
			if(images[i].getAttribute("src").match("_off."))
			{
				images[i].onmouseover = function() {
					this.setAttribute("src", this.getAttribute("src").replace("_off.", "_on."));
				}
				images[i].onmouseout = function() {
					this.setAttribute("src", this.getAttribute("src").replace("_on.", "_off."));
				}
			}
		}
	}
}

if(window.addEventListener) {
	window.addEventListener("load", smartRollover, false);
}
else if(window.attachEvent) {
	window.attachEvent("onload", smartRollover);
}


var displaytable = function(){

	if(document.getElementById('changedisplay').value == "No (Observer)"){
		document.getElementById('title').style.display = 'none';
		document.getElementById('keywords').style.display = 'none';
		document.getElementById('abstract').style.display = 'none';
	}else{
		var isMSIE = /*@cc_on!@*/false; 
		if (isMSIE) { 
				document.getElementById('title').style.display = 'block';
				document.getElementById('keywords').style.display = 'block';
				document.getElementById('abstract').style.display = 'block';
		} else {
				document.getElementById('title').style.display = 'table-row';
				document.getElementById('keywords').style.display = 'table-row';
				document.getElementById('abstract').style.display = 'table-row';
}
	}
}

