/*

เขียน filterPage ให้สามารถget แนวตั้งแนวนอนได้

เขียนให้ filterPage สามารถcall function อื่นได้ เช่น ลบทุกหน้ายกเว้นA3 หรือ bookmark หน้า A3 เป็นต้น

เขียนแยกหน้าเองเช่น แยก A3 กับA4 เป็นสองไฟล์ หรือแยก แยกA3 ออกไปอีกไฟล์

เขียนauto แทรกขาวหน้าคู่

เขียนgetหน้าคู่ของlistเลขหน้า

*/

var listCurPage = [];


// this.getPageBox("Crop", เลขหน้า)  index ที่  2 กับ 3  คือขนาดไซต์ ถ้าอยากได้ขนาดไซต์ที่เป็น inch ก็หารด้วย 72  ก็จะได้ inch 1 inch = 2.54 cm
function toCm(rect){
	result = (rect/72)*2.54;
	return result;
}
function PointsToCm(rect){
	return rect*0.0352778;
}
function cmToPoints(cm){
	return cm/0.0352778;
}
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


function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

/*
	zone format list pages
*/
function formatToList(arr){  //array to format number list
	//var arr = [1,2,3,4,8,15,16,17,20,21,30]
	//arr = arr.map(Number);
	arr = arr.sort(function(a, b){return a - b});
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
	result = result.slice(0, result.length-1)
	result = result.split(",")
	return result
}
function formatStrToList(strList){
	var arrPages = [];
	splitList = strList.split(",");
	for(i=0;i<splitList.length;i++){
		if(splitList[i].indexOf("-") != -1){
			subSplit = splitList[i].split("-");
			for(j=parseInt(subSplit[0]);j<=parseInt(subSplit[1]);j++){
				arrPages.push(j);
			}
		}else{
			arrPages.push(splitList[i]);
		}
	}
	return arrPages.map(Number).sort(function(a, b){return a - b});
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

function clearBookmark(){
	this.bookmarkRoot.remove();
}

function removePage(func){ //for remove page
	if(func == "rmBookmark"){
		var allBookmark=this.bookmarkRoot.children.length;
		//allBookmark = allBookmark-1;
		var listPageSe = []
		for (i=0;i<allBookmark;i++){
			var page = this.bookmarkRoot.children[i].name;
			page = parseInt(page);
			listPageSe.push(page);
		}
		//listPageSe = listPageSe.map(Number);
		listPageSe = listPageSe.sort();
		var check = app.alert("จะลบทุกหน้า "+listPageSe+" จริงหรือไม่?", 2, 2, "confirm");
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
		//listPageSe = listPageSe.map(Number);
		listPageSe = listPageSe.sort();
		var check = app.alert("จะลบทุกหน้ายกเว้นหน้า "+listPageSe+" จริงหรือไม่?", 2, 2, "confirm");
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

function loop_ToBlack(){ //convert pages to gray
	listCur = formatToList(listCurPage);
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

function autoCrop(){
	var totalPage = this.numPages
	for (var i=0; i<totalPage; i++){
		var artBox = this.getPageBox("Art", i)
		var cropBox = this.getPageBox("Crop", i)
		if(i % 2 == 0){ //ถ้าเป็นหน้า คี่ ให้ตัดซ้าย
			this.setPageBoxes("Crop", i, i, [cropBox[0]+artBox[0], cropBox[1], cropBox[2], cropBox[3]])
		}else if( i % 2 == 1){ // ถ้าหน้าคู่ให้ตัดขวา
			this.setPageBoxes("Crop", i, i, [cropBox[0], cropBox[1], cropBox[2]-(cropBox[2]-artBox[2]), cropBox[3]]) // ยังไม่ชัวต้องลองเทส
		}
	}
}

function select_bookmark(msg){ //add list to bookmark
	if (msg === undefined){
		msg = "";
	}
	var list_bookmark = [];
	var pages = app.response({cTitle: "pages number",cQuestion: "Enter your page(can use , and -)", cDefault: msg});
	if (pages === null){
		return false;
	}
	var check = app.alert("All previous bookmarks will be deleted. What do you want continue?", 2, 2, "confirm");
	if (check === 4){
		this.bookmarkRoot.remove(); //ลบบุ๊คมาร์คทั้งหมดก่อนbookmarkใหม่
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
		app.alert("success", 3);
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
	listCur = formatToList(listCurPage);
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

function get2side(){
	pages = app.response("pages list", "Enter your pages");
	listPages = formatStrToList(pages);
	mylist = []
	// app.alert(listPages.length);
	for(i=0;i<listPages.length;i++){
		if(listPages[i] % 2 == 0){ // ถ้าเป็นหน้าคู่
			add = listPages[i]-1;
			if(listPages.indexOf(add) == -1){
				listPages.push(add);
			}
		}else{
			add = listPages[i]+1;
			if(listPages.indexOf(add) == -1){
				listPages.push(add);
			}
		}
	}
	app.response({cTitle: "Result", cDefault: formatToList(listPages)})
	//app.alert(mylist)

}

function test(){ // for test
	/*var oldDoc = app.openDoc(this.path);
	var nDoc = app.newDoc()
	nDoc.replacePages(0, oldDoc.path, 0, oldDoc.numPages)
	*/
	get2side()
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



function checkCropSize(dialog){
	/*
	ถ้าเงือนไขนี้เป็นจริงเท่ากับว่าเป็น A4
	(((Rect[1] > 820 && Rect[1] < 850) && (Rect[2] > 580 && Rect[2] < 605)) || ((Rect[1] > 580 && Rect[1] < 605) && (Rect[2] > 820 && Rect[2] < 850)))

	ถ้าเงือนไขนี้เป็นจริงเท่ากับว่าเป็น A3
	(((Rect[1] > 820 && Rect[1] < 850) && (Rect[2] > 1180 && Rect[2] < 1200)) || ((Rect[1] > 580 && Rect[1] < 605) && (Rect[2] > 1180 && Rect[2] < 1200)))
	*/
	var results = dialog.store();
	var listA3 = [];
	var listA4 = [];
	var listNone = [];
	var strTotals = "";
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
			if(strTotals.length != 0){
				strTotals += ","
			}
			strTotals += listA4.join(",");
			seSize += "A4 ";
		}
	}
	if (results["lta3"]){
		if(listA3!=""){
			if(strTotals.length != 0){
				strTotals += ","
			}
			strTotals += listA3.join(",");
			seSize += "A3 "
		}
	}
	if (results["ltnn"]){
		if(listNone!=""){
			if(strTotals.length != 0){
				strTotals += ","
			}
			strTotals += listNone.join(",");
			seSize += "Other "
		}
	}
	//listTotals = listTotals.join(",");
	var listTotals = strTotals.split(",").map(Number);
	listTotals = listTotals.sort(function(a, b){return a-b});
	strTotals = listTotals.join(",");
	return strTotals;
}

function getPageOf_A3(){
	checkCropSize();
}

function backupWangAksorn(){ // ดึ่งartbox มาเป็นcrop box
	for(i=0;i<this.numPages-1;i++){
		var aRect = this.getPageBox("Art", i)
		this.setPageBoxes("Crop", i, i, [aRect[0], aRect[1], aRect[2], aRect[3]])
	}
}

function docCopy(){
	var docold = this
	var doctest = app.newDoc()
	doctest.replacePages(0, this.path, 0,docold.numPages-1)
}
function filterPages(){
	/*thisDoc = app.openDoc({
		cPath: this.path,
		bHidden: true
	});*/
	//app.execDialog(totalTools);
	//this.bookmarkToBlank();
	//dotheDialog(dialogGetSize, this);
	dialogFilterPages.doc = this;
	app.execDialog(dialogFilterPages);
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
	listCur = formatToList(listCurPage);
	listPageStr = listCur.join(",");
	return listPageStr;
}

function getSpineBook(){
	//var oDoc = app.activeDocs;
	result = (this.numPages/2)*0.0095;
	return result;
}

function updateRotation(rotIn, page){
	var rotOld = this.getPageRotation(page);
	if ((rotOld+rotIn) > 270){
		this.setPageRotations(page, page, (rotOld+rotIn)-360)
	}else if((rotOld+rotIn) < 0){
		this.setPageRotations(page, page, (rotOld+rotIn)+360)
	}else{
		this.setPageRotations(page, page, rotOld+rotIn)
	}
	//this.setPageRotations(page, page, rotOld+rotIn)
}

/*function customsRotate(){


}*/
function sizeAutoRotate(){
	for (i=0;i<this.numPages;i++){
		Rect = this.getPageBox("Crop", parseInt(i));
		if (((PointsToCm(Rect[1]) > 41.5 && PointsToCm(Rect[1]) < 42.5) && (PointsToCm(Rect[2]) > 29.2 && PointsToCm(Rect[2]) < 30.2))){ // ถ้าเป็น A3 แนวตั้ง
			this.updateRotation(-90, parseInt(i)); // ก็ให้rotate หันหัวไปซ้าย
		}else if(((PointsToCm(Rect[1]) > 20.5 && PointsToCm(Rect[1]) < 21.5) && (PointsToCm(Rect[2]) > 29.2 && PointsToCm(Rect[2]) < 30.2))){ // ถ้าเป็นA4 แนวนอน
			this.updateRotation(-90, parseInt(i)); // ก็ให้rotate หันหัวไปซ้าย
		}
	}

	return true;
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

function bookmarkToList(){
	var allBookmark=this.bookmarkRoot.children.length;
	//allBookmark = allBookmark-1;
	var listPageSe = []
	for (i=0;i<allBookmark;i++){
		var page = this.bookmarkRoot.children[i].name;
		page = parseInt(page);
		listPageSe.push(page);
	}
	return listPageSe;
}

function matchA3(){
	pages = app.response({cTitle: "pages",cQuestion: "Enter your pages", cDefault: ""});
	sPages = pages.split(",")
	for(i=sPages.length-1;i>=0;i--){
		if(sPages[i].indexOf("-") != -1){
			subSplit = sPages[i].split("-").map(Number);
			if(subSplit[0]%2 === 0 && subSplit[1]%2 === 1){
				this.newPage(subSplit[1]+1);
				this.deletePages(subSplit[0]-1,subSplit[1]-1);
				this.newPage(subSplit[0]-1);
			}else if(subSplit[0]%2 === 1 && subSplit[1]%2 === 0){
				this.deletePages(subSplit[0]-1, subSplit[1]-1);
			}else if(((subSplit[1]-subSplit[0])+1)%2 === 1){
				if(subSplit[1]%2 === 0){
					this.newPage(subSplit[1]);
				}else if(subSplit[1]%2 === 1){
					this.newPage(subSplit[1]+1);
				}
				this.deletePages(subSplit[0]-1, subSplit[1]-1);
			}
		}else{
			if(parseInt(sPages[i])%2 === 0){
				this.newPage(parseInt(sPages[i]));
			}else if(sPages[i]%2 === 1){
				this.newPage(parseInt(sPages[i])+1);
			}
			this.deletePages(parseInt(sPages[i])-1);
		}
	}
	app.alert("success");
}

function callDialogRotation(){
	dialogRotate.doc = this;
	app.execDialog(dialogRotate);
}

/*
	**** Dialog zone ****
*/
var dialogSpineBook = {
	description: [{
		name: "spineBook",
		elements: [{
			type: "view",
			elements: [{
				type: "edit_text",
				width: 100,
				height: 20
			},
			{
				type: "button",
				name: "get"
			}]
		},
		{
			type: "ok",
			ok_name: "close"
		}]
	}]
}

var dialogFilterPages = { // dialog แยกขนาดกระดาษ


	"page": function(dialog){
		countPages = formatStrToList(dialog.store()["page"]).length
		if (dialog.store()["page"] == ""){
			dialog.load({"ctpg": "0"});
		}else{
			dialog.load({"ctpg": countPages.toString()});
		}
	},
	commit_backup: function(dialog){ // backup สำหรับ function ปุ่ม ok
		var results = dialog.store();
		var listA3 = [];
		var listA4 = [];
		var listNone = [];
		var strTotals = "";
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
				if(strTotals.length != 0){
					strTotals += ","
				}
				strTotals += listA4.join(",");
				seSize += "A4 ";
			}
		}
		if (results["lta3"]){
			if(listA3!=""){
				if(strTotals.length != 0){
					strTotals += ","
				}
				strTotals += listA3.join(",");
				seSize += "A3 "
			}
		}
		if (results["ltnn"]){
			if(listNone!=""){
				if(strTotals.length != 0){
					strTotals += ","
				}
				strTotals += listNone.join(",");
				seSize += "Other "
			}
		}
		//listTotals = listTotals.join(",");
		var listTotals = strTotals.split(",").map(Number);
		listTotals = listTotals.sort(function(a, b){return a-b});
		// listTotals = listTotals.filter(onlyUnique); //list ไม่ซ้ำกัน
		strTotals = listTotals.join(",");
		app.response({cTitle: "result",cQuestion: "pages size of: "+seSize, cDefault: strTotals});
		dialog.load({"ctpg": formatStrToList(dialog.store()["page"]).length});
	},

	"getl": function(dialog){
		var results = dialog.store();
		var listA3 = [];
		var listA4 = [];
		var listA5 = [];
		var listNone = [];
		var listLandscape = [];
		var listPortrailt = [];
		var strTotals = "";
		var seSize = "";
		for (i=0;i<this.doc.numPages;i++){
			Rect = this.doc.getPageBox("Crop", parseInt(i));
			if (((Rect[1] > 820 && Rect[1] < 850) && (Rect[2] > 1180 && Rect[2] < 1200)) || ((Rect[1] > 1180 && Rect[1] < 1200) && (Rect[2] > 820 && Rect[2] < 850))){
				listA3.push(parseInt(i)+1);  //"A3";
			}else if (((Rect[1] > 820 && Rect[1] < 850) && (Rect[2] > 580 && Rect[2] < 605)) || ((Rect[1] > 580 && Rect[1] < 605) && (Rect[2] > 820 && Rect[2] < 850))){
				listA4.push(parseInt(i)+1);  //"A4";
			}else if (((Rect[1] > cmToPoints(20.95) && Rect[1] < cmToPoints(21.05) && (Rect[2] > cmToPoints(14.80) && Rect[2] < cmToPoints(14.90))) || ((Rect[1] > cmToPoints(14.80) && Rect[1] < cmToPoints(14.90)) && (Rect[2] > cmToPoints(20.95) && Rect[2] < cmToPoints(21.05))))){
				listA5.push(parseInt(i)+1);  //"A5";
			}else{
				listNone.push(parseInt(i)+1);   //"none";
			}
		}
		if (results["lta4"]){
			if(listA4!=""){
				if(strTotals.length != 0){
					strTotals += ","
				}
				strTotals += listA4.join(",");
				seSize += "A4 ";
			}
		}
		if (results["lta3"]){
			if(listA3!=""){
				if(strTotals.length != 0){
					strTotals += ","
				}
				strTotals += listA3.join(",");
				seSize += "A3 "
			}
		}
		if (results["ltnn"]){
			if(listNone!=""){
				if(strTotals.length != 0){
					strTotals += ","
				}
				strTotals += listNone.join(",");
				seSize += "Other "
			}
		}
		if (results["bmls"]){
			if(this.doc.bookmarkToList()!=""){
				if(strTotals.length != 0){
					strTotals += ","
				}
				strTotals += this.doc.bookmarkToList();
				seSize += "boomark "
			}
		}
		if (results["lta5"]){
			if(listA5!=""){
				if(strTotals.length != 0){
					strTotals += ","
				}
				strTotals += listA5.join(",");
				seSize += "A5 "
			}
		}
		//listTotals = listTotals.join(",");
		var listTotals = strTotals.split(",").map(Number);
		listTotals = listTotals.sort(function(a, b){return a-b});
		strTotals = listTotals.join(",");
		showListPage = formatToList(listTotals).join(",")
		if (showListPage == 0){
			dialog.load({"page": ""});
		}else{
			dialog.load({"page": showListPage});
		}
		countPages = formatStrToList(dialog.store()["page"]).length
		if (dialog.store()["page"] == ""){
			dialog.load({"ctpg": "0"});
		}else{
			dialog.load({"ctpg": countPages.toString()});
		}
	},
	description:
	{
		name: "get page list",
		elements: [
		{
			name: "get size page",
			type: "cluster",
			align_children: "align_row",
			elements: [
			{
				type: "check_box",
				name: "A5",
				item_id: "lta5"
			},
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
			name: "bookmark",
			type: "cluster",
			elements: [
			{
				type: "check_box",
				name: "bookmark pages",
				item_id: "bmls"
			}]

		},
		{
			type: "view",
			elements: [
			{
				type: "edit_text",
				item_id: "page",
				width: 300,
				height: 20,
				alignment: "align_fill"
			},
			{
				type: "button",
				name: "get list",
				item_id: "getl"
			},
			{
				type: "static_text",
				name: "count",
				alignment: "align_right"
			},
			{
				type: "edit_text",
				item_id: "ctpg", // ย่อมาจาก count page
				width: 50,
				height: 20,
				alignment: "align_right"
			}]
		},
		{
			type: "ok",
			ok_name: "close"
		}]
	}
}


var dialogRotate = {
	initialize: function(dialog){
		dialog.enable({"scrc": false});
		dialog.load({"auto": true});
		dialog.load({"rotl": {"clocwise 90 degrees": +1, "couterClockwise 90 degrees": -2, "180 degrees": -3}})
	},
	commit: function(dialog){
		if(dialog.store()["auto"] === true){
			this.doc.sizeAutoRotate();
		}
	},
	"auto": function(dialog){
		dialog.enable({"scrc": false})
	},
	"ctmm": function(dialog){
		dialog.enable({"scrc": true})
	},
	description: {
		name: "Easy Rotate",
		elements: [{
			type: "cluster",
			name: "Mode",
			elements: [{
				type: "radio",
				name: "auto",
				item_id: "auto",
				group_id: "mode"
			},
			{
				type: "radio",
				name: "customs",
				item_id: "ctmm", // ย่อมาจาก custom mode
				group_id: "mode"
			},
			{
				type: "view",
				item_id: "scrc",
				elements: [{
					type: "popup",
					item_id: "rotl", //ย่อมาจาก Rotate list
					width: 200
				},
				{
					type: "static_text",
					name: "pages"
				},
				{
					type: "edit_text",
					width: 300,
					item_id: "gctp" // ย่อมาจาก get customs page
				}]
			},
			{
				type: "ok_cancel"
			}
			]
		}]
	}
}



var dialogSpineBook = { // กำลังเขียนอยู่
	description: {
		name: "spineBook",
		elements: [{
			type: "list_box",
			name: "testing",
			width: 300

		},
		{
			type: "ok",
		}]
	}
}

var totalTools = {  // dialog สำหรับหน้ารวมtools // ยังไม่สมบูรณ์
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

var testdialog = {
	description: {
		name: "testing",
		elements: [{
			type: "popup",
			name: "testing"
		},
		{
			type: "ok_cancel",
		}]
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
	cName: "filterPages",
	//oIcon: oIcon,
	cExec: "filterPages()",
	cTooltext: "filterPages",
	cEnable: true,
	//nPos: -1,
	cTooltext: "filterPages"
	});

/*app.addToolButton({
	cName: "stampFileName",
	//oIcon: oIcon,
	cExec: "addText({_text: this.documentFileName, pageStart: 0,pageEnd: 0, size: 5, rotation: -90})",
	cTooltext: "stampFileName",
	cEnable: true,
	//nPos: -1,
	cTooltext: "stampFileName"
	});	 */
/*app.addToolButton({
	cName: "stampFileName(Cover)",
	//oIcon: oIcon,
	cExec: "addTextCorver({_text:this.documentFileName, size: 5, bet: 6})",
	cTooltext: "stampFileName(Cover)",
	cEnable: true,
	//nPos: -1,
	cTooltext: "stampFileName(Cover)"
	}); */
app.addToolButton({
	cName: "bookmark page",
	//oIcon: oIcon,
	cExec: "select_bookmark()",
	cTooltext: "bookmark page",
	cEnable: true,
	//nPos: -1,
	cTooltext: "bookmark page"
	});
app.addToolButton({
	cName: "clearBookmark",
	//oIcon: oIcon,
	cExec: "clearBookmark()",
	cTooltext: "clearBookmark",
	cEnable: true,
	//nPos: -1,
	cTooltext: "clearBookmark"
	});

app.addMenuItem({ cName: "remove page not boomark", cParent: "Document", cExec: "removePage('rmBookmarkNotSelect')",cEnable: 1});
app.addMenuItem({ cName: "remove page bookmark", cParent: "Document", cExec: "removePage('rmBookmark')",cEnable: 1});
app.addMenuItem({ cName: "test", cParent: "Tools", cExec: "test()",cEnable: 1});
app.addMenuItem({ cName: "autoCrop", cParent: "Document", cExec: "autoCrop()",cEnable: 1});
app.addMenuItem({ cName: "getOneSideForPrint", cParent: "Document", cExec: "getResult("+getOneSide+")",cEnable: 1});
app.addMenuItem({ cName: "getSpineBook", cParent: "Document", cExec: "app.alert(getSpineBook()+' cm')",cEnable: 1});
app.addMenuItem({ cName: "filterPages", cParent: "Document", cExec: "filterPages()",cEnable: 1});
app.addMenuItem({ cName: "matchA3", cParent: "Document", cExec: "matchA3()",cEnable: 1});
app.addMenuItem({ cName: "eazyRotate", cParent: "Document", cExec: "callDialogRotation()",cEnable: 1});
app.addMenuItem({ cName: "get2side", cParent: "Tools", cExec: "get2side()",cEnable: 1});
