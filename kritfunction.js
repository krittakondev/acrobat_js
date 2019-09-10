var listCurPage = [];


function backup(numPage){
	// Get a color convert action
	
	this.embedOutputIntent("U.S. Web Coated (SWOP) v2");
	var toRGB = this.getColorConvertAction();
	// Set up the action for a conversion to RGB
	toRGB.matchAttributesAny = -1;
	toRGB.matchSpaceTypeAny = ~toRGB.constants.spaceFlags.AlternateSpace;
	toRGB.matchIntent = toRGB.constants.renderingIntents.Any;
	toRGB.convertProfile = "Apple RGB";
	toRGB.convertIntent = toRGB.constants.renderingIntents.Document;
	toRGB.embed = true;
	toRGB.preserveBlack = false;
	toRGB.useBlackPointCompensation = true;
	toRGB.action = toRGB.constants.actions.Convert;
	// Convert the first page of the document
	var result = this.colorConvertPage(0,[toRGB],[]);
}
function dialogColor(){
	var dialog1 = {
		//initialize: function (dialog){
		//	app.alert("starting");
		//},
		commit: function (dialog){
			var result = dialog.store();
			app.alert(result["numlist"]);
		},
		description: {
			name: "Convert to black page", // Dialog box title
			align_children: "align_left",
			width: 350,
			height: 200,
			elements: [{
				type: "cluster",
				align_children: "align_left",
				elements:[{
					type: "static_text",
					name: "page"
				}],
				elements: [{
					alignment: "align_right",
					type: "ok_cancel",
					ok_name: "ตกลง",
					cancel_name: "ยกเลิก"
				}]
			}]
		}
	}
	app.execDialog(dialog1);
}

function countListNum(arr){
	//var arr = [1,2,3,4,8,15,16,17,20,21,30];
	var start = arr[0];
	var end = arr[0];
	var result = "";
	for(var i in arr){
		i = parseInt(i);
		if (arr[i] === arr[i+1]-1){
			end = arr[i+1];
		}
		else{
			if (start >= end){
				result +=  start+",";
			}else{
				result += start+"-"+end+",";
			}
			start = arr[i+1];
		}
	}
	//result = result.pop()
	result = result.split(",")
	return result
}

function bookmarkToBlank(){
	Rect = this.getPageBox()
	var allBookmark=this.bookmarkRoot.children.length;
	//allBookmark = allBookmark-1;
	var listPageSe = []
	for (i=0;i<allBookmark;i++){
		var page = this.bookmarkRoot.children[i].name;
		page = parseInt(page);
		listPageSe.push(page);
	}
	listPageSe = listPageSe.sort();
	for (i=this.numPages;i>0;i--){
		if(listPageSe.indexOf(i) != -1){
			this.newPage(i);
		}
	}
	app.alert("ลบเรียบร้อยแล้ว", 3);
	app.execMenuItem("SaveAs")
}

function removePage(func){
	if(func == "rmBookmark"){
		var allBookmark=this.bookmarkRoot.children.length;
		//allBookmark = allBookmark-1;
		var listPageSe = []
		for (i=0;i<allBookmark;i++){
			var page = this.bookmarkRoot.children[i].name;
			page = parseInt(page);
			listPageSe.push(page);
		}
		listPageSe = listPageSe.sort();
		var check = app.alert("จะลบทุกหน้า "+listPageSe+" จริงหรือไม่?", 2, 2, "ยืนยัน");
		if (check === 4){
			for (i=this.numPages;i>0;i--){
				if(listPageSe.indexOf(i) != -1){
					this.deletePages(i-1);
				}
			}
			app.alert("ลบเรียบร้อยแล้ว", 3);
			app.execMenuItem("SaveAs")
		}
	}else if(func == "rmBookmarkNotSelect"){
		var allBookmark=this.bookmarkRoot.children.length;
		//allBookmark = allBookmark-1;
		var listPageSe = []
		for (i=0;i<allBookmark;i++){
			var page = this.bookmarkRoot.children[i].name;
			page = parseInt(page);
			listPageSe.push(page);
		}
		listPageSe = listPageSe.sort();
		var check = app.alert("จะลบทุกหน้ายกเว้นหน้า "+listPageSe+" จริงหรือไม่?", 2, 2, "ยืนยัน");
		if (check === 4){
			for (i=this.numPages;i>0;i--){
				if(listPageSe.indexOf(i) == -1){
					this.deletePages(i-1);
				}
			}
			app.alert("ลบเรียบร้อยแล้ว", 3);
			app.execMenuItem("SaveAs")
		}
		
	}
}

