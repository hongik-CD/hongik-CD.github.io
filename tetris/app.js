class Stage{
    constructor(pos){
        this._x = 30;
        this._y = 60;
        this._pos = pos;
        this.createStage();
        this._time;
        this._timeElem = document.getElementById("second")
        this._timeInterval;
    }
    setTime(){
        this._time = 120;
    }
    getTime (){
        return this._time;
    }
    countTime(){
        this.setTime();
        this._timeElem.innerText= this._time;
        this.stopTime();

        this._timeInterval = setInterval(()=>{
            this._time -= 1;
            this._timeElem.innerText = this._time;
        },1000);
    }
    stopTime(){
        clearInterval(this._timeInterval);
        this.setTime();
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
            left : 30,
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
    updateBlock({form, left, down, name}){
        this._movingItem.down = down;
        this._movingItem.form = form;
        this._movingItem.left = left;
        this._movingItem.name = name;
    }
    newBlock(){
        this._movingItem.name = "origin";
        this._movingItem.css = this._cssName[Math.floor(Math.random()*this._cssName.length)];
        this._movingItem.form= Math.floor(Math.random()*this._blocks.origin.length);
        this._movingItem.left= 5;
        this._movingItem.down= 0;
        this._tempMovingItem = {...this._movingItem};
    }
    setCss(key){
        return this._personCss[key];
    }
    getBlock(){
        const {name, form} = this._tempMovingItem;
        return this._blocks[name][form];
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
        const {name, form} = this._tempMovingItem;

        if(name === "box" && form === 3){
            this._tempMovingItem.form = 0;
        }
        else if(name === "origin"){
            this._tempMovingItem.name = "half";
            this._tempMovingItem.form = 0;
        }
        else if (name === "half"){
            this._tempMovingItem.name = "box";
            this._tempMovingItem.form = 0;
        }
        else{
            this._tempMovingItem.form +=1;
        }
    }
}


class Score{
    constructor(){
        this._score;
        this._totalScore;

        this._weight;
        this._pressure;
        this._gravity;
        this._numOfPerson;

        this._form = {
            origin : 300,
            half : 600,
            box : 900,
        }
        // this.testCacl();
    }
    init(){
        this._totalScore =0;
        this._score = 0;
        this._weight = 70;
        this._numOfPerson = 0;
        this._gravity = 1.2;
        this._pressure = 0;
    }
    getScore(){
        return{
            person : this._numOfPerson,
            totalscore : this._totalScore,
            pressure : this._pressure,
            endscore : this._totalScore,
        }
    }
    looseWeight(){
        if (this._numOfPerson < 1) return;

        this._numOfPerson -= 1;
        this.calcScore();
    }
    applyGravity(){
        this._pressure = 0;
        for(let i=0; i < this._numOfPerson; i++){
            const num = this._gravity*i
            this._pressure += Math.floor(num*this._weight)
        }
    }
    updateScore(form){
        this._score += this._form[form];
        this._numOfPerson += 1;
        this.calcScore();
    }
    calcScore(){
        if (this._numOfPerson === 0) return 0;
        this.applyGravity();
        this._totalScore = this._score - this._pressure;
        // this.get_log();
    }
    getScoreElem(){
        return {
            person : document.getElementById("person"),
            totalscore : document.getElementById("totalscore"),
            pressure : document.getElementById("pressure"),
            endscore : document.getElementById("endscore")
        }
    }
    get_log(){
        console.log("총인원 :",this._numOfPerson);
        console.log("무게 :",this._weight);
        console.log("압박 :",this._pressure);
        console.log("가중치 :",this._gravity);
        console.log("점수 :", this._score);
        console.log("총점 :", this._totalScore);
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
        this._weightInterval;
        this._weightDuration = 25000;

        this._blocks= new Block(blocks);
    }
    run(){
        this._score.init();
        this.updateScoreElem();
        this._stage.createStage();
        this.generateBlock();
        this._stage.countTime();
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
            this.updateScoreElem();
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
        if (this._stage.getTime() === 0){
            this.stopGame();
        }
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
                            this.stopGame();
                            return true;
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
        this._blocks.updateBlock({name, down,left,form});
    }
    stopGame(){
        clearInterval(this._downInterval);
        clearInterval(this._weightInterval);
        this._stage.stopTime();
        this.showNotice();
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
