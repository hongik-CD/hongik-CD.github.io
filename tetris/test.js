

const stage = document.querySelector(".stage > ul");

const GAME_COLS = 10;
const GAME_ROWS = 20;


let score = 0;
let duration = 500;
let downInterval;
let tempMovingItem;



const movingItem ={
    name : "",
    form : 0,
    down: 0,
    left : 0
}

init();

function init(){
    tempMovingItem = {...movingItem};
    for(let i =0; i < GAME_ROWS; i++){
        prependNewLine();
    }
    generateNewBlock();
}


function prependNewLine(){
    const li  = document.createElement("li");
    const ul = document.createElement("ul");
    
    for(let j = 0; j< GAME_COLS; j++){
        const matrix = document.createElement("li");
        ul.prepend(matrix);
    }
    li.prepend(ul);
    stage.prepend(li);
}



function renderBlocks(type = ""){
    const {name, form, left, down} = tempMovingItem;

    const moveBlocks =  document.querySelectorAll(".moving");
    moveBlocks.forEach(item =>{
        item.classList.remove(name,"moving");
    });

    blocks[name][form].some(block=>{
        const x =block[0]+ left;
        const y = block[1]+ down;

        const target = stage.childNodes[y]? 
            stage.childNodes[y].childNodes[0].childNodes[x]
            : null;
        const isAvailable = checkEmpty(target);

        if (isAvailable){
            target.classList.add(name, "moving")
        }
        else{
            tempMovingItem = {...movingItem};
            console.log(type)

            setTimeout(()=>{
                renderBlocks()
                if(type === "down"){
                    console.log(2)
                    siezeBlock();
                    
                }
            },0)
            return true;
        }

    })
    movingItem.down =down;
    movingItem.left = left;
    movingItem.form = form;

}

function siezeBlock(){
    document.querySelectorAll(".moving")
    .forEach(item =>{
        item.classList.remove("moving");
        item.classList.add("seized");
    });
    generateNewBlock()
}

function generateNewBlock(){
    // clearInterval(downInterval);
    // downInterval = setInterval(() =>{
    //     moveBlocks("down", 1);
    // },duration);

    const blockArray = Object.keys(blocks);
    const rIndex = Math.floor(Math.random()*blockArray.length);
    movingItem.name = blockArray[rIndex]
    movingItem.down = 0;
    movingItem.left = 3;
    movingItem.form = 0;
    tempMovingItem = {...movingItem};
    renderBlocks();
}

function checkEmpty(target){
    if(!target || target.classList.contains("seized"))
        return false;
    return true;
}

function moveBlocks(type, num) {
    tempMovingItem[type] += num;
    renderBlocks(type);
}

function changeDirection(){
    const form = tempMovingItem.form;
    form ===3? tempMovingItem.form = 0:
        tempMovingItem +=1;
    renderBlocks();
}
document.addEventListener("keydown", e=>{
        if (e.key === "ArrowRight") 
            moveBlocks("left", 1);
        else if (e.key === "ArrowLeft")
            moveBlocks("left", -1);
        else if (e.key === "ArrowDown")
            moveBlocks("down", 1);
        else if (e.key === "ArrowUp")
            this._blocks.changeDirection();
        // else if (key === "Space")
        //     this.dropBlock();
        else return;
})