function loop_ToBlack(){
	listCur = countListNum(listCurPage);
	listPageStr = listCur.join(",");
	var pages = app.response({cTitle: "เลขหน้า",cQuestion: "ใส่หน้าที่ต้องการ(ใส่ตัว , เพื่อตัวแยกในแต่ละหน้าหรือตัว - เพื่อระบุช่วงตัวเลข)", cDefault: listPageStr});
	if (pages === null){
		return false;
	}
	var check = app.alert("ต้องการใช้ฟังค์ชั่นนี้หรือไม่ ?", 2, 2, "ยืนยัน");
	if (check === 4){
		var pagelist = pages.split(",");
		var toBlack = this.getColorConvertAction();
		toBlack.matchAttributesAny = -1;
		toBlack.matchSpaceTypeAny = ~toBlack.constants.spaceFlags.DeviceSpace;
		toBlack.matchIntent = toBlack.constants.renderingIntents.Any;
		toBlack.convertProfile = "Gray Gamma 2.2";
		toBlack.convertIntent = toBlack.constants.renderingIntents.Document;
		toBlack.embed = false;
		toBlack.preserveBlack = false;
		toBlack.useBlackPointCompensation = true;
		toBlack.action = toBlack.constants.actions.Convert;
		for (var i in pagelist){
			
			if(pagelist[i].indexOf("-") != -1){
				var check2loop = true
				var listNumTo = pagelist[i].split("-");
				var Nstart = parseInt(listNumTo[0]);
				var Nend = parseInt(listNumTo[1]);
				for(var countTo=Nstart;countTo<=Nend;countTo++){
					// Convert the first page of the document			
					var result = this.colorConvertPage(countTo-1,[toBlack],[]);
					this.bookmarkRoot.createChild(countTo, "this.pageNum="+countTo);
				}
			}else{
				var numPage = parseInt(pagelist[i]);
				// Convert the first page of the document			
				var result = this.colorConvertPage(numPage-1,[toBlack],[]);
				this.bookmarkRoot.createChild(numPage, "this.pageNum="+numPage);
			}
		}
		app.alert("เปลี่ยนค่าเรียบร้อยแล้ว ", 3);
		//return true;

	}else{
		//app.execDialog(convert_dialog);
		//app.alert("จบการทำงาน");
		return false;
	}
}

function loop_ToColor_backup(){
	/*var ask_conAll = app.alert("คุณต้องการแปลงทุกหน้าเป็นขาวดำก่อนใช้หรือไม ?", 2, 2, "แปลงทุกหน้า");
	if(ask_conAll === 4){
		var toBlack = this.getColorConvertAction();	
		toBlack.matchAttributesAny = -1;
		toBlack.matchSpaceTypeAny = ~toBlack.constants.spaceFlags.GraySpace;
		toBlack.matchIntent = toBlack.constants.renderingIntents.Any;
		toBlack.convertProfile = "Gray Gamma 2.2";
		toBlack.convertIntent = toBlack.constants.renderingIntents.Document;
		toBlack.embed = false;
		toBlack.preserveBlack = false;
		toBlack.useBlackPointCompensation = true;
		toBlack.action = toBlack.constants.actions.Convert;
		for(var rm=0;rm<=this.numPages;rm++){
			var result = this.colorConvertPage(rm,[toBlack],[]);
		}
	}*/
	var pages = app.response({cTitle: "เลขหน้า",cQuestion: "ใส่หน้าที่ต้องการ(ใส่ตัว , เพื่อตัวแยกในแต่ละหน้า)", cDefault: ""});
	if (pages === null){
		return false;
	}
	var check = app.alert("ต้องการใช้ฟังค์ชั่นนี้หรือไม่ ?", 2, 2, "ยืนยัน");
	if (check === 4){
		var pagelist = pages.split(",");
		toBlack.matchAttributesAny = -1;
		toBlack.matchSpaceTypeAny = ~toBlack.constants.spaceFlags.GraySpace;
		toBlack.matchIntent = toBlack.constants.renderingIntents.Any;
		toBlack.convertProfile = "U.S. Web Coated (SWOP) v2";
		toBlack.convertIntent = toBlack.constants.renderingIntents.Document;
		toBlack.embed = false;
		toBlack.preserveBlack = false;
		toBlack.useBlackPointCompensation = true;
		toBlack.action = toBlack.constants.actions.Convert;
		//this.embedOutputIntent("U.S. Web Coated (SWOP) v2");
		for (var i in pagelist){
			if(pagelist[i].indexOf("-") != -1){
				var check2loop = true
				var listNumTo = pagelist[i].split("-");
				var Nstart = parseInt(listNumTo[0]);
				var Nend = parseInt(listNumTo[1]);
				for(var countTo=Nstart;countTo<=Nend;countTo++){
					// Convert the first page of the document			
					var result = this.colorConvertPage(countTo-1,[toBlack],[]);
					this.bookmarkRoot.createChild(countTo, "this.pageNum="+countTo);
				}
			}else{
				var numPage = parseInt(pagelist[i]);
				// Convert the first page of the document			
				var result = this.colorConvertPage(numPage-1,[toBlack],[]);
				this.bookmarkRoot.createChild(numPage, "this.pageNum="+numPage);
			}
		}
		app.alert("เปลี่ยนค่าเรียบร้อยแล้ว", 3);
		return true;

	}else{
		//app.execDialog(convert_dialog);
		//app.alert("จบการทำงาน");
		return false;
	}
}

