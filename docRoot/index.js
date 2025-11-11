window.addEventListener("load",()=>{
    const createUi = document.querySelector(".createUI");
    const rowCnt = document.querySelector(".rowCnt");
    
    const colCnt = document.querySelector(".colCnt");
    
    createUi.addEventListener("click",()=>{
        const isEven = (index)=>{
            return (index % 2 == 0);
        }
        const ROW_MAX = parseInt(rowCnt.value);
        const COL_MAX = parseInt(colCnt.value);
        const table = document.createElement("table");
        const tbody = document.createElement("tbody");
        for(let row = 1; row <= ROW_MAX; row++){
            const tr = document.createElement("tr");
            tr.dataset.isEven = isEven(row);
            for(let col = 1; col <= COL_MAX; col++){
                const td = document.createElement("td");
                td.textContent = "col"+col.toString();
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
        table.appendChild(tbody);
        const root = document.querySelector(".table-area");
        root.innerHTML = "";
        root.appendChild(table);
        
    });
});