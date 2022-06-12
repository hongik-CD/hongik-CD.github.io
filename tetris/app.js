class Stage{
    constructor(pos){
        this._x = 10;
        this._y = 20;
        this._pos = pos;
        this.createStage();

        this._adjustInterval;
        this._duration = 20000;

        this._scoreDiv = document.getElementById("score")
        this.IntervalDeleteRow();
    }
    createStage(){
        while (this._pos.firstChild) {
            this._pos.removeChild(this._pos.firstChild);
          }
        for(let i =0; i<this._y; i++){
            this.newLine();
        }
    }
    newLine(){
        const row_all = document.createElement("li");
        const row = document.createElement("ul");

        for(let j = 0; j <this._x; j ++){
            const column = document.createElement("li");
            row.append(column);
        }
        row_all.prepend(row);
        this._pos.prepend(row_all);
    }
    getStage(){
        return this._pos;
    }
    deleteRow(){
        const end = this._pos.childNodes;
        const len = end.length;
        const elem = end[len-1];
        elem.remove();
        this.newLine();
    }
    IntervalDeleteRow(){
        clearInterval(this._adjustInterval);
        this._adjustInterval = setInterval(()=>{
            this.deleteRow()
        },this._duration);
    }
    cancelInteval(){
        clearInterval(this._adjustInterval);
    }
    checkMatch(){
        this._pos.childNodes
            .forEach(elem => {
                const matched = [...elem.children[0].childNodes]
                    .every(li => li.classList.contains("seized"));
                if(matched){
                    elem.remove();
                    this.newLine();
                }
            })
    }
    updateStage(key){
        document.querySelectorAll(".moving")
            .forEach(item =>{
                item.classList.remove(key,'moving');
            });
    }
}

class Block{
    constructor(blocks){
        this._blocks = blocks;
        this._names = Object.keys(blocks);
        this._len = this._names.length;
        this._movingItem={
            name : "",
            form : 0,
            down : 0,
            left : 3,
        }
        this._tempMovingItem = {...this._movingItem}
    }
    getTempMovingBlock(){
        return this._tempMovingItem;
    }
    getMovingBlock(){
        return this._movingItem;
    }
    resetBlock(){
        this._tempMovingItem = {...this._movingItem}
    }
    updateBlock({form, left, down}){
        this._movingItem.down = down;
        this._movingItem.form = form;
        this._movingItem.left = left;
    }
    newBlock(){
        this._movingItem.name= 
            this._names[Math.floor(Math.random()*this._len)]
        this._movingItem.left= 3;
        this._movingItem.down= 0;
        this._movingItem.form= 0;
        this._tempMovingItem = {...this._movingItem};
    }
    getBlock(){
        const {name, form, left, down} = this._tempMovingItem;
        return this._blocks[name][form].reduce((total, block)=>{
            const x = block[0] + left;
            const y = block[1] + down;
            total.push([x,y])
            return total;
        },[]);
    }
    moveBlock(type, num){
        this._tempMovingItem[type] += num;
    }
    siezeBlock(){
        document.querySelectorAll(".moving")
        .forEach(item =>{
            item.classList.remove("moving");
            item.classList.add("seized");
        });
    }
    changeForm(){
        if (this._tempMovingItem.form === 3) return;
        this._tempMovingItem.form +=1;
    }
}


class Score{
    constructor(){
        this._score = 0;
        this._weight = 0;

        this._form = {
            origin : 1000,
            harf : 1500,
            quater : 1700,
            box : 2000,
        }
        this._gravity = 0.1;

        this._numOfPerson;
        // 20초마다 사람 한명씩 빼주기
        this.testCacl();
    }
    init(){
        this._score = 0;
        this._weight = 70;
        this._numOfPerson = 0;
        this._gravity = 0.4;
    }
    applyGravity(){
        this._toalWeight = 0;
        for(let i=0; i< this._numOfPerson; i ++){
            if (i <= 10){
                const pct = this._gravity - 0.01
                this._gravity= pct;
            }else{
                this._gravity = 0.4
            }
            const num = Math.floor(this._weight * this._gravity);
            console.log(num);
            this._weight += num;
        }
    }
    updateScore(form){
        this._score += this._form[form];
        this._numOfPerson += 1;
    }
    calcScore(){
        this.applyGravity();
        this._score -= this._weight;
    }
    testCacl(){
        this.getScore({
            origin : 9,
            harf : 1,
            quater : 0,
            box : 2,
        });
        this.getScore({
            origin : 1,
            harf : 0,
            quater : 0,
            box : 24,
        });
    }
    getScore(obj){
        this.init();
        Object.keys(obj)
            .forEach(key=>{
                for(let i =0; i<obj[key]; i++){
                    this.updateScore(key)
                }
            });
        this.calcScore()
        console.log("총인원 :",this._numOfPerson);
        console.log("무게 :",this._weight);
        console.log("총점 :", this._score);
        console.log("");
    }
}