function select_bookmark(msg){
	if (msg === undefined){
		msg = "";
	}
	var list_bookmark = [];
	var pages = app.response({cTitle: "เลขหน้า",cQuestion: "ใส่หน้าที่ต้องการ(ใส่ตัว , เพื่อตัวแยกในแต่ละหน้า)", cDefault: msg});
	if (pages === null){
		return false;
	}
	var check = app.alert("ต้องการใช้ฟังค์ชั่นนี้หรือไม่ ?", 2, 2, "ยืนยัน");
	if (check === 4){
		var pagelist = pages.split(",");
		for (var i in pagelist){
			if(pagelist[i].indexOf("-") != -1){
				var check2loop = true
				var listNumTo = pagelist[i].split("-");
				var Nstart = parseInt(listNumTo[0]);
				var Nend = parseInt(listNumTo[1]);
				for(var countTo=Nstart;countTo<=Nend;countTo++){	
					this.bookmarkRoot.createChild(countTo);
				}
			}else{
				var numPage = parseInt(pagelist[i]);			
				this.bookmarkRoot.createChild(numPage);
			}
		}
		app.alert("เปลี่ยนค่าเรียบร้อยแล้ว", 3);
		return true;

	}else{
		//app.execDialog(convert_dialog);
		//app.alert("จบการทำงาน");
		return false;
	}
}

function insertBlankCur(){
	app.alert(this.pageNum+1);
	this.newPage(this.pageNum+1);
}

function loop_ToColor(){
	listCur = countListNum(listCurPage);
	listPageStr = listCur.join(",");
	var pages = app.response({cTitle: "เลขหน้า",cQuestion: "ใส่หน้าที่ต้องการ(ใส่ตัว , เพื่อตัวแยกในแต่ละหน้าหรือตัว - เพื่อระบุช่วงตัวเลข)", cDefault: listPageStr});
	pages.cDefault = "testing";
	var listToColor = [];
	if (pages === null){
		return false;
	}
	var check = app.alert("ต้องการใช้ฟังค์ชั่นนี้หรือไม่ ?", 2, 2, "ยืนยัน");
	if (check === 4){
		var toBlack = this.getColorConvertAction();	
		toBlack.matchAttributesAny = -1;
		toBlack.matchSpaceTypeAny = ~toBlack.constants.spaceFlags.GraySpace;
		toBlack.matchIntent = toBlack.constants.renderingIntents.Any;
		toBlack.convertProfile = "Gray Gamma 2.2";
		toBlack.convertIntent = toBlack.constants.renderingIntents.Document;
		toBlack.embed = false;
		toBlack.preserveBlack = false;
		toBlack.useBlackPointCompensation = true;
		toBlack.action = toBlack.constants.actions.Convert;
		var pagelist = pages.split(",");
		//this.embedOutputIntent("U.S. Web Coated (SWOP) v2");
		for (var i in pagelist){
			if(pagelist[i].indexOf("-") != -1){
				var listNumTo = pagelist[i].split("-");
				var Nstart = parseInt(listNumTo[0]);
				var Nend = parseInt(listNumTo[1]);
				for(var countTo=Nstart;countTo<=Nend;countTo++){
					// Convert the first page of the document			
					listToColor.push(countTo-1);
				}
			}else{
				var numPage = parseInt(pagelist[i]);
				// Convert the first page of the document			
				listToColor.push(numPage-1);
			}
		}
		for (var conGray=0;conGray<this.numPages;conGray++){
			if (listToColor.indexOf(conGray) === -1){
				var result = this.colorConvertPage(conGray,[toBlack],[]);
			}else{
				this.bookmarkRoot.createChild(conGray+1, "this.pageNum="+conGray);
			}
		}
		//var result = this.colorConvertPage(countTo-1,[toBlack],[]);
		app.alert("เปลี่ยนค่าเรียบร้อยแล้ว", 3);
		return true;

	}else{
		//app.execDialog(convert_dialog);
		//app.alert("จบการทำงาน");
		return false;
	}
}


