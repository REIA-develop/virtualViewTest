class VirtualTable extends HTMLElement{
    /**監視属性 */
    static observedAttributes = [ "box-height"];
    /**@type {Array<{index:number, row:HTMLElement, top:number}>} 行一覧 */
    #trList;
    /**@type {number} １行あたりの予想高さ */
    #expectHeight;
    
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
    /**@type {()=>number} 現在位置の取得関数 */
    #getScrollTop;
    /**@type {HTMLElement | undefined} ルートボックス */
    #scrollBox;
    /**@type {number} 前回処理したスクロール位置 */
    #previousScrollTop;
    constructor(){
        super();
        this.#expectHeight = 40;
        this.#upperSpacer = document.createElement("tr");
        this.#lowerSpacer = document.createElement("tr");
        this.#previousScrollTop = -1;
        this.#getScrollTop = ()=>{
            console.warn("未設定または初回起動のため機能しません。スクロールを取得する関数をセットしてください");
            return 0;
        }
    }
    /**
     * @param {function} _getter スクロールを取得する関数
     */
    set scrollBox(_scrollBox){
        if(!(_scrollBox instanceof HTMLElement)){
            throw new Error("scrollBoxはHTMLElementを設定してください");
        }
        if(this.#scrollBox != undefined){
            throw new Error("scrollBoxはHTMLElementを設定してください");
        }
        this.#scrollBox = _scrollBox;
        this.#getScrollTop = ()=>this.#scrollBox.scrollTop;
        const observer = new IntersectionObserver(()=>{
            console.log("intersect")
            this.#updateDisplay();
        },{
            root: this.#scrollBox
            ,rootMargin: "0px 0px"
            ,threshold:0.0

        })
        observer.observe(this.#lowerSpacer);
        observer.observe(this.#upperSpacer);
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if(newValue == oldValue){
            return;
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
        const thead =document.createElement("thead");
        [...this.#targetTable.querySelectorAll("thead>tr")].forEach(head=>{
            thead.appendChild(head);
        });
        table.appendChild(thead);
        table.appendChild(document.createElement("tbody"));
        this.#displayTable = table;
        this.appendChild(table);
        
        this.#trList = [...this.#targetTable.querySelectorAll("tbody>tr")].map((value,index)=>{
            return {
                index:index
                ,row:value
                ,top:index * this.#expectHeight
            }
        });
        const observer = new MutationObserver(()=>{
            this.#trList = [...this.#targetTable.querySelectorAll("tbody>tr")].map((value,index)=>{
                return {
                    index:index
                    ,row:value
                    ,top:index * this.#expectHeight
                }
            });
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

    #updateDisplay(){
        const lower = Math.max(0,this.#getScrollTop() - (this.#expectHeight * 2));
        const upper = lower + ((this.#displayCount + 1) * this.#expectHeight);
        const tbody = this.#displayTable.querySelector("tbody");        
        
        
        
        

        this.#lowerSpacer.style.height = lower.toString()+"px";

        const displayElementList = []
        displayElementList.push(this.#lowerSpacer);
        let maxPoint = 0;
        
        this.#trList.filter(tr=> lower <= tr.top && tr.top <= upper).forEach(tr=>{
            
            displayElementList.push(tr.row);
            
            maxPoint = tr.top;
        });


        
        this.#upperSpacer.style.height = (Math.max(...this.#trList.map(tr=>tr.top)) - maxPoint).toString()+"px";
        displayElementList.push(this.#upperSpacer);

        [...tbody.children].forEach(elem=>elem.remove());
        displayElementList.forEach(elem=>tbody.appendChild(elem));
        
    }
}
window.customElements.define("virtual-table",VirtualTable);