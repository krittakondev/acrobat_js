var listCurPage = []

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
					ok_name: "��ŧ",
					cancel_name: "¡��ԡ"
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
	result = result.split(",")
	return result
}

function removePage(func){
	if(func == "rmNotSelect"){
		listCur = countListNum(listCurPage);
		listPageStr = listCur.join(",");
		var pages = app.response({cTitle: "�Ţ˹��",cQuestion: "���˹�ҷ���ͧ���(����� , ���͵���¡�����˹�����͵�� - �����кت�ǧ����Ţ)", cDefault: listPageStr});
		pages.cDefault = "testing";
		var listToColor = [];
		if (pages === null){
			return false;
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
		var check = app.alert("��ź�ء˹��¡���˹�� "+listPageSe+" ��ԧ�������?", 2, 2, "�׹�ѹ");
		if (check === 4){
			for (i=this.numPages;i>0;i--){
				if(listPageSe.indexOf(i) == -1){
					this.deletePages(i-1);
				}
			}
			app.alert("ź���º��������", 3);
			app.execMenuItem("SaveAs")
		}
		
	}
	
}

function loop_ToBlack(){
	listCur = countListNum(listCurPage);
	listPageStr = listCur.join(",");
	var pages = app.response({cTitle: "�Ţ˹��",cQuestion: "���˹�ҷ���ͧ���(����� , ���͵���¡�����˹�����͵�� - �����кت�ǧ����Ţ)", cDefault: listPageStr});
	if (pages === null){
		return false;
	}
	var check = app.alert("��ͧ�����ѧ���蹹��������� ?", 2, 2, "�׹�ѹ");
	if (check === 4){
		var pagelist = pages.split(",");
		var toBlack = this.getColorConvertAction();
		//toBlack.matchAttributesAny = -1;
		toBlack.matchAttributesAll = constants.objectFlags.ObjOverprinting;
		//toBlack.matchSpaceTypeAny = ~toBlack.constants.spaceFlags.GraySpace;
		//toBlack.matchIntent = toBlack.constants.renderingIntents.Any;
		toBlack.convertProfile = "Gray Gamma 2.2";
		//toBlack.convertIntent = toBlack.constants.renderingIntents.Document
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
		app.alert("����¹������º��������", 3);
		return true;
	}else{
		//app.execDialog(convert_dialog);
		//app.alert("����÷ӧҹ");
		return false;
	}
}

function loop_ToColor_backup(){
	var ask_conAll = app.alert("�س��ͧ����ŧ�ء˹���繢�Ǵӡ�͹�������� ?", 2, 2, "�ŧ�ء˹��");
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
	}
	var pages = app.response({cTitle: "�Ţ˹��",cQuestion: "���˹�ҷ���ͧ���(����� , ���͵���¡�����˹��)", cDefault: ""});
	if (pages === null){
		return false;
	}
	var check = app.alert("��ͧ�����ѧ���蹹��������� ?", 2, 2, "�׹�ѹ");
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
		app.alert("����¹������º��������", 3);
		return true;

	}else{
		//app.execDialog(convert_dialog);
		//app.alert("����÷ӧҹ");
		return false;
	}
}

function select_bookmark(){
	var list_bookmark = [];
	var pages = app.response({cTitle: "�Ţ˹��",cQuestion: "���˹�ҷ���ͧ���(����� , ���͵���¡�����˹��)", cDefault: ""});
	if (pages === null){
		return false;
	}
	var check = app.alert("��ͧ�����ѧ���蹹��������� ?", 2, 2, "�׹�ѹ");
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
		app.alert("����¹������º��������", 3);
		return true;

	}else{
		//app.execDialog(convert_dialog);
		//app.alert("����÷ӧҹ");
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
	var pages = app.response({cTitle: "�Ţ˹��",cQuestion: "���˹�ҷ���ͧ���(����� , ���͵���¡�����˹�����͵�� - �����кت�ǧ����Ţ)", cDefault: listPageStr});
	pages.cDefault = "testing";
	var listToColor = [];
	if (pages === null){
		return false;
	}
	var check = app.alert("��ͧ�����ѧ���蹹��������� ?", 2, 2, "�׹�ѹ");
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
		app.alert("����¹������º��������", 3);
		return true;

	}else{
		//app.execDialog(convert_dialog);
		//app.alert("����÷ӧҹ");
		return false;
	}
}


function extract_page(){
	var pages = app.response({cTitle: "�Ţ˹��",cQuestion: "���˹�ҷ���ͧ���(����� , ���͵���¡�����˹�����͵�� - �����кت�ǧ����Ţ)", cDefault: ""});
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
	app.alert("extract �����");
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

function test(){
	this.getPageBox("Crop", this.pageNum)
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
		cText: _text, //��ͤ���
		nFontSize: size, //��Ҵsize����ѡ��
		nStart: pageStart, //��˹�˹���������
		nEnd: pageEnd, //��˹�˹������ش
		nRotation: rotation, //��ع����ѡ�� �� 180 ��С������
		nHorizAlign: app.constants.align.left, //��˹����˹觡���ҧ���˹ѧ��ͫ������͢�� �� app.constants.align.left �����ҡѺ����ѡ�êԴ�������ش
		nVertAlign: app.constants.align.center, //��˹����˹觡���ҧ���˹ѧ��ͺ�������ҧ �� app.constants.align.top �����ҡѺ����ѡ�êԴ��麹�ش
		nHorizValue: 20, nVertValue: 0 //��˹�������ҧ�ҡ���˹觷���ҧ �� �ҧ����ѡ���������ش��� nHorizValue ��觵���Ţ�ҡ��������ҧ仴�ҹ��Ҷ�Ҥ����ź��С�Ѻ�ѹ
		//��ҹfunction����������� https://www.adobe.com/content/dam/acom/en/devnet/acrobat/pdfs/js_api_reference.pdf ˹��274
	})
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
	cName: "test",
	//oIcon: oIcon,
	cExec: "addText({_text: 'test', pageStart: 0,pageEnd: 0, size: 12, rotation: -90})",
	cTooltext: "test",
	cEnable: true,
	nPos: -1,
	cTooltext: "test"
	});
app.addToolButton({
	cName: "bookmark page",
	//oIcon: oIcon,
	cExec: "select_bookmark()",
	cTooltext: "bookmark page",
	cEnable: true,
	nPos: -1,
	cTooltext: "bookmark page"
	});
	
app.addMenuItem({ cName: "remove page not boomark", cParent: "Document", cExec: "removePage('rmBookmarkNotSelect')",cEnable: 1, nPos: 17});
//app.addMenuItem({ cName: "&Check Black", cParent: "Tools", cExec: "loop_convert()",cEnable: 1, nPos: 16});