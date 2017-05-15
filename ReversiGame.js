var rowsCount = 8
var columnsCount = 8
var colorEnum =
{
    BLANK:0,
    WHITE:1,
    BLACK:2
}

//Black starts
var startPlayer = colorEnum.BLACK
var currentPlayer = startPlayer

function getStartPlayer()
{
    if(startPlayer === colorEnum.BLACK)
    {
        startPlayer = colorEnum.WHITE
        currentPlayer = startPlayer
    }
    else
    {
        startPlayer = colorEnum.BLACK
        currentPlayer = startPlayer
    }
}

function nextPlayer()
{
    if(currentPlayer === colorEnum.BLACK)
        currentPlayer = colorEnum.WHITE
    else
        currentPlayer = colorEnum.BLACK
}

function setPlayer(player)
{
    currentPlayer = player
}

function getPlayer()
{
    return currentPlayer
}

function otherPlayer()
{
    var otherPlayer
    if(currentPlayer === colorEnum.BLACK)
        otherPlayer = colorEnum.WHITE
    else
        otherPlayer = colorEnum.BLACK
    return otherPlayer
}

// return all the direction path differences
// adding these to a position will give all paths in each direction
// for 8x8 board
function initDirections()
{
    var N =  [[ 0, -1], [ 0, -2], [ 0, -3], [ 0, -4], [ 0, -5], [ 0, -6], [ 0, -7]]
    var S =  [[ 0,  1], [ 0,  2], [ 0,  3], [ 0,  4], [ 0,  5], [ 0,  6], [ 0,  7]]
    var E =  [[-1,  0], [-2,  0], [-3,  0], [-4,  0], [-5,  0], [-6,  0], [-7,  0]]
    var W =  [[ 1,  0], [ 2,  0], [ 3,  0], [ 4,  0], [ 5,  0], [ 6,  0], [ 7,  0]]
    var NE = [[-1, -1], [-2, -2], [-3, -3], [-4, -4], [-5, -5], [-6, -6], [-7, -7]]
    var NW = [[ 1, -1], [ 2, -2], [ 3, -3], [ 4, -4], [ 5, -5], [ 6, -6], [ 7, -7]]
    var SE = [[-1,  1], [-2,  2], [-3,  3], [-4,  4], [-5,  5], [-6,  6], [-7,  7]]
    var SW = [[ 1,  1], [ 2,  2], [ 3,  3], [ 4,  4], [ 5,  5], [ 6,  6], [ 7,  7]]

    var directions = [N, S, E, W, NE, NW, SE, SW]
    return directions
}

// constructor function
function Reversi()
{
    var board = new Array(rowsCount * columnsCount)

    board.index = function(row, column) { return row*columnsCount+column }
    board.row = function(idx) { return (idx / columnsCount) |0 }
    board.col = function(idx) { return idx % columnsCount }
    board.set1 = function(row, column)
    {
        this[this.index(row,column)] = currentPlayer
    }
    board.set2 = function(index)
    {
        this[index] = currentPlayer
    }

    board.get = function(row, column) { return this[this.index(row,column)] }

    board.getPlayerScore = function(player)
    {
        var score = 0
        for(var i = 0; i < rowsCount; ++i)
            for(var j = 0; j < columnsCount; ++j)
            {
                if(this[this.index(i,j)] === player)
                    ++score
            }
        return score
    }

    board.initBoard = function()
    {
        var left = Math.floor(columnsCount / 2) - 1
        var top  = Math.floor(rowsCount / 2) - 1

        for(var i = 0; i < rowsCount; ++i)
        {
            for(var j = 0; j < columnsCount; ++j)
            {
                this[this.index(i,j)] = colorEnum.BLANK
            }
        }

        // middle 4
        this[this.index(left,top)] = colorEnum.WHITE
        this[this.index(left + 1,top)] = colorEnum.BLACK
        this[this.index(left,top + 1)] = colorEnum.BLACK
        this[this.index(left + 1,top + 1)] = colorEnum.WHITE
        return this
    }

    board.isValidMove = function(row, column)
    {
        var takenPos = []
        if(!this.isValidBoardPos(row, column))
            return []
        var other = otherPlayer()
        var directions = initDirections()
        if(this[this.index(row, column)] === colorEnum.BLANK)
        {
            for(var i = 0; i < directions.length; ++i)
            {
                var direction = directions[i]
                var pos = direction[0]
                var checkRow = row + pos[0]
                var checkCol = column + pos[1]

                if(!this.isValidBoardPos(checkRow, checkCol))
                    continue;

                if(this[this.index(checkRow, checkCol)] === other)
                {
                    var posFromDirection = [this.index(checkRow, checkCol)]
                    for(var j = 1; j < direction.length; ++j)
                    {
                        pos = direction[j]
                        checkRow = row + pos[0]
                        checkCol = column + pos[1]

                        if(!this.isValidBoardPos(checkRow, checkCol))
                        {
                            posFromDirection = []
                            break;
                        }

                        var index = this.index(checkRow, checkCol)


                        if(this[index] === other)
                        {
                            if(j === direction.length - 1)
                                posFromDirection = []
                            else
                                posFromDirection.push(this.index(checkRow, checkCol))
                        }
                        else if(this[index] === currentPlayer)
                            break
                        else
                        {
                            posFromDirection = []
                            break
                        }
                    }
                    for(var k = 0; k < posFromDirection.length; ++k)
                        takenPos.push(posFromDirection[k])
                }
            }
        }
        return takenPos
    }

    board.doMove = function(row, column, blocks)
    {
        this.set1(row, column)
        for(var i = 0; i < blocks.length; ++i)
        {
           var pos = blocks[i]
           this.set2(pos)
        }
        return this
    }

    board.hasMoves = function()
    {
        var currentPlayerScore = this.getPlayerScore(currentPlayer)
        if(currentPlayerScore === 0)
            return false
        for(var i = 0; i < this.length; ++i)
        {
            var takenPos = this.isValidMove(this.row(i), this.col(i))
            if(takenPos.length > 0)
            {
                return true
            }
        }
        return false
    }

    board.info = function(blackScore, whiteScore)
    {
        if(currentPlayer !== colorEnum.BLANK)
        {
            if(currentPlayer === colorEnum.BLACK)
                return "Black's turn."
            else
                return "White's turn."
        }

        if(blackScore > whiteScore)
            return "Win Black."
        else if(whiteScore > blackScore)
            return "Win White."
        else
            return "Draw."
    }

    board.isValidBoardPos = function(row, column)
    {
        if(row < 0 || row >= rowsCount || column < 0 || column >= columnsCount)
            return false
        return true
    }

    return board.initBoard()
}
