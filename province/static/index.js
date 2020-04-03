gameDiv = document.getElementById('gameDiv')

var greenWorkers = []

class Player{
    constructor (name, money) {
        this.name = name
        this.money = money
        this.labor = 0
        this.vp = 0
        this.lender = false
    }
}

class Cell {
    constructor(resource){
        this.resource = resource
        this.occupants = ['green']
    }

    addWorker(type) {
        this.occupants.push(type)
    }

    removeWorker(type){
        const index = array.indexOf(type);
        this.occupants.splice(index, 1);
    }
}

class Building{
    constructor(lcost, mcost, name, vp){
        this.lcost = lcost
        this.mcost = mcost
        this.name = name
        this.vp = vp
        this.owners = []
    }
}

class Board{
    constructor(){
        this.buildings = []
        this.buildings.push(new Building(2, 3, 1, 'Mill'))
        this.buildings.push(new Building(5, 5, 2, 'Smithy'))
        this.buildings.push(new Building(2, 3, 1, 'Camp'))
        this.buildings.push(new Building(4, 4, 2, 'Village'))
        this.buildings.push(new Building(4, 4, 1, 'Harbor'))

        this.cells = []
        this.cells.push(new Cell('money'))
        this.cells.push(new Cell('labor'))
        this.cells.push(new Cell('labor'))
    }

    moveWorker(cellId, workerType) {
        /**
         * Moves the specified workerType (e.g. "green") located in the specified cellId
         * (can be 0, 1, 2) to the next cell. Returns the resource type of the next cell.
         */
        var index = this.cells[cellId].occupants.indexOf(workerType)
        var curCell = this.cells[cellId]
        var nextCell = this.cells[(cellId + 1) % this.cells.length]
        curCell.occupants.splice(index, 1)
        nextCell.occupants.push(workerType)
        return nextCell.resource
    }
}

class GameEngine{
    constructor(){
        this.players = []
        this.players.push(new Player('Alex', 2))
        this.players.push(new Player('Katrina', 3))

        this.board = new Board()
        this.curTurn = 0
        this.curPlayer = this.players[this.curTurn]

        this.workerMoves = []
    }

    commitWorkerMoves(){
        /**
         * Handles the resource collection phase of the game
         * Pass in an array workerMoves where every element indicates what workerType is moving from what cell
         * For example: [{cellId: 1, workerType: "green"}, {cellId: 0, workerType: "camp"}]
         * Indicates that in cell 1 (labor), the green worker moves one cell and that 
         * in cell 0 (money), the camp worker moves one cell
         */
        console.log('commiting '+this.workerMoves.length + ' moves')
        var resources = {
            'labor': 0,
            'money': 0
        }
        for (var i=0; i<this.workerMoves.length; i++){
            var cellId = this.workerMoves[i].cellId
            var workerType = this.workerMoves[i].workerType
            var resource = this.board.moveWorker(cellId, workerType)
            resources[resource] += 1            
        }
        this.workerMoves = []
    }

    addWorkerMove(workerType, cellId) {
        var workerMove = {
            cellId: cellId,
            workerType: workerType
        } 
        this.workerMoves.push(workerMove)
    }
}

var cellLocations = {
    money: {
        0: {x: 100, y: 200, occupied: true},
        1: {x: 100, y: 270, occupied: false},
        2: {x: 170, y: 270, occupied: false},
    },
    labor1: {
        0: {x: 200, y: 100, occupied: true},
        1: {x: 200, y: 170, occupied: false},
        2: {x: 270, y: 170, occupied: false},
    },
    labor2: {
        0: {x: 300, y: 200, occupied: true},
        1: {x: 300, y: 270, occupied: false},
        2: {x: 370, y: 270, occupied: false},
    },
    getNext: function(cur){
        switch (cur){
            case 'money': return 'labor1'
            case 'labor1': return 'labor2'
            case 'labor2': return 'money'
            default: return undefined
        }
    },
    getAvailable: function(cell){
        for (var i=0; i<3; i++){
            if (!this[cell][i].occupied){
                return i;
            }
        }
        return 3;
    }
}

ge = new GameEngine()
function createWorker(curCell) {
    this.image = new Image(60,60)
    this.image.workerType = 'green'
    this.image.src = 'green_worker.jpg'
    this.image.style.position='absolute'
    this.image.style.left=cellLocations[curCell][0].x+"px"
    this.image.style.top=cellLocations[curCell][0].y+"px"
    this.image.curCell = curCell
    this.image.cellId = 0
    if (curCell === 'money'){
        this.image.cellId = 0
    } else if (curCell === 'labor1') {
        this.image.cellId = 1
    } else if (curCell === 'labor2') {
        this.image.cellId = 2
    }
    
    this.image.onclick = function(){
        // clear currently occupied spot
        var avail = cellLocations.getAvailable(this.curCell)
        cellLocations[this.curCell][avail-1].occupied = false

        // move image to next spot
        this.curCell = cellLocations.getNext(this.curCell)
        avail = cellLocations.getAvailable(this.curCell)
        this.style.left = cellLocations[this.curCell][avail].x + "px"
        this.style.top = cellLocations[this.curCell][avail].y + "px"
        cellLocations[this.curCell][avail].occupied = true

        ge.addWorkerMove(this.workerType, this.cellId)
        this.cellId = (this.cellId + 1) % 3
    }
    gameDiv.appendChild(this.image)
}


greenWorkers.push(new createWorker('money'))
greenWorkers.push(new createWorker('labor1'))
greenWorkers.push(new createWorker('labor2'))

var gameOver = false
var curPlayer = 0