function extract_page(){
	var pages = app.response({cTitle: "เลขหน้า",cQuestion: "ใส่หน้าที่ต้องการ(ใส่ตัว , เพื่อตัวแยกในแต่ละหน้าหรือตัว - เพื่อระบุช่วงตัวเลข)", cDefault: ""});
	var pagelist = pages.split(",");
	for (var i in pagelist){
		var namefile = i;
		var extractPage = app.trustedFunction( function(nStart, nEnd, nameFile) {
			this.beginPriv();
			this.extractPages(nStart, nEnd, nameFile);
			app.endPriv();
			});
		if(pagelist[i].indexOf("-") != -1){
			var listNumTo = pagelist[i].split("-");
			var Nstart = parseInt(listNumTo[0]);
			var Nend = parseInt(listNumTo[1]);
			extractPage(Nstart-1, Nend-1, i+".pdf");
		}else{
			var numPage = parseInt(pagelist[i]);
			extractPage(numPage-1, numPage-1, i+".pdf");
		}
	}
	app.alert("extract สำเร็จ");
}

function convert_cur_page(){
	
	//this.embedOutputIntent("U.S. Web Coated (SWOP) v2");
	// Get a color convert action
	var toBlack = this.getColorConvertAction();
	// Set up the action for a conversion to black
	toBlack.matchAttributesAny = -1;
	toBlack.matchSpaceTypeAny = ~toBlack.constants.spaceFlags.AlternateSpace;
	toBlack.matchIntent = toBlack.constants.renderingIntents.Any;
	toBlack.convertProfile = "Gray Gamma 2.2";
	toBlack.convertIntent = toBlack.constants.renderingIntents.Document;
	toBlack.embed = false;
	toBlack.preserveBlack = false;
	toBlack.useBlackPointCompensation = true;
	toBlack.action = toBlack.constants.actions.Convert;
	// Convert the first page of the document			
	var result = this.colorConvertPage(this.pageNum,[toBlack],[]);
	curPage = this.pageNum;
	this.bookmarkRoot.createChild(curPage+1, "this.pageNum="+curPage);
}

function addList(){
	if (this.pageNum+1 in listCurPage){
		exit();
	}
	listCurPage.push(this.pageNum+1);
	listCurPage = listCurPage.sort(function(a, b){return a - b});
}

function dotheDialog(dialog,doc){
	dialog.doc = doc;
	var retn = app.execDialog( dialog )
}