class Game{
    constructor(blocks){
        this._stage = new Stage(
            document.querySelector(".stage > ul"))

        this._score = new Score();

        this._duration = 500;
        this._downInterval;

        this._blocks= new Block(blocks);
    }
    run(){
        this._stage.createStage();
        this.generateBlock();
        // this.handleEvent();
    }
    isAvailable(target){
        if (!target || target.classList.contains("seized")) 
            return false;
        return true;
    }
    render(type=""){
        const {name, form, left, down} = 
            this._blocks.getTempMovingBlock();

        this._stage.updateStage(name);
        this._blocks.getBlock()
            .some(([x,y]) => {
                const stage = this._stage.getStage();
                const target = stage.childNodes[y]?
                    stage.childNodes[y].childNodes[0].childNodes[x]
                    : null;

                if (this.isAvailable(target)){
                    target.classList.add(name, "moving");
                }else{
                    this._blocks.resetBlock();
                    if (type === "retry"){
                        clearInterval(this._downInterval);
                        this._stage.cancelInteval();
                        this.showNotice();
                    }
                    setTimeout(()=>{
                        this.render("retry");
                        if (type === "ArrowDown"){
                            this._blocks.siezeBlock();
                            this._stage.checkMatch();
                            this.generateBlock()
                        }    
                    },0);
                    return true;
                }
            });
        this._blocks.updateBlock({down,left,form});
    }
    dropBlock(){
        clearInterval(this._downInterval);
        this._downInterval = setInterval(()=>{
            this._blocks.moveBlock("down",1);
            this.render("ArrowDown");
        },10);
    }

    generateBlock(){
        clearInterval(this._downInterval);
        this._downInterval = setInterval(()=>{
            this._blocks.moveBlock("down",1);
            this.render("ArrowDown");
        },this._duration);

        this._blocks.newBlock();
        // this.render();
    }
    // handleEvent(){
    //     document.addEventListener("keydown", e =>{
    //         this.handleBlock(e.code);
    //         this.render(e.code);
    //     })
    // }
    showNotice(){
        document.getElementById("notice")
            .classList.remove("dp-none");
    }
    handleBlock(key){
        console.log(key)
        if (key === "ArrowRight") 
            this._blocks.moveBlock("left", 1);
        else if (key === "ArrowLeft")
            this._blocks.moveBlock("left", -1);
        else if (key === "ArrowDown")
            this._blocks.moveBlock("down", 1);
        else if (key === "ArrowUp")
            this._blocks.changeForm();
        else if (key === "Space")
            this.dropBlock();
        else return;
    }
}

class GameCtrl{
    constructor(game){
        this._game = game;
        this._notice = document.getElementById("notice");
        this._ctrl = document.getElementById("control");
        this.start();
    }
    showNotice(){
        this._notice.classList.remove("dp-none");
    }
    start(){
        this.handleEvent();
        const startBtn = document.getElementById("game_start");
        startBtn.addEventListener("pointerdown", e =>{
            this._notice.classList.add("dp-none");
            this._game.run();
        })
    }
    handleEvent(){
        document.addEventListener("keydown", e =>{
            this._game.handleBlock(e.code);
            this._game.render(e.code);
        })
        this._ctrl.addEventListener("pointerdown", e=>{
           
            if(e.target.tagName !== "BUTTON") return;
            this._game.handleBlock(e.target.value);
            this._game.render(e.target.value);
        })

    }

}



const game = new Game(blocks);
new GameCtrl(game);

// game.run()


