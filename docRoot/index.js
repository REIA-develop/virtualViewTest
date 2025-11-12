function* astart(){
	const start = 0x41;
	const end = 0x41 + 25;
	let index = 0;
	while(true){
		let result = start + index;
		index++;
		if(result == end){
			index = 0;
		}
		yield String.fromCharCode(result);
	}
}
window.addEventListener("load",()=>{
	const createUi = document.querySelector(".createUI");
	const rowCnt = document.querySelector(".rowCnt");
	
	const colCnt = document.querySelector(".colCnt");

	createUi.addEventListener("click",()=>{
		const isEven = (index)=>{
			return (index % 2 == 0);
		}
		const astartiter = astart();
		const ROW_MAX = parseInt(rowCnt.value);
		const COL_MAX = parseInt(colCnt.value);
		const table = document.createElement("table");
		const tbody = document.createElement("tbody");
		const thead = document.createElement("thead");
		const tr = document.createElement("tr");
		for(let col = 1; col <= COL_MAX; col++){
			const td = document.createElement("th");
			td.textContent = "col"+col.toString();
			tr.appendChild(td);
		}
		thead.appendChild(tr);
		table.appendChild(thead);
		for(let row = 1; row <= ROW_MAX; row++){
			const tr = document.createElement("tr");
			tr.dataset.isEven = isEven(row);
			for(let col = 1; col <= COL_MAX; col++){
				const td = document.createElement("td");
				if(col == 3){
					const input = document.createElement("input");
					input.type="text";
					input.placeholder="テキスト";
					td.appendChild(input);
					tr.appendChild(td);
					continue;
				}
				
				td.textContent = "col"+astartiter.next().value;
				tr.appendChild(td);
			}
			tbody.appendChild(tr);
		}
		table.appendChild(tbody);
		const root = document.querySelector(".table-area");
		root.innerHTML = "";
		$(table).tablesorter();
		const container = document.createElement("virtual-table");
		const getHeightRoot = ()=>getComputedStyle(root).height.replace("px","");

		container.setAttribute("box-height",getHeightRoot());
		container.setAttribute("scroll-top","0");
		container.setAttribute("expect-height","28px");
		window.addEventListener("resize",()=>container.setAttribute("box-height",getHeightRoot()))
		root.addEventListener("scroll",()=>container.setAttribute("scroll-top",root.scrollTop));
		container.appendChild(table);
		root.appendChild(container);
		
	});
});