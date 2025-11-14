class VirtualTable extends HTMLElement{
    /**監視属性 */
    static observedAttributes = ["scroll-top", "box-height"];
    /**@type {Array<{index:number, row:HTMLElement, top:number}>} 行一覧 */
    #trList;
    /**@type {number} １行あたりの予想高さ */
    #expectHeight;
    /**@type {number}  スクロールの位置*/
    #scrollTop;
    /**@type {number} 表示個数 */
    #displayCount;
    /**@type {HTMLElement}  表示テーブル */
    #displayTable;
    /**@type {number} 表示高さ */
    #boxHeight;
    /**@type {HTMLElement}  対象テーブル */
    #targetTable;
    /**@type {HTMLElement} 上側スペーサー */
    #upperSpacer;
    /**@type {HTMLElement} 下側スペーサー */
    #lowerSpacer;
    constructor(){
        super();
        this.#expectHeight = 40;
        this.#scrollTop = 0;
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if(name == "scroll-top"){
            this.#scrollTop = parseFloat(newValue);   
        }
        if(name == "box-heihgt"){
            this.#boxHeight = parseFloat(newValue);
            this.#displayCount = Math.ceil(parseFloat(newValue) / this.#expectHeight)

        }
        this.#updateDisplay();
    }
    /**
     * 属性値からフィールドをセットアップします。
     * @returns 
     */
    #fieldSetFromAttribute(){
        let expectHeight = this.getAttribute("expect-height");
        if(expectHeight != null){
            if(!(expectHeight.endsWith("px") || expectHeight.endsWith("vh"))){
                throw new Error("virtual-tableのexpect-heightはpxまたはvh以外許容しません")
            }
            if(expectHeight.endsWith("px")){
                expectHeight = expectHeight.replace("px","");
                // 数値のみかつ小数点が１つ
                if(!(/^([0-9]|\.)+$/g.test(expectHeight) && expectHeight.split(".").length <= 2)){
                    throw new Error("virtual-tableのexpect-heightはpxまたはvh以外許容しません")
                }
                this.#expectHeight = parseFloat(expectHeight);
            }
            if(expectHeight.endsWith("vh")){
                expectHeight = expectHeight.replace("vh","");
                // 数値のみかつ小数点が１つ
                if(!(/^([0-9]|\.)+$/g.test(expectHeight) && expectHeight.split(".").length <= 2)){
                    throw new Error("virtual-tableのexpect-heightはpxまたはvh以外許容しません");
                }
                this.#expectHeight = window.innerHeight * parseFloat(expectHeight)
            }
        }
        const scrollTop = this.getAttribute("scroll-top");
        if(scrollTop == null){
            throw new Error("virtual-tableのscroll-topは必須です。スクロールの高さを同期させてください");
        }
        if(!(/^([0-9]|\.)+$/g.test(scrollTop) && scrollTop.split(".").length <= 2)){
            throw new Error("virtual-tableのscroll-topは必須です。スクロールの高さを同期させてください");
        }
        this.#scrollTop = parseFloat(scrollTop);
        const boxHeight = this.getAttribute("box-height");
        if(boxHeight == null){
            throw new Error("virtual-tableのbox-heightは必須です。スクロールの高さを同期させてください");
        }
        if(!(/^([0-9]|\.)+$/g.test(boxHeight) && boxHeight.split(".").length <= 2)){
            throw new Error("virtual-tableのbox-heightは必須です。スクロールの高さを同期させてください");
        }
        this.#boxHeight = parseFloat(boxHeight);
        this.#displayCount = Math.ceil(parseFloat(boxHeight) / this.#expectHeight)
        
    }
    connectedCallback(){
        const table = this.querySelector("table");
        this.#targetTable = table;
        table.style.display = "none";
        try{
            this.#fieldSetFromAttribute();
        }catch(e){
            if(e instanceof Error){
                alert(e.message);
                return;
            }
        }
        
        

        this.#displaySetup();
    }
    #displaySetup(){
        const table = document.createElement("table");
        table.classList.add("display-table");
        const thead =document.createElement("th");
        [...this.#targetTable.querySelectorAll("thead>tr")].forEach(head=>{
            thead.appendChild(head);
        });
        table.appendChild(thead);
        table.appendChild(document.createElement("tbody"));
        this.#displayTable = table;
        this.appendChild(table);
        this.#upperSpacer = document.createElement("tr");
        this.#lowerSpacer = document.createElement("tr");
        
        const observer = new MutationObserver(()=>{
            this.#updateDisplay();
        });
        [...this.#displayTable.querySelectorAll("tr>th")].forEach(head=>{
            observer.observe(head,{
                childList:false,
                subtree:false,
                attributes:true,
                attributeFilter:["class"]
            });
        });
        this.#updateDisplay();
    }
    addcode(value){
        return;
        const code =document.createElement("code")
        code.textContent =value
        document.querySelector("#code").appendChild(code)
    
}
    /**
     * jqueryソートを発行するため一度移動しヘッダーをクリックする
     * @param {HTMLElement} srcHeader 
     */
    #dispatchJquerySort(srcHeader){
        

    }
    #updateDisplay(){
        this.#trList = [...this.#targetTable.querySelectorAll("tbody>tr")].map((value,index)=>{
            return {
                index:index
                ,row:value
                ,top:index * this.#expectHeight
            }
        });
        this.addcode("lower 計算");
        
        const lower = Math.max(0,this.#scrollTop - this.#expectHeight);
        this.addcode(lower.toString());
        this.addcode("upper")
        const upper = lower + ((this.#displayCount + 1) * this.#expectHeight);
        this.addcode(upper);
        const tbody = this.#displayTable.querySelector("tbody");
        const thead = this.#displayTable.querySelector("thead");
        
        
        tbody.appendChild(this.#lowerSpacer);
        this.#lowerSpacer.style.height = lower.toString()+"px";
        let maxPoint = 0;
        this.addcode(lower)
        this.#trList.filter(tr=> lower <= tr.top && tr.top <= upper).forEach(tr=>{
            tbody.appendChild(tr.row);
            
            maxPoint = tr.top;
        });


        
        this.#upperSpacer.style.height = (Math.max(...this.#trList.map(tr=>tr.top)) - maxPoint).toString()+"px";
        tbody.appendChild(this.#upperSpacer);
        
    }
}
window.customElements.define("virtual-table",VirtualTable);