var dialogGetSize = {
	commit: function(dialog){
		var results = dialog.store();
		var listA3 = [];
		var listA4 = [];
		var listNone = [];
		var listTotals = [];
		var seSize = "";
		for (i=0;i<this.doc.numPages;i++){
			Rect = this.doc.getPageBox("Crop", parseInt(i));
			if (((Rect[1] > 820 && Rect[1] < 850) && (Rect[2] > 1180 && Rect[2] < 1200)) || ((Rect[1] > 580 && Rect[1] < 605) && (Rect[2] > 1180 && Rect[2] < 1200))){
				listA3.push(parseInt(i)+1);  //"A3";
			}else if (((Rect[1] > 820 && Rect[1] < 850) && (Rect[2] > 580 && Rect[2] < 605)) || ((Rect[1] > 580 && Rect[1] < 605) && (Rect[2] > 820 && Rect[2] < 850))){
				listA4.push(parseInt(i)+1);  //"A4";
			}else{
				listNone.push(parseInt(i)+1);   //"none";
			}
		}
		if (results["lta4"]){
			if(listA4!=""){
				listTotals.push(listA4);
				seSize += "A4 "
			}
		}
		if (results["lta3"]){
			if(listA3!=""){
				listTotals.push(listA3);
				seSize += "A3 "
			}
		}
		if (results["ltnn"]){
			if(listNone!=""){
				listTotals.push(listNone);
				seSize += "Other "
			}
		}
		//listTotals = listTotals.join(",");
		//listTotals = listTotals.split(",");
		//listTotals.map(Number);
		listTotals = listTotals.sort();
		
		app.response({cTitle: "result",cQuestion: "pages size of: "+seSize, cDefault: listTotals.join(",")});
	},
	description: 
	{
		name: "get size page",
		elements: [
		{
			type: "cluster",
			elements: [
			{
				type: "check_box",
				name: "A4",
				item_id: "lta4"
			},
			{
				type: "check_box",
				name: "A3",
				item_id: "lta3"
			},
			{
				type: "check_box",
				name: "Other",
				item_id: "ltnn"
			}]
			
		},
		{
			type: "ok_cancel"
		}]
	}
}

function checkCropSize(){
	/*
	ถ้าเงือนไขนี้เป็นจริงเท่ากับว่าเป็น A4
	(((Rect[1] > 820 && Rect[1] < 850) && (Rect[2] > 580 && Rect[2] < 605)) || ((Rect[1] > 580 && Rect[1] < 605) && (Rect[2] > 820 && Rect[2] < 850)))

	ถ้าเงือนไขนี้เป็นจริงเท่ากับว่าเป็น A3
	(((Rect[1] > 820 && Rect[1] < 850) && (Rect[2] > 1180 && Rect[2] < 1200)) || ((Rect[1] > 580 && Rect[1] < 605) && (Rect[2] > 1180 && Rect[2] < 1200)))
	*/
	var listStatus = [];
	for (i=0;i<this.numPages;i++){
		Rect = this.getPageBox("Crop", parseInt(i));
		if (((Rect[1] > 820 && Rect[1] < 850) && (Rect[2] > 1180 && Rect[2] < 1200)) || ((Rect[1] > 580 && Rect[1] < 605) && (Rect[2] > 1180 && Rect[2] < 1200))){
			listStatus.push("A3");
		}else if (((Rect[1] > 820 && Rect[1] < 850) && (Rect[2] > 580 && Rect[2] < 605)) || ((Rect[1] > 580 && Rect[1] < 605) && (Rect[2] > 820 && Rect[2] < 850))){
			listStatus.push("A4");
		}else{
			listStatus.push("none");
		}
		
	}
	app.alert(listStatus.join(","));
}

function getPageOf_A3(){
	checkCropSize();
}

function getPageSize(){
	/*thisDoc = app.openDoc({
		cPath: this.path,
		bHidden: true
	});*/
	//app.execDialog(totalTools);
	//this.bookmarkToBlank();
	//dotheDialog(dialogGetSize, this);
	dialogGetSize.doc = this;
	app.execDialog(dialogGetSize);
}
function Undo(){
	listCurPage.pop()
}
function clear1Page(){
	var indexCurPage = listCurPage.indexOf(this.pageNum+1);
	if (indexCurPage != -1){
		//app.alert(indexCurPage);
		listCurPage.splice(indexCurPage, 1);
	}
}

function clearAllPage(){
	listCurPage = []
}

