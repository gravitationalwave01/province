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
        this.buildings = {
            'mill': new Building(2, 3, 1, 'Mill'),
            'camp': new Building(2, 3, 1, 'Camp')
        }
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
        document.getElementById('player').textContent = 'Current Player: '+this.curPlayer.name
        document.getElementById('money').textContent = 'Money: '+ this.curPlayer.money
        document.getElementById('labor').textContent = 'Labor: '+ this.curPlayer.labor
    }

    commitWorkerMoves(){
        /**
         * Handles the resource collection phase of the game
         * Uses this.workerMoves array where every element indicates what workerType is moving from what cell
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
        this.curPlayer.money += resources['money']
        this.curPlayer.labor += resources['labor']
        document.getElementById('money').textContent = 'Money: '+ this.curPlayer.money
        document.getElementById('labor').textContent = 'Labor: '+ this.curPlayer.labor
    }

    addWorkerMove(workerType, cellId) {
        var workerMove = {
            cellId: cellId,
            workerType: workerType
        } 
        this.workerMoves.push(workerMove)
    }

    laborForMoney(){
        /**
         * For the current player, trades 2 labor for 1 money
         * Returns undefined if player doesn't have 2 labor
         */
        if (this.curPlayer.labor < 2){
            return
        }
        this.curPlayer.labor -= 2
        this.curPlayer.money += 1
        document.getElementById('money').textContent = 'Money: '+ this.curPlayer.money
        document.getElementById('labor').textContent = 'Labor: '+ this.curPlayer.labor
    }

    passTurn(){
        this.curPlayer.labor = 0
        this.curTurn+=1
        this.curPlayer = this.players[this.curTurn%2]
        if (this.board.buildings['mill'].owners.includes(this.curPlayer.name)){
            this.curPlayer.labor+=1
        }
        document.getElementById('player').textContent = 'Current Player: '+this.curPlayer.name
        document.getElementById('money').textContent = 'Money: '+ this.curPlayer.money
        document.getElementById('labor').textContent = 'Labor: '+ this.curPlayer.labor
    }

    build(building){
        // check that player has enough resources
        if (this.curPlayer.labor < this.board.buildings[building].lcost ||
            this.curPlayer.money < this.board.buildings[building].mcost) {
                return;
            }
        this.board.buildings[building].owners.push(this.curPlayer.name)
        this.curPlayer.money -= this.board.buildings[building].mcost
        this.curPlayer.labor -= this.board.buildings[building].lcost
        document.getElementById('money').textContent = 'Money: '+ this.curPlayer.money
        document.getElementById('labor').textContent = 'Labor: '+ this.curPlayer.labor            
    }
}

class UI {
    constructor(){
        this.cells = []
        for (var i=0; i<3; i++){
            var image = new Image(60,60)
            image.src = 'green_worker_1.jpg'
            image.style.position='absolute'
            switch (i){
                case 0:
                    image.style.left = '100px'
                    image.style.top = '200px'
                    image.onclick = this.moveGreenWorkerCell0
                    break
                case 1:
                    image.style.left = '200px'
                    image.style.top = '100px'
                    image.onclick = this.moveGreenWorkerCell1
                    break
                case 2:
                    image.style.left = '300px'
                    image.style.top = '200px'
                    image.onclick = this.moveGreenWorkerCell2
                    break
            }
            this.cells.push({'green': {img: image, num: 1}})
            gameDiv.appendChild(image)
        }
    }

    moveWorker(cellId, workerType) {
        /**
         * Updates the current image in cellId[workerType] to refect a decrease in 
         * the number of workers present in this cell, and updates (cellId+1)[workerType]
         * image to reflect a new worker.
         * E.g. if there were 2 green workers in cellId and 1 in cellId+1, then the image 
         * of cellId will switch to green_worker_1.jpg, and the image in CellId+1 will
         * switch to green_worker_2.jpg
         * 0 workers is represented as a fully transparent image.
         * TODO: it's not great the the current state of the board is stored both in this
         *   class AND in the board class. Seems like data duplication, and might lead
         *   to data divergence. Would be better if this UI method and class were more dumb. 
         */
        var image = ui.cells[cellId][workerType].img
        if (ui.cells[cellId][workerType].num === 0){
            return
        }

        // remove the specified worker from its current spot
        var num_remaining = ui.cells[cellId][workerType].num - 1
        if (num_remaining === 0){
            image.style.opacity = 0  //make image transparent
        } else {
            image.src = workerType + '_worker_' + num_remaining + '.jpg'
        }
        ui.cells[cellId][workerType].num -= 1

        // update the image of the target cell
        var newCellId = (cellId + 1) % 3
        var numHere = ui.cells[newCellId][workerType].num
        if (numHere === 0){
            ui.cells[newCellId][workerType].img.style.opacity = 1
        } else {
            var newNum = numHere + 1
            ui.cells[newCellId][workerType].img.src = workerType+'_worker_'+newNum+'.jpg'
        }
        ui.cells[newCellId][workerType].num += 1

        ge.addWorkerMove(workerType, cellId)
    }

    // TODO: replace this with partials/currying
    moveGreenWorkerCell0(){
        ui.moveWorker(0, "green")
    }

    moveGreenWorkerCell1(){
        ui.moveWorker(1, "green")
    }

    moveGreenWorkerCell2(){
        ui.moveWorker(2, "green")
    }
}

ge = new GameEngine()
ui = new UI()

var gameOver = false
var curPlayer = 0
