var validateBlank = function(id){
	var elem = document.getElementById(id);
	if(elem.value == ""){
			if(id == "LastName"){
				id = "FamilyName"
			}
		document.getElementById(id + "_title").style.fontWeight="bold";
		document.getElementById(id + "_title").style.color="red";
		elem.style.backgroundColor = "#FFDDDD";
		return false;
	}else{
			if(id == "LastName"){
				id = "FamilyName"
			}
		document.getElementById(id + "_title").style.fontWeight="normal";
		document.getElementById(id + "_title").style.color="black";
		elem.style.backgroundColor = "#FFFFFF";
	}
	return true;
}


function errorcheck(){
	var isError = false;
	if(validateBlank("FamilyName") == false){
		isError = true;
	}
	if(validateBlank("LastName") == false){
		isError = true;
	}

	if(validateBlank("honorific") == false){
		isError = true;
	}
	if(validateBlank("status") == false){
		isError = true;
	}
	if(validateBlank("mailaddress") == false){
		isError = true;
	}
	if(validateBlank("mailaddress2") == false){
		isError = true;
	}
	if(validateBlank("institution_name") == false){
		isError = true;
	}
	if(validateBlank("zip_code") == false){
		isError = true;
	}

	if(validateBlank("country") == false){
		isError = true;
	}

	if(validateBlank("address") == false){
		isError = true;
	}
	if(validateBlank("tel") == false){
		isError = true;
	}
	if(validateBlank("changedisplay") == false){
		isError = true;
	}
	if(document.getElementById('changedisplay').value != "No (Observer)"){
		if(validateBlank("proposedtitle") == false){
			isError = true;
		}
		if(validateBlank("keywords") == false){
			isError = true;
		}
		if(validateBlank("abstractval") == false){
			isError = true;
		}
	}

//メールアドレス
	pattern = '^[A-Za-z0-9]+[0-9a-zA-Z_\\/\\?\+\\.!#$%&`\\\'^{}-]*@[0-9a-zA-Z_\\.\\-]+\\.[0-9a-zA-Z_]{2,}$';
	regexObj = new RegExp(pattern);
	if(document.getElementById('mailaddress').value != ""){	
		if(document.getElementById('mailaddress').value.match(regexObj)){
			if(document.getElementById('mailaddress').value != document.getElementById('mailaddress2').value){
				var message = document.getElementById("mail2error");
				message.style.display="block";
				message.innerHTML="E-mail is invalid";
				document.getElementById("mailaddress_title").style.fontWeight="bold";
				document.getElementById("mailaddress_title").style.color="red";
				document.getElementById("mailaddress").style.backgroundColor = "#FFDDDD";
				document.getElementById("mailaddress2_title").style.fontWeight="bold";
				document.getElementById("mailaddress2_title").style.color="red";
				document.getElementById("mailaddress2").style.backgroundColor = "#FFDDDD";
				isError = true;
			}else{
				var message = document.getElementById("mail2error");
				message.style.display="none";
				document.getElementById("mailaddress_title").style.fontWeight="normal";
				document.getElementById("mailaddress_title").style.color="black";
				document.getElementById("mailaddress").style.backgroundColor = "#FFFFFF";
				document.getElementById("mailaddress2_title").style.fontWeight="normal";
				document.getElementById("mailaddress2_title").style.color="black";
				document.getElementById("mailaddress2").style.backgroundColor = "#FFFFFF";
			}
			var message = document.getElementById("mailerror");
			message.style.display="none";
		}else{
			var message = document.getElementById("mailerror");
			message.style.display="block";
			message.innerHTML="E-mail is invalid";
			document.getElementById("mailaddress_title").style.fontWeight="bold";
			document.getElementById("mailaddress_title").style.color="red";
			document.getElementById("mailaddress").style.backgroundColor = "#FFDDDD";
			document.getElementById("mailaddress2_title").style.fontWeight="bold";
			document.getElementById("mailaddress2_title").style.color="red";
			document.getElementById("mailaddress2").style.backgroundColor = "#FFDDDD";
			isError = true;
		}
	}else{
		var message = document.getElementById("mailerror");
		message.style.display="none";
		var message = document.getElementById("mail2error");
		message.style.display="none";
	}
//郵便番号
	if(document.getElementById('zip_code').value != ""){	
		var zip_num = document.getElementById('zip_code').value;
		var zip_num = zip_num.length;
		if(zip_num > 20){
			var message = document.getElementById("ziperror");
			message.style.display="block";
			message.innerHTML="Zip Code is invalid";
			document.getElementById("zip_code_title").style.fontWeight="bold";
			document.getElementById("zip_code_title").style.color="red";
			document.getElementById("zip_code").style.backgroundColor = "#FFDDDD";
			isError = true;
		}else{
			var message = document.getElementById("ziperror");
			message.style.display="none";
			document.getElementById("zip_code_title").style.fontWeight="normal";
			document.getElementById("zip_code_title").style.color="black";
			document.getElementById("zip_code").style.backgroundColor = "#FFFFFF";
		}
	}else{
		var message = document.getElementById("ziperror");
		message.style.display="none";
}
//電話番号
	if(document.getElementById('tel').value != ""){	
		var tel_num = document.getElementById('tel').value;
		var tel_num = tel_num.length;
		if(tel_num > 30){
			var message = document.getElementById("telerror");
			message.style.display="block";
			message.innerHTML="Telephone is invalid";
			document.getElementById("tel_title").style.fontWeight="bold";
			document.getElementById("tel_title").style.color="red";
			document.getElementById("tel").style.backgroundColor = "#FFDDDD";
			isError = true;
		}else{
			var message = document.getElementById("telerror");
			message.style.display="none";
			document.getElementById("tel_title").style.fontWeight="normal";
			document.getElementById("tel_title").style.color="black";
			document.getElementById("tel").style.backgroundColor = "#FFFFFF";
		}
	}else{
		var message = document.getElementById("telerror");
		message.style.display="none";
}

if(document.getElementById('changedisplay').value != "No (Observer)"){
		if(!document.getElementById('abstractval').value.match(".pdf$")){
				var message = document.getElementById("abstractvalerror");
				message.style.display="block";
				message.innerHTML="Abstract is invalid";
				document.getElementById("abstractval_title").style.fontWeight="bold";
				document.getElementById("abstractval_title").style.color="red";
				document.getElementById("abstractval").style.backgroundColor = "#FFDDDD";
				isError = true;
		}else{
				var message = document.getElementById("abstractvalerror");
				message.style.display="none";
				message.innerHTML="Abstract is invalid";
				document.getElementById("abstractval_title").style.fontWeight="normal";
				document.getElementById("abstractval_title").style.color="black";
				document.getElementById("abstractval").style.backgroundColor = "#FFFFFF";
	}
}

//プライバシーポリシー
	if(document.getElementById('privacy').checked == false){
		document.getElementById("privacy_title").style.fontWeight="bold";
		document.getElementById("privacy_title").style.color="red";
		isError = true;
	}else{
		document.getElementById("privacy_title").style.fontWeight="normal";
		document.getElementById("privacy_title").style.color="black";
		document.getElementById("privacy").style.backgroundColor = "#FFFFFF";

}
 if(isError){
		var message = document.getElementById("errormessage");
		message.innerHTML="！Input error occurred.<br />Please make sure that you have correctly entered the red items.";
		document.getElementById("errormessage").style.padding = "5px";
		location.href="#form";
		return false;
	}
	return true;
}