function addText({_text, size, pageStart, pageEnd, rotation}){
	this.addWatermarkFromText({
		cText: _text, //ข้อความ
		cFont: font.Helv,
		nFontSize: size, //ขนาดsizeตัวอักษร
		nStart: pageStart, //กำหนดหน้าเริ่มต้น
		nEnd: pageEnd, //กำหนดหน้าสิ้นสุด
		nRotation: rotation, //หมุนตัวอักษร เช่น 180 ก็จะกลัวหัว
		nHorizAlign: app.constants.align.left, //กำหนดตำแหน่งการวางตัวหนังสือซ้ายหรือขวา เช่น app.constants.align.left ก็จะเท่ากับตัวอักษรชิดไว้ซ้ายสุด
		nVertAlign: app.constants.align.center, //กำหนดตำแหน่งการวางตัวหนังสือบนหรือล่าง เช่น app.constants.align.top ก็จะเท่ากับตัวอักษรชิดไว้บนสุด
		nHorizValue: 2, nVertValue: 0		//กำหนดความห่างจากตำแหน่งที่วาง เช่น วางตัวอักษรไว้ซ้ายสุดถ้า nHorizValue ยิ่งตัวเลขมากก็จะยิ่งห่างไปด้านขวาถ้าค่าเป็นลบก็จะกลับกัน
		//อ่านfunctionเพิ่มเติมได้ที่ https://www.adobe.com/content/dam/acom/en/devnet/acrobat/pdfs/js_api_reference.pdf หน้า274
	})
}

function addTextCorver({_text, size, bet}){
	this.addWatermarkFromText({
		cText: _text, //ข้อความ
		cFont: font.Helv,
		nFontSize: size, //ขนาดsizeตัวอักษร
		nStart: 0, //กำหนดหน้าเริ่มต้น
		nEnd: this.pageNums, //กำหนดหน้าสิ้นสุด
		nRotation: 0, //หมุนตัวอักษร เช่น 180 ก็จะกลัวหัว
		nHorizAlign: app.constants.align.top, //กำหนดตำแหน่งการวางตัวหนังสือซ้ายหรือขวา เช่น app.constants.align.left ก็จะเท่ากับตัวอักษรชิดไว้ซ้ายสุด
		nVertAlign: app.constants.align.bottom, //กำหนดตำแหน่งการวางตัวหนังสือบนหรือล่าง เช่น app.constants.align.top ก็จะเท่ากับตัวอักษรชิดไว้บนสุด
		nHorizValue: 0, nVertValue: bet		//กำหนดความห่างจากตำแหน่งที่วาง เช่น วางตัวอักษรไว้ซ้ายสุดถ้า nHorizValue ยิ่งตัวเลขมากก็จะยิ่งห่างไปด้านขวาถ้าค่าเป็นลบก็จะกลับกัน
		//อ่านfunctionเพิ่มเติมได้ที่ https://www.adobe.com/content/dam/acom/en/devnet/acrobat/pdfs/js_api_reference.pdf หน้า274
	})
}

function stampTextOnPage(){
	var varText = app.response({cTitle: "ข้อความ",cQuestion: "put text for stamp?", cDefault: ""});
	var pages = app.response({cTitle: "เลขหน้า",cQuestion: "Enter page number", cDefault: "all"});
	if (pages === null){
		return false;
	}
	var check = app.alert("Do you want use this fucntion ?", 2, 2, "ยืนยัน");
	if (check === 4){
		var pagelist = pages.split(",");
		for (var i in pagelist){
			if(pagelist[i].indexOf("-") != -1){
				var check2loop = true
				var listNumTo = pagelist[i].split("-");
				var Nstart = parseInt(listNumTo[0]);
				var Nend = parseInt(listNumTo[1]);
				this.addWatermarkFromText({
					cText: varText, //ข้อความ
					cFont: font.Helv,
					nFontSize: 5, //ขนาดsizeตัวอักษร
					nStart: Nstart, //กำหนดหน้าเริ่มต้น
					nEnd: Nend, //กำหนดหน้าสิ้นสุด
					nRotation: -90, //หมุนตัวอักษร เช่น 180 ก็จะกลัวหัว
					nHorizAlign: app.constants.align.left, //กำหนดตำแหน่งการวางตัวหนังสือซ้ายหรือขวา เช่น app.constants.align.left ก็จะเท่ากับตัวอักษรชิดไว้ซ้ายสุด
					nVertAlign: app.constants.align.center, //กำหนดตำแหน่งการวางตัวหนังสือบนหรือล่าง เช่น app.constants.align.top ก็จะเท่ากับตัวอักษรชิดไว้บนสุด
					nHorizValue: 2, nVertValue: 0		//กำหนดความห่างจากตำแหน่งที่วาง เช่น วางตัวอักษรไว้ซ้ายสุดถ้า nHorizValue ยิ่งตัวเลขมากก็จะยิ่งห่างไปด้านขวาถ้าค่าเป็นลบก็จะกลับกัน
					//อ่านfunctionเพิ่มเติมได้ที่ https://www.adobe.com/content/dam/acom/en/devnet/acrobat/pdfs/js_api_reference.pdf หน้า274
				})
			}else{
				var numPage = parseInt(pagelist[i]);			
				this.addWatermarkFromText({
					cText: varText, //ข้อความ
					cFont: font.Helv,
					nFontSize: 5, //ขนาดsizeตัวอักษร
					nStart: numPage, //กำหนดหน้าเริ่มต้น
					nEnd: numPage, //กำหนดหน้าสิ้นสุด
					nRotation: -90, //หมุนตัวอักษร เช่น 180 ก็จะกลัวหัว
					nHorizAlign: app.constants.align.left, //กำหนดตำแหน่งการวางตัวหนังสือซ้ายหรือขวา เช่น app.constants.align.left ก็จะเท่ากับตัวอักษรชิดไว้ซ้ายสุด
					nVertAlign: app.constants.align.center, //กำหนดตำแหน่งการวางตัวหนังสือบนหรือล่าง เช่น app.constants.align.top ก็จะเท่ากับตัวอักษรชิดไว้บนสุด
					nHorizValue: 2, nVertValue: 0		//กำหนดความห่างจากตำแหน่งที่วาง เช่น วางตัวอักษรไว้ซ้ายสุดถ้า nHorizValue ยิ่งตัวเลขมากก็จะยิ่งห่างไปด้านขวาถ้าค่าเป็นลบก็จะกลับกัน
					//อ่านfunctionเพิ่มเติมได้ที่ https://www.adobe.com/content/dam/acom/en/devnet/acrobat/pdfs/js_api_reference.pdf หน้า274
				})
			}
		}
		app.alert("เปลี่ยนค่าเรียบร้อยแล้ว", 3);
		return true;

	}else{
		//app.execDialog(convert_dialog);
		//app.alert("จบการทำงาน");
		return false;
	}
}

