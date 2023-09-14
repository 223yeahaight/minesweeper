window.onload = init;
var canvas;
var context;
var tileBoard = [];
var markcount = 0;

function init(){
    canvas = document.querySelector('canvas');
    context = canvas.getContext('2d');
    canvas.height = 700;
    canvas.width = 600; 
    
    
    generateBoard();
    generateBombList();
    generateBombs();
    countBombs();
    
    window.requestAnimationFrame(gameLoop);
}

var secondsPassed;
var oldTimeStamp;
var fps;

function gameLoop(timeStamp){
    secondsPassed = (timeStamp - oldTimeStamp) / 1000;
    oldTimeStamp = timeStamp;

    fps = Math.round(1 / secondsPassed);
    updateState();
    render();
    window.requestAnimationFrame(gameLoop);
}

function updateState(){

}

document.getElementById('canvasid').addEventListener('mousedown', (event => handleMouseClick(event)), false)
document.getElementById('canvasid').addEventListener("contextmenu", e => e.preventDefault(), false);

var mouseX;
var mouseY;

function handleMouseClick(event){
    mouseX = Math.floor((event.offsetX - 45) / 51);
    mouseY = Math.floor((event.offsetY - 150) / 51);
    if(event.which == 1){
        tileBoard[getTileNumber({tile:{
            x: mouseX,
            y: mouseY
        }})].type = 'vivid';
        if(tileBoard[getTileNumber({tile:{
            x: mouseX,
            y: mouseY
        }})].isBomb == true){
            alert("you lost ;(((");
            location.reload();
        }
        else if(tileBoard[getTileNumber({tile:{
            x: mouseX,
            y: mouseY
        }})].isBomb != true && tileBoard[getTileNumber({tile:{
            x: mouseX,
            y: mouseY
        }})].bombsAround == 0){
            revealAdjacentTiles(tileBoard[getTileNumber({tile:{
                x: mouseX,
                y: mouseY
            }})], tileBoard[getTileNumber({tile:{
                x: mouseX,
                y: mouseY
            }})])
        }
    }else if(event.which == 3){
        console.log('rmb click');
        mark(tileBoard[getTileNumber({tile:{
            x: mouseX,
            y: mouseY
        }})])
    }
    
}

function render(){
    context.fillStyle = 'grey';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawBoard(tileBoard);
}

function drawBoard(){
    for(var tile of tileBoard){
        tile.draw();
    }
}

function generateBoard(){
    for(var x = 0; x < 10; ++x){
        for(var y = 0; y <10; ++y){
            tileBoard.push(new Tile({postion:{
                x: x*51 + 45,
                y: y*51 + 150
            }}, {tile:{
                x: x,
                y: y
            }}))
        }
    }
}

var bombList = [[]];
var num;

function arrIncludes(arr1, arr2){
    ans = false;
    for(var i = 0; i < arr1.length; ++i){
        if(arr1[i][0] == arr2[0] && arr1[i][1] == arr2[1]){
            ans = true;
        }
    }
    return ans;
}

function generateBombList(){
    for(var i = 0; i < 20; ++i){
        num = [Math.floor(Math.random()*10), Math.floor(Math.random()*10)];
        while(arrIncludes(bombList, num)){
            num = [Math.floor(Math.random()*10), Math.floor(Math.random()*10)];
            console.log(num, 'already exist, rolling again');
        }
        console.log(num, ' is not in ', bombList);
        console.log('adding', num);
        bombList.push(num);
    }
    bombList.shift();
    console.log(bombList);
}

function generateBombs(){
    for(var i = 0; i < tileBoard.length; ++i){
        tileBoard[i].checkIfBomb();
    }
}

function countBombs(){
    for(var element of bombList){
        for(var i = -1; i < 2; ++i){
            for(var j = -1; j < 2; ++j){
                if(tileBoard[getTileNumber({tile:{
                    x: element[0] + i,
                    y: element[1] + j
                }})] != undefined){
                    tileBoard[getTileNumber({tile:{
                        x: element[0] + i,
                        y: element[1] + j
                    }})].bombsAround += 1;
                }
            }
        }
    }

}

function displayBombCount(){
    context.fillStyle = 'black';
    context.font = 'bold 40px Arial';
    for(var element of tileBoard){
        if(element.isBomb == false){
            context.fillText(element.bombsAround, element.postion.x + 15, element.postion.y + 40);
        }   
    }    
}

function getTileNumber({tile}){
    for(var i = 0; i < tileBoard.length; ++i){
        if(tile.x == tileBoard[i].tile.x && tile.y == tileBoard[i].tile.y){
            return i;
        }
    }
}

function revealAdjacentTiles(tile, lastTile){
    for(var i = -1; i < 2; ++i){
        for(var j = -1; j < 2; ++j){
            if(tileBoard[getTileNumber({tile:{
                x: tile.tile.x + i,
                y: tile.tile.y + j
            }})] != undefined && tileBoard[getTileNumber({tile:{
                x: tile.tile.x + i,
                y: tile.tile.y + j
            }})].type != 'vivid' && (tile.tile.x + i != lastTile.tile.x || tile.tile.y + j != lastTile.tile.y)){
                tileBoard[getTileNumber({tile:{
                    x: tile.tile.x + i,
                    y: tile.tile.y + j
                }})].type = 'vivid';
                if(tileBoard[getTileNumber({tile:{
                    x: tile.tile.x + i,
                    y: tile.tile.y + j
                }})].bombsAround == 0){
                    revealAdjacentTiles(tileBoard[getTileNumber({tile:{
                        x: tile.tile.x + i,
                        y: tile.tile.y + j
                    }})], tile);
                }    
            }
        }
    }
    
}

function mark(tile){
    if(tile.type == 'hidden' && markcount < 20){
        tile.type = 'marked';
        markcount++;
    }else if(tile.type == 'marked'){
        tile.type = 'hidden';
        markcount--;
    }
}

class Tile{
    constructor({postion},{tile}){
        this.postion = postion;
        this.width = 50;
        this.height = 50;
        this.tile = tile;
        this.type = 'hidden';
        this.bombsAround = 0;
        this.isBomb = false;
        
    }

    draw(){
        if(this.type == 'hidden'){
            context.fillStyle = 'lightblue';
            context.fillRect(this.postion.x, this.postion.y, this.width, this.height);
        }else if(this.type == 'vivid'){
            if(this.isBomb == true){
                context.fillStyle = 'red';
                context.fillRect(this.postion.x, this.postion.y, this.width, this.height);
                context.fillStyle = 'white'
                context.font = 'bold 40px Arial';
                context.fillText('B', this.postion.x + 11, this.postion.y + 40);
            }
            else{
                context.fillStyle = 'white';
                context.fillRect(this.postion.x, this.postion.y, this.width, this.height);
                context.fillStyle = 'black';
                context.font = 'bold 40px Courier';
                context.fillText(this.bombsAround, this.postion.x + 13, this.postion.y + 38);
            }
        }else if(this.type == 'marked'){
                context.fillStyle = 'lightblue';
                context.fillRect(this.postion.x, this.postion.y, this.width, this. height)
                context.fillStyle = 'navy';
                context.font = 'bold 40px Arial';
                context.fillText('B', this.postion.x + 11, this.postion.y + 40);

        }
        
        
        
    }

    checkIfBomb(){
        for(var i = 0; i < 20; i++){
            if(this.tile.x == bombList[i][0] && this.tile.y == bombList[i][1]){
                this.isBomb = true;
            }
        }
    }
        
    
}