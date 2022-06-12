


class Stage{
    constructor(pos){
        this._x = 15;
        this._y = 30;
        this._pos = pos;
        this.createStage();
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
    checkMatch(){
        this._pos.childNodes
            .forEach(elem => {
                const matched = 
                [...elem.children[0].childNodes]
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
                Object.values(key).forEach(key=>{
                    item.classList.remove(key,'moving');
                })
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
            css : ""
        }
        this._tempMovingItem = {...this._movingItem}

        this._personCss= person_css;
        this._cssName = Object.keys(this._personCss);
        
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
        // this._movingItem.name= 
        //     this._names[Math.floor(Math.random()*this._len)]
        this._movingItem.name = "box";

        this._movingItem.css = this._cssName[Math.floor(Math.random()*this._cssName.length)];
        this._movingItem.left= 3;
        this._movingItem.down= 0;
        this._movingItem.form= 0;
        this._tempMovingItem = {...this._movingItem};
    }
    setCss(key){
        return this._personCss[key];
    }
    getBlock(){
        const {name, form, left, down} = this._tempMovingItem;

        return this._blocks[name][form];

        Object.entries(block).reduce

        return this._blocks[name][form]
            .reduce((total, block)=>{
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
        this._score;
        this._weight;
        this._gravity;
        this._numOfPerson;

        this._form = {
            origin : 1000,
            half : 1500,
            quater : 1700,
            box : 2000,
        }
        // this.testCacl();
    }
    init(){
        this._score = 0;
        this._weight = 70;
        this._numOfPerson = 0;
        this._gravity = 0.4;
    }
    getScore(){
        return{
            person : this._numOfPerson,
            totalscore : this._score,
            pressure : this._weight
        }
    }
    looseWeight(){
        this._numOfPerson -= 1;
        this.updateScore();
    }
    applyGravity(){
        this._toalWeight = 0;
        for(let i=0; i< this._numOfPerson; i ++){
            if (i <= 10){
                const pct = this._gravity - 0.01
                this._gravity= pct;
            }else{
                this._gravity = 0.2
            }
            const num = Math.floor(this._weight * this._gravity);
            this._weight += num;
        }
    }
    updateScore(form){
        this._score += this._form[form];
        this._numOfPerson += 1;
        this.calcScore();
        // this.get_log();
    }
    calcScore(){
        this.applyGravity();
        this._score -= this._weight;
    }
    getScoreElem(){
        return {
            person : document.getElementById("person"),
            totalscore : document.getElementById("totalscore"),
            pressure : document.getElementById("pressure")
        }
    }
    get_log(){
        console.log("총인원 :",this._numOfPerson);
        console.log("무게 :",this._weight);
        console.log("총점 :", this._score);
        console.log("");
    }
    testCacl(){
        this.getTestScore({
            origin : 9,
            half : 1,
            quater : 0,
            box : 2,
        });
        this.getTestScore({
            origin : 1,
            half : 0,
            quater : 0,
            box : 24,
        });
    }
    getTestScore(obj){
        this.init();
        Object.keys(obj)
            .forEach(key=>{
                for(let i =0; i<obj[key]; i++){
                    this.updateScore(key)
                }
            });
    }
}


class Game{
    constructor(blocks){
        this._stage = new Stage(
            document.querySelector(".stage > ul"))

        this._score = new Score();

        this._duration = 500;
        this._downInterval;
        this._weightInterval;
        this._weightDuration = 20000;

        this._blocks= new Block(blocks);
    }
    run(){
        this._score.init();
        this.updateScoreElem();
        this._stage.createStage();
        this.generateBlock();
        this.looseWeight();
    }
    isAvailable(target){
        if (!target || target.classList.contains("seized")) 
            return false;
        return true;
    }
    looseWeight(){
        clearInterval(this._weightInterval);
        this._weightInterval = setInterval(()=>{
            this._stage.deleteRow();
            this._score.looseWeight();
        },this._weightDuration);
    }
    updateScoreElem(){
        const score = this._score.getScore();
        const scoreElem = this._score.getScoreElem();
        Object.keys(scoreElem)
            .forEach(key=> scoreElem[key].innerText = score[key]);
    }
    updateScore(name){
        this._score.updateScore(name);
        this.updateScoreElem();
    }
    render(type =""){
        const {name, form, left, down, css} = 
            this._blocks.getTempMovingBlock();
        const personCss = this._blocks.setCss(css);

        this._stage.updateStage(personCss);
        const block = this._blocks.getBlock();
        
        Object.entries(block)
            .some(([key,value]) => {
                return value.some( b => {
                    const x = b[0] + left;
                    const y = b[1] + down;
                    const stage = this._stage.getStage();

                    const target = stage.childNodes[y]?
                        stage.childNodes[y].childNodes[0].childNodes[x]
                        : null;

                    if (this.isAvailable(target)){
                        target.classList.add(personCss[key], "moving");
                    }else{
                        this._blocks.resetBlock();
                        if (type === "retry"){
                            clearInterval(this._downInterval);
                            clearInterval(this._weightInterval);
                            this.showNotice();
                        }
                        setTimeout(()=>{
                            this.render("retry");
                            if(type === "ArrowDown"){
                                this._blocks.siezeBlock();
                                this.updateScore(name);
                                this._stage.checkMatch();
                                this.generateBlock();
                            }
                        },0);
                        return true;
                    }
                });
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
        this.render();
    }
    showNotice(){
        document.getElementById("notice")
            .classList.remove("dp-none");
    }
    handleBlock(key){
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
            if(e.target.tagName !== "BUTTON") 
                return;
            this._game.handleBlock(e.target.value);
            this._game.render(e.target.value);
        })
    }
}



const game = new Game(person_block);
new GameCtrl(game);

// game.run()