function getOneSide(){
	var isOneSide = []
	var list_oneSide = [];
	var pages = app.response({cTitle: "เลขหน้า",cQuestion: "ใส่หน้าที่ต้องการ(ใส่ตัว , เพื่อตัวแยกในแต่ละหน้า)", cDefault: ""});
	var pagelist = pages.split(",");
	var listBlank = [];
	for (var i in pagelist){
		if(pagelist[i].indexOf("-") != -1){
			var check2loop = true
			var listNumTo = pagelist[i].split("-");
			var Nstart = parseInt(listNumTo[0]);
			var Nend = parseInt(listNumTo[1]);
			for(var countTo=Nstart;countTo<=Nend;countTo++){	
				listBlank.push(countTo);
			}
		}else{
			listBlank.push(pagelist[i]);
		}
	}
	for (var i=0;i<listBlank.length;i++){
		isOneSide.push(parseInt(listBlank[i])-(1+i));
	}
	var strOneSide = isOneSide.join(",");
	return strOneSide;

}
function getResult(func){
	var askCopy = app.response("this is your result ", "result", func());
	/*if (askCopy){
		app.execMenuItem("Copy");
		return true;
	}else{
		return false;
	}*/
}

function getListPage(){
	listCur = countListNum(listCurPage);
	listPageStr = listCur.join(",");
	return listPageStr;
}

function blankPage(){
	askPage = app.response("ใส่ตัวเลขหน้า ที่ต้องการแทรกหน้าว่างไว้ด้านหลัง", "insert blank page", getListPage());
	var pagelist = askPage.split(",");
	Rect = this.getPageBox("Crop");
	for (i=0;i<this.pageNums;i++){
		
		if (parseInt(pagelist[i])-1 > pagelist.length){
			pageErr = [];
			pageErr.push(pagelist[i]);
		}
	}
	if(typeof pageErr != "undefined"){
		app.alert("หาหน้าที่ "+ pageErr.join(",") +" ไม่เจอ");
	}else{
		for (i=0;i<pagelist.length;i++){
			this.newPage(pagelist[i]-1, Rect[0], Rect[1]);
		}
		app.alert("succes", 2, 2);
	}
}

/* 
	dialog สำหรับหน้ารวมtools
*/
var totalTools = { 
	"slbm": function(){  // เลือกหน้าบุ๊คมารค์
		select_bookmark("", thisDoc);
	},
	"rmbm": function(){
		removePage('rmBookmark');
	},
	description: 
	{
		name: "AAAservice Tools",
		alignment: "align_offscreen",
		//width: 500,
		//height: 300,
		item_id: "main",
		elements: 
		[
			{
				type: "view",
				width: 500,
				height: 200,
				elements: 
				[
					{
						type: "static_text",
						name: "bookmark tools",
						bold: true
					},
					{
						type: "cluster",
						align_children: "align_row",
						elements: 
						[
							{
								type: "button",
								name: "bookmark page",
								item_id: "slbm"
							},
							{
								type: "button",
								name: "remove bookmark page",
								item_id: "rmbm",
							}
						]
					}
				]
				
			},
			{
				type: "ok",
				ok_name: "close"
			}
		]
	}
}


app.addToolButton({
	cName: "add list",
	//oIcon: oIcon,
	cExec: "addList()",
	cTooltext: "&Grey 1",
	cEnable: true,
	nPos: -1,
	cTooltext: "Add"
	});
app.addToolButton({
	cName: "Undo list page",
	//oIcon: oIcon,
	cExec: "Undo()",
	cTooltext: "Undo",
	cEnable: true,
	nPos: -1,
	cTooltext: "Undo"
	});
app.addToolButton({
	cName: "color to blackS",
	//oIcon: oIcon,
	cExec: "loop_ToBlack()",
	cTooltext: "&Grey~S",
	cEnable: true,
	nPos: -1,
	cTooltext: "to&Gray~S"
	});
app.addToolButton({
	cName: "black to colorS",
	//oIcon: oIcon,
	cExec: "loop_ToColor()",
	cTooltext: "toColor~S",
	cEnable: true,
	nPos: -1,
	cTooltext: "toColor~S"
	});
app.addToolButton({
	cName: "extract page",
	//oIcon: oIcon,
	cExec: "extract_page()",
	cTooltext: "extract page",
	cEnable: true,
	nPos: -1,
	cTooltext: "extract page"
	});
app.addToolButton({
	cName: "Clear Page List",
	//oIcon: oIcon,
	cExec: "clear1Page()",
	cTooltext: "ClearCurPage",
	cEnable: true,
	nPos: -1,
	cTooltext: "ClearCurPage"
	});
app.addToolButton({
	cName: "Clear All Page List",
	//oIcon: oIcon,
	cExec: "clearAllPage()",
	cTooltext: "ClearAllPage",
	cEnable: true,
	nPos: -1,
	cTooltext: "ClearAllPage"
	});
app.addToolButton({
	cName: "pages size",
	//oIcon: oIcon,
	cExec: "getPageSize()",
	cTooltext: "pages size",
	cEnable: true,
	//nPos: -1,
	cTooltext: "pages size"
	});
	
app.addToolButton({
	cName: "stampFileName",
	//oIcon: oIcon,
	cExec: "addText({_text: this.documentFileName, pageStart: 0,pageEnd: 0, size: 5, rotation: -90})",
	cTooltext: "stampFileName",
	cEnable: true,
	//nPos: -1,
	cTooltext: "stampFileName"
	});	
app.addToolButton({
	cName: "stampFileName(Cover)",
	//oIcon: oIcon,
	cExec: "addTextCorver({_text:this.documentFileName, size: 5, bet: 6})",
	cTooltext: "stampFileName(Cover)",
	cEnable: true,
	//nPos: -1,
	cTooltext: "stampFileName(Cover)"
	});
app.addToolButton({
	cName: "bookmark page",
	//oIcon: oIcon,
	cExec: "select_bookmark()",
	cTooltext: "bookmark page",
	cEnable: true,
	//nPos: -1,
	cTooltext: "bookmark page"
	});

app.addMenuItem({ cName: "remove page not boomark", cParent: "Document", cExec: "removePage('rmBookmarkNotSelect')",cEnable: 1});
app.addMenuItem({ cName: "remove page bookmark", cParent: "Document", cExec: "removePage('rmBookmark')",cEnable: 1});
app.addMenuItem({ cName: "getOneSideForPrint", cParent: "Document", cExec: "getResult("+getOneSide+")",cEnable: 1});
app.addMenuItem({ cName: "getListPage", cParent: "Document", cExec: "getResult("+getListPage+")",cEnable: 1});
